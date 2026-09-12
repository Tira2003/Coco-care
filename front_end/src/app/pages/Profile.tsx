import {
  Edit2,
  Home,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { farmApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { Farm, User } from '@/types'
import {
  FarmLocationPicker,
  type FarmLocationValue,
} from '@/app/components/FarmLocationPicker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

type FarmFormState = {
  name: string
  acreage: string
  treeCount: string
}

type ProfileFormState = {
  name: string
  email: string
  phone: string
}

const emptyFarmForm: FarmFormState = {
  name: '',
  acreage: '5',
  treeCount: '200',
}

const emptyLocation: FarmLocationValue = {
  latitude: null,
  longitude: null,
  location: '',
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  email: '',
  phone: '',
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

export function Profile() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [showFarmDialog, setShowFarmDialog] = useState(false)
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null)
  const [farmForm, setFarmForm] = useState<FarmFormState>(emptyFarmForm)
  const [farmLocation, setFarmLocation] = useState<FarmLocationValue>(emptyLocation)
  const [locationError, setLocationError] = useState('')
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [passwordError, setPasswordError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Farm | null>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: farmApi.profile,
  })

  const displayUser = profile?.user ?? user
  const farms = profile?.farms ?? []
  const initials = (displayUser?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: ['farmer', 'profile'] })
  }

  const profileMutation = useMutation({
    mutationFn: farmApi.updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData<{ user: User; farms: Farm[] }>(
        ['farmer', 'profile'],
        (old) => (old ? { ...old, user: updated } : old),
      )
      updateUser(updated)
      setShowProfileDialog(false)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: farmApi.changePassword,
    onSuccess: () => {
      setShowPasswordDialog(false)
      setPasswordForm(emptyPasswordForm)
      setPasswordError('')
    },
  })

  const createFarmMutation = useMutation({
    mutationFn: farmApi.create,
    onSuccess: () => {
      refreshProfile()
      closeFarmDialog()
    },
  })

  const updateFarmMutation = useMutation({
    mutationFn: ({ id, farm }: { id: string; farm: Omit<Farm, 'id'> }) =>
      farmApi.update(id, farm),
    onSuccess: () => {
      refreshProfile()
      closeFarmDialog()
    },
  })

  const deleteFarmMutation = useMutation({
    mutationFn: farmApi.delete,
    onSuccess: () => {
      refreshProfile()
      setDeleteTarget(null)
    },
  })

  const farmBusy = createFarmMutation.isPending || updateFarmMutation.isPending
  const farmMutationError = getErrorMessage(
    createFarmMutation.error ?? updateFarmMutation.error,
    'Could not save farm. Please try again.',
  )
  const deleteError = getErrorMessage(
    deleteFarmMutation.error,
    'Could not delete farm. Please try again.',
  )
  const profileError = getErrorMessage(
    profileMutation.error,
    'Could not update profile. Please try again.',
  )
  const passwordMutationError = getErrorMessage(
    passwordMutation.error,
    'Could not change password. Please try again.',
  )

  const openCreateFarm = () => {
    setEditingFarm(null)
    setFarmForm(emptyFarmForm)
    setFarmLocation(emptyLocation)
    setLocationError('')
    createFarmMutation.reset()
    updateFarmMutation.reset()
    setShowFarmDialog(true)
  }

  const openEditFarm = (farm: Farm) => {
    setEditingFarm(farm)
    setFarmForm({
      name: farm.name,
      acreage: String(farm.acreage),
      treeCount: String(farm.treeCount),
    })
    setFarmLocation({
      latitude: farm.latitude,
      longitude: farm.longitude,
      location: farm.location,
    })
    setLocationError('')
    createFarmMutation.reset()
    updateFarmMutation.reset()
    setShowFarmDialog(true)
  }

  const closeFarmDialog = () => {
    setShowFarmDialog(false)
    setEditingFarm(null)
    setFarmForm(emptyFarmForm)
    setFarmLocation(emptyLocation)
    setLocationError('')
    createFarmMutation.reset()
    updateFarmMutation.reset()
  }

  const openProfileDialog = () => {
    setProfileForm({
      name: displayUser?.name ?? '',
      email: displayUser?.email ?? '',
      phone: displayUser?.phone ?? '',
    })
    profileMutation.reset()
    setShowProfileDialog(true)
  }

  const openPasswordDialog = () => {
    setPasswordForm(emptyPasswordForm)
    setPasswordError('')
    passwordMutation.reset()
    setShowPasswordDialog(true)
  }

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault()
    profileMutation.mutate({
      name: profileForm.name,
      email: profileForm.email.trim() || null,
      phone: profileForm.phone.trim() || null,
    })
  }

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
  }

  const handleFarmSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLocationError('')

    if (farmLocation.latitude === null || farmLocation.longitude === null) {
      setLocationError('Please pin your farm location on the map.')
      return
    }
    if (!farmLocation.location.trim()) {
      setLocationError('Waiting for location name. Move the pin slightly or try again.')
      return
    }

    const payload = {
      name: farmForm.name,
      location: farmLocation.location,
      latitude: farmLocation.latitude,
      longitude: farmLocation.longitude,
      acreage: parseFloat(farmForm.acreage),
      treeCount: parseInt(farmForm.treeCount, 10),
    }

    if (editingFarm) {
      updateFarmMutation.mutate({ id: editingFarm.id, farm: payload })
    } else {
      createFarmMutation.mutate(payload)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="mb-1 text-2xl text-[#1a2e1a] sm:mb-2 sm:text-3xl">Profile</h1>
        <p className="text-sm text-[#6b7c6b] sm:text-base">Your account and registered farms.</p>
      </div>

      <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-xl text-white sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl text-gray-900 sm:text-2xl">{displayUser?.name}</h2>
              <p className="truncate text-sm text-gray-600 capitalize sm:text-base">
                {displayUser?.role} · @{displayUser?.username}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={openProfileDialog}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm text-[#2d5f2e] hover:bg-green-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={openPasswordDialog}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm text-[#2d5f2e] hover:bg-green-50"
            >
              <KeyRound className="h-4 w-4" />
              Password
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={displayUser?.phone ?? 'N/A'} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={displayUser?.email ?? 'N/A'} />
        </div>
      </div>

      <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg text-gray-900">My Farms</h3>
          <button
            type="button"
            onClick={openCreateFarm}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2d5f2e] px-3 py-2 text-sm text-white hover:bg-[#1a2e1a] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Farm
          </button>
        </div>

        <div className="space-y-3">
          {farms.length === 0 ? (
            <p className="text-sm text-gray-500">No farms registered yet.</p>
          ) : (
            farms.map((farm) => (
              <div
                key={farm.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3 sm:p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Home className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2d5f2e]" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-900">{farm.name}</div>
                    <div className="flex items-start gap-1 text-sm text-gray-600">
                      <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span className="break-words">
                        {farm.location} · {farm.acreage} acres · {farm.treeCount} trees
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    type="button"
                    title="Edit farm"
                    onClick={() => openEditFarm(farm)}
                    className="rounded-lg p-2.5 text-[#2d5f2e] hover:bg-green-100"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete farm"
                    onClick={() => {
                      deleteFarmMutation.reset()
                      setDeleteTarget(farm)
                    }}
                    className="rounded-lg p-2.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your contact details.</DialogDescription>
          </DialogHeader>
          <form id="profile-form" onSubmit={handleProfileSubmit} className="grid gap-3">
            <TextField
              label="Name"
              value={profileForm.name}
              onChange={(value) => setProfileForm({ ...profileForm, name: value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={profileForm.email}
              onChange={(value) => setProfileForm({ ...profileForm, email: value })}
            />
            <TextField
              label="Phone"
              value={profileForm.phone}
              onChange={(value) => setProfileForm({ ...profileForm, phone: value })}
            />
            {profileMutation.isError ? (
              <p className="text-xs text-red-600">{profileError}</p>
            ) : null}
          </form>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowProfileDialog(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={profileMutation.isPending}
              className="px-4 py-2 text-sm bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-60"
            >
              {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password before setting a new one.</DialogDescription>
          </DialogHeader>
          <form id="password-form" onSubmit={handlePasswordSubmit} className="grid gap-3">
            <TextField
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(value) =>
                setPasswordForm({ ...passwordForm, currentPassword: value })
              }
              required
            />
            <TextField
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              required
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(value) =>
                setPasswordForm({ ...passwordForm, confirmPassword: value })
              }
              required
            />
            {passwordError || passwordMutation.isError ? (
              <p className="text-xs text-red-600">
                {passwordError || passwordMutationError}
              </p>
            ) : null}
          </form>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowPasswordDialog(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="password-form"
              disabled={passwordMutation.isPending}
              className="px-4 py-2 text-sm bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-60"
            >
              {passwordMutation.isPending ? 'Saving...' : 'Change Password'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFarmDialog} onOpenChange={(open) => (open ? setShowFarmDialog(true) : closeFarmDialog())}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFarm ? 'Edit Farm' : 'Add New Farm'}</DialogTitle>
            <DialogDescription>
              Register and maintain coconut estates for disease reporting and diagnosis.
            </DialogDescription>
          </DialogHeader>

          <form id="farm-form" onSubmit={handleFarmSubmit} className="grid grid-cols-1 gap-3">
            <TextField
              label="Farm name"
              placeholder="e.g. Akeel Coconut Estate"
              value={farmForm.name}
              onChange={(value) => setFarmForm({ ...farmForm, name: value })}
              required
            />

            {showFarmDialog ? (
              <FarmLocationPicker
                value={farmLocation}
                onChange={(next) => {
                  setFarmLocation(next)
                  if (next.latitude !== null) setLocationError('')
                }}
              />
            ) : null}

            {locationError ? <p className="text-xs text-red-600">{locationError}</p> : null}

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Acreage"
                type="number"
                min="0.1"
                step="0.1"
                value={farmForm.acreage}
                onChange={(value) => setFarmForm({ ...farmForm, acreage: value })}
                required
              />
              <TextField
                label="Tree count"
                type="number"
                min="1"
                value={farmForm.treeCount}
                onChange={(value) => setFarmForm({ ...farmForm, treeCount: value })}
                required
              />
            </div>

            {createFarmMutation.isError || updateFarmMutation.isError ? (
              <p className="text-xs text-red-600">{farmMutationError}</p>
            ) : null}
          </form>

          <DialogFooter>
            <button
              type="button"
              onClick={closeFarmDialog}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="farm-form"
              disabled={farmBusy}
              className="px-4 py-2 text-sm bg-[#2d5f2e] text-white rounded-lg hover:bg-[#1a2e1a] disabled:opacity-60"
            >
              {farmBusy ? 'Saving...' : 'Save Farm'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Farm</DialogTitle>
            <DialogDescription>
              This is only allowed for farms with no disease reports or alerts.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-700">
            Delete {deleteTarget?.name}? This action cannot be undone.
          </p>
          {deleteFarmMutation.isError ? (
            <p className="text-xs text-red-600">{deleteError}</p>
          ) : null}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteFarmMutation.isPending || !deleteTarget}
              onClick={() => deleteTarget && deleteFarmMutation.mutate(deleteTarget.id)}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {deleteFarmMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-[#2d5f2e]">{icon}</span>
      <div>
        <div className="text-gray-500 text-xs">{label}</div>
        <div className="text-gray-900">{value}</div>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
  step,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  min?: string
  step?: string
}) {
  return (
    <label className="space-y-1">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d5f2e]/30"
        required={required}
      />
    </label>
  )
}
