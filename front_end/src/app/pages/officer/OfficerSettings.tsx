import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { Bell, Check, HelpCircle, KeyRound, LogOut, MapPin, User } from 'lucide-react'
import { authApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    return String(error.response.data.message)
  }
  return fallback
}

export function OfficerSettings() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  })
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordError, setPasswordError] = useState('')
  const [accountSaved, setAccountSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    setProfileForm({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    })
  }, [user?.id, user?.name, user?.email, user?.phone])

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash !== 'account' && hash !== 'password') return
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const profileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updated) => {
      updateUser(updated)
      setAccountSaved(true)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm)
      setPasswordError('')
      setPasswordSaved(true)
    },
  })

  const handleProfileSubmit = (event: FormEvent) => {
    event.preventDefault()
    setAccountSaved(false)
    profileMutation.mutate({
      name: profileForm.name,
      email: profileForm.email.trim() || null,
      phone: profileForm.phone.trim() || null,
    })
  }

  const handlePasswordSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPasswordSaved(false)
    setPasswordError('')
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError('New password must be different from the current password.')
      return
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight text-[#10241A] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Your district desk, contact details, and password.
        </p>
      </div>

      <section className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Assigned region
            </h2>
            <p className="text-sm text-[#5C6B60]">
              {user?.assignedRegion?.trim()
                ? `Reports and consultations for ${user.assignedRegion} are routed to this account.`
                : 'No district yet. An administrator needs to assign your region.'}
            </p>
          </div>
        </div>
      </section>

      <section id="account" className="scroll-mt-24 rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Account
            </h2>
            <p className="text-sm text-[#5C6B60]">
              Username {user?.username ?? '—'} stays as your login.
            </p>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="grid gap-3">
          <label className="space-y-1">
            <span className="text-sm font-semibold text-[#10241A]">Full name</span>
            <input
              value={profileForm.name}
              onChange={(e) => {
                setAccountSaved(false)
                setProfileForm({ ...profileForm, name: e.target.value })
              }}
              className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#10241A]">Email</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => {
                  setAccountSaved(false)
                  setProfileForm({ ...profileForm, email: e.target.value })
                }}
                className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-semibold text-[#10241A]">Phone</span>
              <input
                value={profileForm.phone}
                onChange={(e) => {
                  setAccountSaved(false)
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }}
                className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
              />
            </label>
          </div>
          {profileMutation.isError ? (
            <p className="text-sm text-red-600">{getErrorMessage(profileMutation.error, 'Could not save.')}</p>
          ) : null}
          {accountSaved ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123524]">
              <Check className="h-4 w-4" />
              Account details saved.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
          >
            {profileMutation.isPending ? 'Saving…' : 'Save account'}
          </button>
        </form>
      </section>

      <section id="password" className="scroll-mt-24 rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Password
            </h2>
            <p className="text-sm text-[#5C6B60]">Use at least 8 characters.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="grid gap-3 sm:max-w-md">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <label key={field} className="space-y-1">
              <span className="text-sm font-semibold text-[#10241A]">
                {field === 'currentPassword'
                  ? 'Current password'
                  : field === 'newPassword'
                    ? 'New password'
                    : 'Confirm new password'}
              </span>
              <input
                type="password"
                value={passwordForm[field]}
                onChange={(e) => {
                  setPasswordSaved(false)
                  setPasswordForm({ ...passwordForm, [field]: e.target.value })
                }}
                className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
                required
              />
            </label>
          ))}
          {passwordError || passwordMutation.isError ? (
            <p className="text-sm text-red-600">
              {passwordError || getErrorMessage(passwordMutation.error, 'Could not change password.')}
            </p>
          ) : null}
          {passwordSaved ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123524]">
              <Check className="h-4 w-4" />
              Password updated.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
          >
            {passwordMutation.isPending ? 'Saving…' : 'Change password'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">More</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            to="/officer/notifications"
            className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8]"
          >
            <Bell className="h-4 w-4 text-[#5C6B60]" />
            Notification center
          </Link>
          <Link
            to="/officer/help"
            className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8]"
          >
            <HelpCircle className="h-4 w-4 text-[#5C6B60]" />
            Help Center
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E6EADF] bg-[#FBFDF8] p-4 sm:p-6">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">Sign out</h2>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E6EADF] bg-white px-4 py-2 text-sm font-semibold text-[#E5484D] hover:bg-[#FFF1F2]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>
    </div>
  )
}
