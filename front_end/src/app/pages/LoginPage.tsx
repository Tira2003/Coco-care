import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import loginLogo from "@/imports/login-logo.png";
import { useState } from "react";
import { motion } from "motion/react";
import { useAuth, getRoleHomePath } from "@/contexts/AuthContext";
import { authApi } from "@/api/services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

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
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ username, password });
      navigate(getRoleHomePath(user.role));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid username or password. Please try again.'))
    } finally {
      setLoading(false);
    }
  };

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
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-white px-4 py-8 sm:p-6"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-md">
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
            Login
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm text-gray-600 sm:text-base"
          >
            Welcome back to CocoCare
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
              <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">NIC Number</label>
              <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-full border-2 border-[#1a2e1a] bg-white px-5 py-3.5 text-base text-[#1a2e1a] transition-all hover:shadow-md focus:border-[#2d5016] focus:outline-none sm:px-6 sm:py-4"
                  placeholder="Enter your NIC number"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="mb-2 block text-sm font-bold text-[#1a2e1a] sm:mb-3">Password</label>
              <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border-2 border-[#1a2e1a] bg-white px-5 py-3.5 pr-12 text-base text-[#1a2e1a] transition-all hover:shadow-md focus:border-[#2d5016] focus:outline-none sm:px-6 sm:py-4"
                  placeholder="Enter your password"
                  required
                  disabled={loading}
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
              <div className="mt-2 text-right">
                <motion.button
                  whileHover={{ x: 3 }}
                  type="button"
                  onClick={openPasswordReset}
                  className="inline-block min-h-10 text-sm text-gray-500 transition-colors hover:text-[#2d5016]"
                >
                  Forgot password?
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={
                  loading ? undefined : { scale: 1.02, boxShadow: '0 10px 30px rgba(45, 80, 22, 0.3)' }
                }
                whileTap={loading ? undefined : { scale: 0.98 }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2d5016] py-3.5 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#1a2e1a] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>
            </motion.div>

            <div className="my-6 border-t-2 border-gray-200 sm:my-8" />

            <p className="text-center text-sm text-[#1a2e1a] sm:text-base">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#2d5016] underline transition-colors hover:text-[#1a2e1a]"
              >
                Create an account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Confirm your account before setting a new password.
            </DialogDescription>
          </DialogHeader>

          <form id="login-password-reset-form" onSubmit={handlePasswordReset} className="grid gap-3">
            <label className="space-y-1">
              <span className="text-sm text-gray-600">NIC Number</span>
              <input
                type="text"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                autoComplete="username"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Current password</span>
              <input
                type="password"
                value={resetCurrentPassword}
                onChange={(e) => setResetCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                autoComplete="current-password"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-gray-600">New password</span>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm text-gray-600">Confirm new password</span>
              <input
                type="password"
                value={resetConfirmPassword}
                onChange={(e) => setResetConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>
            {resetError ? (
              <p className="text-xs text-red-600">{resetError}</p>
            ) : null}
          </form>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="login-password-reset-form"
              disabled={resetLoading}
              className="px-4 py-2 text-sm bg-[#2d5016] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-60"
            >
              {resetLoading ? 'Saving...' : 'Change Password'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
