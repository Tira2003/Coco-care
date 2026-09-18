import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
  IdCard,
  Lock,
  LockKeyhole,
  User,
  Phone,
  Mail,
  MapPin,
  Trees,
  Info,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import { isAxiosError } from 'axios'
import { useAuth, getRoleHomePath } from '@/contexts/AuthContext'
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'
import type { User as UserType } from '@/types'

const STEP_BRAND_INFO = {
  1: {
    eyebrow: 'Step 1 · About you',
    title: (
      <>
        Tell us <span className="font-['Instrument_Serif',serif] italic font-normal text-[#C9F169]">who you are.</span>
      </>
    ),
    sub: 'Your NIC and mobile let agricultural officers verify reports and reach you about your submissions.',
  },
  2: {
    eyebrow: 'Step 2 · Your farm',
    title: (
      <>
        Where does your grove <span className="font-['Instrument_Serif',serif] italic font-normal text-[#C9F169]">grow?</span>
      </>
    ),
    sub: 'Your district powers the live outbreak heatmap and radius-based disease alerts for your area.',
  },
  3: {
    eyebrow: 'Step 3 · Security',
    title: (
      <>
        One last step - <span className="font-['Instrument_Serif',serif] italic font-normal text-[#C9F169]">secure your account.</span>
      </>
    ),
    sub: 'Pick a strong password. Your reports, farm data and alerts stay private to you and your officers.',
  },
}

const PW_LABELS = [
  'Use at least 8 characters',
  'Weak password',
  'Fair - could be stronger',
  'Good password',
  'Strong password',
]

