import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
  Palmtree,
  IdCard,
  Lock,
  AlertCircle,
} from 'lucide-react'
import { useAuth, getRoleHomePath } from '@/contexts/AuthContext'
import { authApi } from '@/api/services'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

function getApiErrorMessage(err: unknown, fallback: string) {
  const axiosErr = err as {
    code?: string
    message?: string
    response?: { data?: { message?: string } }
  }
  const apiMessage = axiosErr.response?.data?.message
  if (apiMessage) return apiMessage
  if (
    axiosErr.code === 'ERR_NETWORK' ||
    axiosErr.message?.toLowerCase().includes('network')
  ) {
    return 'Cannot reach the server. Make sure the backend is running on http://localhost:3000.'
  }
  return fallback
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login, logout } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [capsLockOn, setCapsLockOn] = useState(false)

  // Password reset dialog state
  const [resetOpen, setResetOpen] = useState(false)
  const [resetUsername, setResetUsername] = useState('')
  const [resetCurrentPassword, setResetCurrentPassword] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const isNicValid = /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(username.trim())

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Please enter both your NIC number and password.')
      return
    }

    setLoading(true)
    try {
      const user = await login({ username: username.trim(), password })
      navigate(getRoleHomePath(user.role))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid username or password. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const openPasswordReset = () => {
    setResetUsername(username)
    setResetCurrentPassword(password)
    setResetNewPassword('')
    setResetConfirmPassword('')
    setResetError('')
    setResetOpen(true)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError('')
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New passwords do not match.')
      return
    }

    let didLogin = false
    setResetLoading(true)
    try {
      const user = await login({
        username: resetUsername,
        password: resetCurrentPassword,
      })
      didLogin = true
      await authApi.changePassword({
        currentPassword: resetCurrentPassword,
        newPassword: resetNewPassword,
      })
      setUsername(resetUsername)
      setPassword(resetNewPassword)
      setResetOpen(false)
      navigate(getRoleHomePath(user.role))
    } catch (err) {
      if (didLogin) logout()
      setResetError(getApiErrorMessage(err, 'Could not change password. Please try again.'))
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F6F7F2] font-['Inter',system-ui,sans-serif] selection:bg-[#C9F169] selection:text-[#0C281B] relative overflow-hidden">
      {/* Background radial decorations */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[700px] h-[500px] bg-[radial-gradient(circle_at_70%_20%,#E9F3D2_0%,transparent_65%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-[600px] h-[500px] bg-[radial-gradient(circle_at_30%_80%,#E4EFDC_0%,transparent_60%)]" />

      {/* Main Card */}
      <div className="w-full max-w-[1060px] bg-white border border-[#E4E8DC] rounded-[28px] shadow-[0_30px_80px_rgba(16,36,26,0.18)] grid grid-cols-1 lg:grid-cols-[430px_1fr] overflow-hidden relative z-10">
        
        {/* ================= LEFT BRAND PANEL ================= */}
        <aside className="hidden lg:flex relative text-white p-11 flex-col justify-between bg-gradient-to-br from-[#0C281B] via-[#123524] to-[#1B4A31] overflow-hidden">
          {/* Subtle Glow Spheres */}
          <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(201,241,105,0.22),transparent_65%)] blur-sm" />
          <div className="pointer-events-none absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(201,241,105,0.10),transparent_60%)]" />

          {/* Header Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-2xl bg-[#C9F169]/15 border border-[#C9F169]/30 flex items-center justify-center text-[#C9F169] transition-transform group-hover:scale-105">
                <Palmtree className="h-6 w-6 text-[#C9F169]" />
              </span>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-white">
                Coco<b className="text-[#C9F169]">Care</b>
              </span>
            </Link>
          </div>

          {/* Middle Body - positioned slightly down towards bottom */}
          <div className="relative z-10 mt-auto mb-12 py-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9F169] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
              AI Coconut Intelligence
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-[1.85rem] font-semibold leading-snug my-2 text-white">
              Care for every palm,{' '}
              <span className="font-['Instrument_Serif',serif] italic font-normal text-[#C9F169]">
                right from your pocket.
              </span>
            </h2>
            <p className="text-[#B9C9B4] text-sm leading-relaxed max-w-sm">
              Detect diseases early with AI leaf scans, chat with a CRI-grounded assistant, and get alerts before trouble spreads.
            </p>
          </div>
        </aside>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          
          {/* Mobile Brand Link */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#123524] flex items-center justify-center text-[#C9F169]">
                <Palmtree className="h-5 w-5 text-[#C9F169]" />
              </span>
              <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-lg text-[#10241A]">
                Coco<b className="text-[#7FA81B]">Care</b>
              </span>
            </Link>
          </div>

          <header className="mb-7">
            <h1 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-bold tracking-tight text-[#10241A]">
              Welcome{' '}
              <span className="font-['Instrument_Serif',serif] italic font-normal text-[#7FA81B]">
                back
              </span>
            </h1>
            <p className="text-[#5C6B60] text-sm sm:text-base mt-2">
              Log in to your plantation workspace — your grove has been waiting.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            {/* NIC Field */}
            <div>
              <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="loginNic">
                NIC Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                  <IdCard className="h-4 w-4 text-[#5C6B60]" />
                </span>
                <input
                  id="loginNic"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="e.g. 199012345678"
                  autoComplete="username"
                  maxLength={12}
                  disabled={loading}
                  className="w-full bg-white border border-[#E4E8DC] rounded-2xl py-3 pl-11 pr-11 text-sm text-[#10241A] placeholder:text-[#A8B3A6] outline-none transition-all hover:border-[#C8D2BE] focus:border-[#123524] focus:ring-4 focus:ring-[#123524]/10"
                  required
                />
                {isNicValid && (
                  <span className="absolute right-3.5 text-[#3DA35D]">
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#10241A] mb-1.5" htmlFor="loginPw">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#5C6B60] pointer-events-none">
                  <Lock className="h-4 w-4 text-[#5C6B60]" />
                </span>
                <input
                  id="loginPw"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
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
              {capsLockOn && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A5A00] bg-[#FCF0DA] px-2.5 py-1 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Caps Lock is on</span>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#5C6B60] select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-[#E4E8DC] text-[#123524] focus:ring-[#7FA81B]"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={openPasswordReset}
                className="font-semibold text-[#123524] hover:text-[#7FA81B] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-[#123524] text-white font-semibold text-sm sm:text-base hover:bg-[#0C281B] shadow-[0_10px_24px_rgba(12,40,27,0.25)] hover:shadow-[0_14px_30px_rgba(12,40,27,0.32)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging in…</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E8DC]" />
            </div>
            <span className="relative bg-white px-3 text-xs text-[#5C6B60]">or</span>
          </div>

          <p className="text-center text-sm text-[#5C6B60]">
            New to Coco Care?{' '}
            <Link to="/register" className="font-bold text-[#123524] underline underline-offset-2 hover:text-[#7FA81B] transition-colors">
              Create an account
            </Link>
          </p>

          <p className="text-center text-xs text-[#5C6B60] mt-6">
            Back to{' '}
            <Link to="/" className="font-semibold text-[#123524] hover:underline">
              cococare.lk
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-[#10241A]">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5C6B60]">
              Confirm your account credentials before setting a new password.
            </DialogDescription>
          </DialogHeader>

          <form id="login-password-reset-form" onSubmit={handlePasswordReset} className="grid gap-3.5 my-2">
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[#10241A]">NIC Number</span>
              <input
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value.toUpperCase().replace(/\s/g, ''))}
                className="w-full px-3.5 py-2.5 border border-[#E4E8DC] rounded-xl text-sm focus:outline-none focus:border-[#123524] focus:ring-2 focus:ring-[#123524]/10"
                autoComplete="username"
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[#10241A]">Current password</span>
              <input
                type="password"
                value={resetCurrentPassword}
                onChange={(e) => setResetCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E4E8DC] rounded-xl text-sm focus:outline-none focus:border-[#123524] focus:ring-2 focus:ring-[#123524]/10"
                autoComplete="current-password"
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[#10241A]">New password</span>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E4E8DC] rounded-xl text-sm focus:outline-none focus:border-[#123524] focus:ring-2 focus:ring-[#123524]/10"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-[#10241A]">Confirm new password</span>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E4E8DC] rounded-xl text-sm focus:outline-none focus:border-[#123524] focus:ring-2 focus:ring-[#123524]/10"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            {resetError ? (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{resetError}</p>
            ) : null}
          </form>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="px-4 py-2 rounded-full text-sm text-[#5C6B60] hover:text-[#10241A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="login-password-reset-form"
              disabled={resetLoading}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#123524] text-white hover:bg-[#0C281B] disabled:opacity-60 transition-colors"
            >
              {resetLoading ? 'Saving…' : 'Change Password'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
