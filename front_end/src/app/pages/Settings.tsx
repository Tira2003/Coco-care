import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  HelpCircle,
  KeyRound,
  Loader2,
  LogOut,
  User,
} from 'lucide-react'
import { farmApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { Farm, User as AuthUser } from '@/types'

type ProfileFormState = {
  name: string
  email: string
  phone: string
}

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

export function Settings() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: '',
    email: '',
    phone: '',
  })
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordError, setPasswordError] = useState('')
  const [accountSaved, setAccountSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const displayUser = profile?.user ?? user

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash !== 'account' && hash !== 'password') return
    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  useEffect(() => {
    if (!displayUser) return
    setProfileForm({
      name: displayUser.name ?? '',
      email: displayUser.email ?? '',
      phone: displayUser.phone ?? '',
    })
  }, [displayUser?.id, displayUser?.name, displayUser?.email, displayUser?.phone])

  const profileMutation = useMutation({
    mutationFn: farmApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData<{ user: AuthUser; farms: Farm[] }>(
        ['farmer', 'profile'],
        (old) => (old ? { ...old, user: updated } : old),
      )
      updateUser(updated)
      setAccountSaved(true)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: farmApi.changePassword,
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isLoading && !displayUser) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
      </div>
    )
  }

  const accountError = getErrorMessage(profileMutation.error, 'Could not save your account details.')
  const passwordMutationError = getErrorMessage(
    passwordMutation.error,
    'Could not change your password.',
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight text-[#10241A] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#5C6B60] sm:text-base">
          Update your account, password, and how you use Coco Care.
        </p>
      </div>

      <section
        id="account"
        className="scroll-mt-24 rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Account
            </h2>
            <p className="text-sm text-[#5C6B60]">
              NIC {displayUser?.username ?? '—'} stays as your login. Name, email, and phone can
              change here.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid gap-3">
          <TextField
            label="Full name"
            value={profileForm.name}
            onChange={(value) => {
              setAccountSaved(false)
              setProfileForm({ ...profileForm, name: value })
            }}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(value) => {
                setAccountSaved(false)
                setProfileForm({ ...profileForm, email: value })
              }}
            />
            <TextField
              label="Phone"
              value={profileForm.phone}
              onChange={(value) => {
                setAccountSaved(false)
                setProfileForm({ ...profileForm, phone: value })
              }}
            />
          </div>
          {profileMutation.isError ? <p className="text-sm text-red-600">{accountError}</p> : null}
          {accountSaved ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#123524]">
              <Check className="h-4 w-4" />
              Account details saved.
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#123524] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C281B] disabled:opacity-60"
            >
              {profileMutation.isPending ? 'Saving…' : 'Save account'}
            </button>
            <Link
              to="/app/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E6EADF] px-4 py-2 text-sm font-semibold text-[#123524] hover:bg-[#F1F5EA]"
            >
              View profile
            </Link>
          </div>
        </form>
      </section>

      <section
        id="password"
        className="scroll-mt-24 rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
              Password
            </h2>
            <p className="text-sm text-[#5C6B60]">
              Enter your current password before setting a new one. Use at least 8 characters.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="grid gap-3 sm:max-w-md">
          <TextField
            label="Current password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(value) => {
              setPasswordSaved(false)
              setPasswordForm({ ...passwordForm, currentPassword: value })
            }}
            required
          />
          <TextField
            label="New password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(value) => {
              setPasswordSaved(false)
              setPasswordForm({ ...passwordForm, newPassword: value })
            }}
            required
          />
          <TextField
            label="Confirm new password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(value) => {
              setPasswordSaved(false)
              setPasswordForm({ ...passwordForm, confirmPassword: value })
            }}
            required
          />
          {passwordError || passwordMutation.isError ? (
            <p className="text-sm text-red-600">{passwordError || passwordMutationError}</p>
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
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          More
        </h2>
        <p className="mt-0.5 text-sm text-[#5C6B60]">Farms, alerts, and help live on their own screens.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link
            to="/app/profile"
            className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8]"
          >
            <User className="h-4 w-4 text-[#5C6B60]" />
            Manage farms
          </Link>
          <Link
            to="/app/notifications"
            className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8]"
          >
            <Bell className="h-4 w-4 text-[#5C6B60]" />
            Notification center
          </Link>
          <Link
            to="/app/help"
            className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8] sm:col-span-2"
          >
            <HelpCircle className="h-4 w-4 text-[#5C6B60]" />
            Help Center
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-[#E6EADF] bg-[#FBFDF8] p-4 sm:p-6">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Sign out
        </h2>
        <p className="mt-0.5 text-sm text-[#5C6B60]">
          End this session on this device. You can sign back in with your NIC and password.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E6EADF] bg-white px-4 py-2 text-sm font-semibold text-[#E5484D] hover:bg-[#FFF1F2]"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm font-semibold text-[#10241A]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#E6EADF] bg-[#F6F7F2] px-3 py-2.5 text-sm text-[#10241A] outline-none focus:border-[#123524] focus:bg-white"
        required={required}
      />
    </label>
  )
}
