import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import loginLogo from "@/imports/login-logo.png";
import { useState } from "react";
import { motion } from "motion/react";
import { isAxiosError } from "axios";
import { useAuth, getRoleHomePath } from "@/contexts/AuthContext";
import { SRI_LANKA_DISTRICTS } from '@/constants/districts'

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    mobile: "",
    email: "",
    district: "",
    plantationSize: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const emailTrimmed = formData.email.trim();
    if (emailTrimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const user = await register({
        role: "farmer",
        username: formData.nic.trim(),
        name: formData.fullName.trim(),
        phone: formData.mobile.trim(),
        assignedRegion: formData.district.trim(),
        password: formData.password,
        ...(emailTrimmed ? { email: emailTrimmed } : {}),
      });
      navigate(getRoleHomePath(user.role));
    } catch (err) {
      if (isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Registration failed. Please check your details and try again.");
      } else {
        setError("Registration failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fieldClass =
    'w-full rounded-full border-2 border-[#1a2e1a] bg-white px-5 py-3.5 text-base text-[#1a2e1a] transition-all hover:shadow-md focus:border-[#2d5016] focus:outline-none sm:px-6 sm:py-4'

  return (
    <div
      className="flex min-h-[100dvh] items-start justify-center bg-white px-4 py-8 sm:items-center sm:p-6 sm:py-12"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12"
        >
          <div className="mb-5 flex justify-center sm:mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Link to="/" className="inline-block transition-opacity hover:opacity-90">
                <img
                  src={loginLogo}
                  alt="Coco Care"
                  className="mx-auto h-10 w-auto max-w-[180px] object-contain sm:h-12 sm:max-w-[200px]"
                />
              </Link>
            </motion.div>
          </div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-2 text-3xl font-bold text-[#1a2e1a] sm:mb-3 sm:text-5xl"
          >
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-gray-600 sm:text-base"
          >
            Join the CocoCare community today
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 sm:rounded-full">
                {error}
              </div>
            ) : null}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Full Name</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Enter your full name"
                required
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">NIC</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="199012345678"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Mobile Number</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="077 123 4567"
                  required
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">
                Email <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">District</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className={`${fieldClass} appearance-none cursor-pointer`}
                  required
                >
                  <option value="">Select District</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </motion.select>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Plantation Size</label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  name="plantationSize"
                  value={formData.plantationSize}
                  onChange={handleChange}
                  className={`${fieldClass} appearance-none cursor-pointer`}
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small (&lt; 1 acre)</option>
                  <option value="medium">Medium (1-5 acres)</option>
                  <option value="large">Large (&gt; 5 acres)</option>
                </motion.select>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Password</label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${fieldClass} pr-12`}
                    placeholder="Enter password"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 transition-colors hover:text-[#2d5016] sm:right-5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Confirm Password</label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${fieldClass} pr-12`}
                    placeholder="Confirm password"
                    required
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 transition-colors hover:text-[#2d5016] sm:right-5"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={
                  loading ? undefined : { scale: 1.02, boxShadow: '0 10px 30px rgba(45, 80, 22, 0.3)' }
                }
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2d5016] py-3.5 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#1a2e1a] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-2 sm:py-4 sm:text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </motion.div>

            <div className="my-6 border-t-2 border-gray-200 sm:my-8" />

            <p className="text-center text-sm text-[#1a2e1a] sm:text-base">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#2d5016] underline transition-colors hover:text-[#1a2e1a]"
              >
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