const PW_COLORS = [
  'text-[#5C6B60]',
  'text-[#E5484D]',
  'text-[#F5A524]',
  'text-[#7FA81B]',
  'text-[#3DA35D]',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [createdUser, setCreatedUser] = useState<UserType | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    nic: '',
    mobile: '',
    email: '',
    district: '',
    plantationSize: '',
    farmName: '',
    password: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  const nicRe = /^([0-9]{9}[vVxX]|[0-9]{12})$/
  const mobileRe = /^(?:0?7\d{8}|\+947\d{8})$/

  const isNameValid = /^[A-Za-z][A-Za-z .]{2,}$/.test(formData.fullName.trim())
  const isNicValid = nicRe.test(formData.nic.trim())
  const isMobileValid = mobileRe.test(formData.mobile.replace(/\s/g, ''))
  const isEmailValid = !formData.email.trim() || emailRe.test(formData.email.trim())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    if (name === 'nic') {
      setFormData((prev) => ({ ...prev, nic: value.replace(/\s/g, '') }))
    } else if (name === 'mobile') {
      setFormData((prev) => ({ ...prev, mobile: value.replace(/[^\d+ ]/g, '') }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  // Password score calculation (0 to 4)
  const pw = formData.password
  const pwChecks = {
    len: pw.length >= 8,
    case: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    num: /\d/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
  }
  const pwScore = pw ? Math.max(1, Object.values(pwChecks).filter(Boolean).length) : 0

  const validateStep1 = () => {
    setTouched({ fullName: true, nic: true, mobile: true, email: true })
    setError('')
    if (!isNameValid) {
      setError('Please enter your full name (letters only, min 3 characters).')
      return false
    }
    if (!isNicValid) {
      setError('Invalid NIC - use 9 digits + V (e.g. 901234567V) or 12 digits.')
      return false
    }
    if (!isMobileValid) {
      setError('Enter a valid mobile - 07XXXXXXXX or +947XXXXXXXX.')
      return false
    }
    if (formData.email.trim() && !emailRe.test(formData.email.trim())) {
      setError("That email doesn't look right.")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    setTouched((prev) => ({ ...prev, district: true, plantationSize: true }))
    setError('')
    if (!formData.district) {
      setError('Please select your district.')
      return false
    }
    if (!formData.plantationSize) {
      setError('Please select your plantation size.')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    if (step === 3) setStep(2)
    else if (step === 2) setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password.length < 8 || pwScore < 2) {
      setError('Password needs at least 8 characters including letters and numbers.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (!agreedTerms) {
      setError('Please accept the Terms of Service to continue.')
      return
    }

    setLoading(true)
    try {
      const emailTrimmed = formData.email.trim()
      const acreageBySize: Record<string, number> = {
        'Less than 1 acre': 0.5,
        '1-5 acres': 3,
        '5-20 acres': 12.5,
        '20-50 acres': 35,
        'More than 50 acres': 60,
      }
      const acreage = acreageBySize[formData.plantationSize] ?? 1
      const farmName = formData.farmName.trim() || `${formData.fullName.trim()}'s Farm`
      const user = await register({
        role: 'farmer',
        username: formData.nic.trim(),
        name: formData.fullName.trim(),
        phone: formData.mobile.trim(),
        assignedRegion: formData.district.trim(),
        password: formData.password,
        farms: [
          {
            name: farmName,
            location: formData.district.trim(),
            latitude: 0,
            longitude: 0,
            acreage,
            treeCount: Math.round(acreage * 64),
          },
        ],
        ...(emailTrimmed ? { email: emailTrimmed } : {}),
      })
      setCreatedUser(user)
    } catch (err) {
      if (isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? 'Registration failed. Please check your details and try again.')
      } else {
        setError('Registration failed. Please check your details and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const currentBrand = STEP_BRAND_INFO[step]
  const firstName = (formData.fullName.trim().split(/\s+/)[0]) || 'Grower'
  const nicVal = formData.nic.trim()
  const maskedNic = nicVal.length === 12
    ? nicVal.slice(0, 4) + '****' + nicVal.slice(-4)
    : nicVal.length >= 9
    ? nicVal.slice(0, 3) + '*****' + nicVal.slice(-1).toUpperCase()
    : nicVal

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F6F7F2] font-['Inter',system-ui,sans-serif] selection:bg-[#C9F169] selection:text-[#0C281B] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[700px] h-[500px] bg-[radial-gradient(circle_at_70%_20%,#E9F3D2_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[600px] h-[500px] bg-[radial-gradient(circle_at_30%_80%,#E4EFDC_0%,transparent_60%)]" />

      {/* Main Card Shell */}
      <div className="w-full max-w-[1060px] bg-white border border-[#E4E8DC] rounded-[28px] shadow-[0_30px_80px_rgba(16,36,26,0.18)] grid grid-cols-1 lg:grid-cols-[430px_1fr] overflow-hidden relative z-10">
        
        {/* ================= LEFT BRAND PANEL ================= */}
        <aside className="hidden lg:flex relative text-white p-11 flex-col justify-between bg-gradient-to-br from-[#0C281B] via-[#123524] to-[#1B4A31] overflow-hidden">
          <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(201,241,105,0.22),transparent_65%)] blur-sm" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(201,241,105,0.10),transparent_60%)]" />

          {/* Header Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-2xl bg-[#123524] border border-white/15 flex items-center justify-center p-2 transition-transform group-hover:scale-105">
                <img src="/new logo.svg" alt="Coco Care logo" className="h-6 w-6 object-contain" />
              </span>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-white">
                Coco<b className="text-[#C9F169]">Care</b>
              </span>
            </Link>
          </div>

          {/* Dynamic Content Panel per Step - positioned slightly down towards bottom */}
          <AnimatePresence mode="wait">
            <motion.div
              key={createdUser ? 'success' : step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 mt-auto mb-12 py-4"
            >
              {createdUser ? (
                <>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9F169] mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
                    All Set
                  </span>
                  <h2 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-[1.8rem] font-semibold leading-snug my-2 text-white">
                    Ready to monitor <span className="font-['Instrument_Serif',serif] italic font-normal text-[#C9F169]">your plantation</span>.
                  </h2>
                  <p className="text-[#B9C9B4] text-sm leading-relaxed max-w-sm">
                    Your farm has been registered. You can now access diagnostics, weather forecasts, and CRI circulars.
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9F169] mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
                    {currentBrand.eyebrow}
                  </span>
                  <h2 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-[1.8rem] font-semibold leading-snug my-2 text-white">
                    {currentBrand.title}
                  </h2>
                  <p className="text-[#B9C9B4] text-sm leading-relaxed max-w-sm">
                    {currentBrand.sub}
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </aside>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          
          {/* Mobile Brand Link */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#123524] flex items-center justify-center p-1.5 text-[#C9F169]">
                <img src="/new logo.svg" alt="Coco Care logo" className="h-5 w-5 object-contain" />
              </span>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A]">
                Coco<b className="text-[#7FA81B]">Care</b>
              </span>
            </Link>
          </div>

          {/* If Account Created: SHOW SUCCESS VIEW */}
          {createdUser ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-4"
            >
              {/* Success Ring Animation */}
              <div className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center">
                <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="46" stroke="#E9EEE0" strokeWidth="4" fill="none" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="#7FA81B"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={290}
                    initial={{ strokeDashoffset: 290 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.8 }}
                    className="w-12 h-12 rounded-full bg-[#C9F169] text-[#123524] flex items-center justify-center shadow-md"
                  >
                    <Check className="h-6 w-6 stroke-[3]" />
                  </motion.span>
                </div>
              </div>

              <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl font-bold text-[#10241A] mb-2">
                Welcome to Coco Care,{' '}
                <span className="font-['Instrument_Serif',serif] italic font-normal text-[#7FA81B]">
                  {firstName}
                </span>
                !
              </h1>
              <p className="text-[#5C6B60] text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                Your farmer workspace is ready. Run your first leaf diagnosis or explore the outbreak map anytime.
              </p>

              {/* Summary Chips */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#E4E8DC] px-3.5 py-1.5 rounded-full text-[#10241A] shadow-sm">
                  <User className="h-3.5 w-3.5 text-[#123524]" />
                  <span>{firstName}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#E4E8DC] px-3.5 py-1.5 rounded-full text-[#10241A] shadow-sm">
                  <MapPin className="h-3.5 w-3.5 text-[#123524]" />
                  <span>{formData.district}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#E4E8DC] px-3.5 py-1.5 rounded-full text-[#10241A] shadow-sm">
                  <Trees className="h-3.5 w-3.5 text-[#123524]" />
                  <span>{formData.plantationSize}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-[#E4E8DC] px-3.5 py-1.5 rounded-full text-[#10241A] shadow-sm">
                  <IdCard className="h-3.5 w-3.5 text-[#123524]" />
                  <span>{maskedNic}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(getRoleHomePath(createdUser.role))}
                className="w-full sm:w-auto min-w-[240px] py-3.5 px-8 rounded-full bg-[#123524] text-white font-semibold text-sm sm:text-base hover:bg-[#0C281B] shadow-lg transition-all inline-flex items-center justify-center gap-2 group"
              >
                <span>Go to Farmer Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="mt-4 text-xs text-[#5C6B60]">
                A verification SMS will arrive shortly on your mobile.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Normal 3-Step Form View */}
              <header className="mb-6">
                <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-bold tracking-tight text-[#10241A]">
                  Create your{' '}
                  <span className="font-['Instrument_Serif',serif] italic font-normal text-[#7FA81B]">
                    account
                  </span>
                </h1>
                <p className="text-[#5C6B60] text-sm sm:text-base mt-2">
                  Three quick steps - about you, your farm, and your security. Takes about a minute.
                </p>
              </header>

              {/* Stepper Progress */}
              <div className="grid grid-cols-3 gap-2 my-6 relative">
                <div
                  onClick={() => step > 1 && setStep(1)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer select-none"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === 1
                        ? 'border-2 border-[#123524] text-[#123524] bg-white ring-4 ring-[#123524]/10'
                        : step > 1
                        ? 'bg-[#123524] text-[#C9F169]'
                        : 'border border-[#E4E8DC] text-[#5C6B60] bg-[#F6F7F2]'
                    }`}
                  >
                    {step > 1 ? <Check className="h-4 w-4 stroke-[3]" /> : '1'}
                  </div>
                  <span className={`text-xs font-semibold ${step === 1 ? 'text-[#10241A]' : 'text-[#5C6B60]'}`}>
                    About you
                  </span>
                </div>

                <div
                  onClick={() => step > 2 && setStep(2)}
                  className={`flex flex-col items-center gap-1.5 ${step >= 2 ? 'cursor-pointer' : 'cursor-default'} select-none`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === 2
                        ? 'border-2 border-[#123524] text-[#123524] bg-white ring-4 ring-[#123524]/10'
                        : step > 2
                        ? 'bg-[#123524] text-[#C9F169]'
                        : 'border border-[#E4E8DC] text-[#5C6B60] bg-[#F6F7F2]'
                    }`}
                  >
                    {step > 2 ? <Check className="h-4 w-4 stroke-[3]" /> : '2'}
                  </div>
                  <span className={`text-xs font-semibold ${step === 2 ? 'text-[#10241A]' : 'text-[#5C6B60]'}`}>
                    Your farm
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 cursor-default select-none">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === 3
                        ? 'border-2 border-[#123524] text-[#123524] bg-white ring-4 ring-[#123524]/10'
                        : 'border border-[#E4E8DC] text-[#5C6B60] bg-[#F6F7F2]'
                    }`}
                  >
                    3
                  </div>
                  <span className={`text-xs font-semibold ${step === 3 ? 'text-[#10241A]' : 'text-[#5C6B60]'}`}>
                    Security
                  </span>
                </div>
              </div>

              {error ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                {/* ================= STEP 1 ================= */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suName">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                          <User className="h-4 w-4 text-[#5C6B60]" />
                        </span>
                        <input
                          id="suName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Akeel Bandara"
                          autoComplete="name"
                          className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                          required
                        />
                        {isNameValid && (
                          <span className="absolute right-3.5 text-[#3DA35D]">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      {touched.fullName && !isNameValid && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Enter your full name (letters only, min 3 characters)
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suNic">
                          NIC Number
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                            <IdCard className="h-4 w-4 text-[#5C6B60]" />
                          </span>
                          <input
                            id="suNic"
                            type="text"
                            name="nic"
                            value={formData.nic}
                            onChange={handleChange}
                            placeholder="199012345678"
                            autoComplete="off"
                            maxLength={12}
                            className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                            required
                          />
                          {isNicValid && (
                            <span className="absolute right-3.5 text-[#3DA35D]">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        {touched.nic && !isNicValid && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Use 9 digits + V or 12 digits
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suMobile">
                          Mobile Number
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                            <Phone className="h-4 w-4 text-[#5C6B60]" />
                          </span>
                          <input
                            id="suMobile"
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="077 123 4567"
                            autoComplete="tel"
                            maxLength={12}
                            className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                            required
                          />
                          {isMobileValid && (
                            <span className="absolute right-3.5 text-[#3DA35D]">
                              <Check className="h-4 w-4 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        {touched.mobile && !isMobileValid && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Enter a valid mobile (07XXXXXXXX)
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suEmail">
                        Email <span className="text-[#5C6B60] font-normal">(optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                          <Mail className="h-4 w-4 text-[#5C6B60]" />
                        </span>
                        <input
                          id="suEmail"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          autoComplete="email"
                          className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                        />
                        {formData.email.trim() && isEmailValid && (
                          <span className="absolute right-3.5 text-[#3DA35D]">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      {touched.email && formData.email.trim() && !isEmailValid && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> That email doesn&apos;t look right
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3.5 px-6 rounded-full bg-[#123524] text-white font-semibold text-sm hover:bg-[#0C281B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ================= STEP 2 ================= */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suDistrict">
                          District
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                            <MapPin className="h-4 w-4 text-[#5C6B60]" />
                          </span>
                          <select
                            id="suDistrict"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-10 text-sm text-[#10241A] outline-none appearance-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10 cursor-pointer"
                            required
                          >
                            <option value="" disabled>Select your district</option>
                            {SRI_LANKA_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <span className="absolute right-3.5 text-[#5C6B60] pointer-events-none">
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </div>
                        {touched.district && !formData.district && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Please select your district
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suSize">
                          Plantation Size
                        </label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                            <Trees className="h-4 w-4 text-[#5C6B60]" />
                          </span>
                          <select
                            id="suSize"
                            name="plantationSize"
                            value={formData.plantationSize}
                            onChange={handleChange}
                            className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-10 text-sm text-[#10241A] outline-none appearance-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10 cursor-pointer"
                            required
                          >
                            <option value="" disabled>Select plantation size</option>
                            <option value="Less than 1 acre">Less than 1 acre</option>
                            <option value="1-5 acres">1-5 acres</option>
                            <option value="5-20 acres">5-20 acres</option>
                            <option value="20-50 acres">20-50 acres</option>
                            <option value="More than 50 acres">More than 50 acres</option>
                          </select>
                          <span className="absolute right-3.5 text-[#5C6B60] pointer-events-none">
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </div>
                        {touched.plantationSize && !formData.plantationSize && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Please select plantation size
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suFarm">
                        Farm / Estate Name <span className="text-[#5C6B60] font-normal">(optional)</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                          <Trees className="h-4 w-4 text-[#5C6B60]" />
                        </span>
                        <input
                          id="suFarm"
                          type="text"
                          name="farmName"
                          value={formData.farmName}
                          onChange={handleChange}
                          placeholder="e.g. Akeel Coconut Estate"
                          className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-[#EDF3E0] rounded-2xl p-3.5 text-xs text-[#123524] leading-relaxed">
                      <Info className="h-4 w-4 text-[#123524] shrink-0 mt-0.5" />
                      <span>
                        Your district powers the <b>outbreak heatmap</b> and <b>radius alerts</b> - we&apos;ll only notify you about verified cases near your farm.
                      </span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 py-3.5 px-5 rounded-full border border-[#E4E8DC] text-[#10241A] font-semibold text-sm hover:bg-[#F6F7F2] transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-[2] py-3.5 px-6 rounded-full bg-[#123524] text-white font-semibold text-sm hover:bg-[#0C281B] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ================= STEP 3 ================= */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suPw">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                          <Lock className="h-4 w-4 text-[#5C6B60]" />
                        </span>
                        <input
                          id="suPw"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-[#5C6B60] hover:text-[#10241A] transition-colors p-1"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Password strength meter */}
                      <div className="flex gap-1.5 mt-2">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              pwScore >= bar
                                ? bar === 1
                                  ? 'bg-[#E5484D]'
                                  : bar === 2
                                  ? 'bg-[#F5A524]'
                                  : bar === 3
                                  ? 'bg-[#7FA81B]'
                                  : 'bg-[#3DA35D]'
                                : 'bg-[#E9EEE0]'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Strength label and Caps Lock */}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-xs font-semibold ${PW_COLORS[pwScore]}`}>
                          {PW_LABELS[pwScore]}
                        </span>
                        {capsLockOn && (
                          <span className="text-[11px] font-semibold text-[#8A5A00] bg-[#FCF0DA] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>Caps Lock on</span>
                          </span>
                        )}
                      </div>

                      {/* Requirement hint chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${pwChecks.len ? 'bg-[#E1F3E8] text-[#1E7A44]' : 'bg-[#EDF3E0] text-[#5C6B60]'}`}>
                          8+ chars
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${pwChecks.case ? 'bg-[#E1F3E8] text-[#1E7A44]' : 'bg-[#EDF3E0] text-[#5C6B60]'}`}>
                          Aa
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${pwChecks.num ? 'bg-[#E1F3E8] text-[#1E7A44]' : 'bg-[#EDF3E0] text-[#5C6B60]'}`}>
                          123
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${pwChecks.sym ? 'bg-[#E1F3E8] text-[#1E7A44]' : 'bg-[#EDF3E0] text-[#5C6B60]'}`}>
                          !@#
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="suPw2">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                          <LockKeyhole className="h-4 w-4 text-[#5C6B60]" />
                        </span>
                        <input
                          id="suPw2"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 text-[#5C6B60] hover:text-[#10241A] transition-colors p-1"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="mt-1.5 text-xs font-semibold text-[#3DA35D] flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Passwords match
                        </div>
                      )}
                    </div>

                    {/* Terms of Service Checkbox */}
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5C6B60] pt-1 leading-snug select-none">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded-md border-[#E4E8DC] text-[#123524] focus:ring-[#7FA81B]"
                      />
                      <span>
                        I agree to the <a href="#" className="font-semibold text-[#123524] underline">Terms of Service</a> and <a href="#" className="font-semibold text-[#123524] underline">Privacy Policy</a>, and consent to location-based disease alerts.
                      </span>
                    </label>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={loading}
                        className="flex-1 py-3.5 px-5 rounded-full border border-[#E4E8DC] text-[#10241A] font-semibold text-sm hover:bg-[#F6F7F2] transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-3.5 px-6 rounded-full bg-[#C9F169] text-[#0C281B] font-semibold text-sm hover:bg-[#d8fa7e] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Creating account...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>

              {/* Switch to Login */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E4E8DC]" />
                </div>
                <span className="relative bg-white px-3 text-xs text-[#5C6B60]">or</span>
              </div>

              <p className="text-center text-sm text-[#5C6B60]">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-[#123524] underline underline-offset-2 hover:text-[#7FA81B] transition-colors">
                  Login
                </Link>
              </p>

              <p className="text-center text-xs text-[#5C6B60] mt-6">
                Back to{' '}
                <Link to="/" className="font-semibold text-[#123524] hover:underline">
                  cococare.lk
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

