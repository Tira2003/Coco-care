import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  Plus,
  Pencil,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react'
import { adminApi } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import type { User, UserRole } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

type FormMode = 'create' | 'edit' | 'password' | null

const emptyForm = {
  username: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  role: 'farmer' as UserRole,
  assignedRegion: '',
}

export function AdminUsersPage() {
  const { user: me } = useAuth()
  const queryClient = useQueryClient()
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [q, setQ] = useState('')
  const [mode, setMode] = useState<FormMode>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, q],
    queryFn: () => adminApi.users({ role: roleFilter || undefined, q: q || undefined }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      invalidate()
      closeDialog()
    },
    onError: (err: unknown) => setError(apiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof adminApi.updateUser>[1] }) =>
      adminApi.updateUser(id, payload),
    onSuccess: () => {
      invalidate()
      closeDialog()
    },
    onError: (err: unknown) => setError(apiError(err)),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminApi.resetPassword(id, password),
    onSuccess: () => {
      invalidate()
      closeDialog()
    },
    onError: (err: unknown) => setError(apiError(err)),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (user: User) =>
      user.isActive === false ? adminApi.activateUser(user.id) : adminApi.deactivateUser(user.id),
    onSuccess: invalidate,
    onError: (err: unknown) => alert(apiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: invalidate,
    onError: (err: unknown) => alert(apiError(err)),
  })

  const busy = createMutation.isPending || updateMutation.isPending || passwordMutation.isPending

  const openCreate = () => {
    setSelected(null)
    setForm(emptyForm)
    setError('')
    setMode('create')
  }

  const openEdit = (user: User) => {
    setSelected(user)
    setForm({
      username: user.username,
      password: '',
      name: user.name,
      email: user.email ?? '',
      phone: user.phone ?? '',
      role: user.role,
      assignedRegion: user.assignedRegion ?? '',
    })
    setError('')
    setMode('edit')
  }

  const openPassword = (user: User) => {
    setSelected(user)
    setForm({ ...emptyForm, password: '' })
    setError('')
    setMode('password')
  }

  const closeDialog = () => {
    setMode(null)
    setSelected(null)
    setError('')
  }

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyPassword = async (user: User) => {
    const value = user.password
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(user.id)
      window.setTimeout(() => setCopiedId((cur) => (cur === user.id ? null : cur)), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  const submit = () => {
    setError('')
    if (mode === 'create') {
      createMutation.mutate({
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        role: form.role,
        assignedRegion: form.assignedRegion || undefined,
      })
      return
    }
    if (mode === 'edit' && selected) {
      updateMutation.mutate({
        id: selected.id,
        payload: {
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          assignedRegion: form.assignedRegion || null,
        },
      })
      return
    }
    if (mode === 'password' && selected) {
      passwordMutation.mutate({ id: selected.id, password: form.password })
    }
  }

  const title = useMemo(() => {
    if (mode === 'create') return 'Create user'
    if (mode === 'edit') return 'Edit user'
    if (mode === 'password') return 'Reset password'
    return ''
  }, [mode])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl text-[#1a2e1a] mb-2">User Management</h1>
          <p className="text-[#6b7c6b]">
            Create, edit, deactivate, or remove platform accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5f2e] text-white text-sm hover:bg-[#1a2e1a]"
        >
          <Plus className="w-4 h-4" />
          New user
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or username"
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm min-w-[220px]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
        >
          <option value="">All roles</option>
          <option value="farmer">Farmer</option>
          <option value="officer">Officer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-x-auto">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2d5f2e]" />
          </div>
        ) : (
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-green-50 border-b border-green-100">
              <tr>
                <th className="text-left p-4 text-gray-600">Name</th>
                <th className="text-left p-4 text-gray-600">Username</th>
                <th className="text-left p-4 text-gray-600">Role</th>
                <th className="text-left p-4 text-gray-600">Status</th>
                <th className="text-left p-4 text-gray-600">Phone</th>
                <th className="text-left p-4 text-gray-600">Password</th>
                <th className="text-right p-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const inactive = u.isActive === false
                const known = Boolean(u.password)
                const revealed = Boolean(revealedIds[u.id])
                return (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="p-4 text-gray-900">{u.name}</td>
                    <td className="p-4 text-gray-700">{u.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          inactive ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {inactive ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{u.phone ?? '—'}</td>
                    <td className="p-4">
                      {known ? (
                        <div className="flex items-center gap-1.5 min-w-[140px]">
                          <code className="font-mono text-xs text-gray-800 bg-gray-50 border border-gray-100 rounded-md px-2 py-1 max-w-[140px] truncate">
                            {revealed ? u.password : '••••••••'}
                          </code>
                          <IconButton
                            title={revealed ? 'Hide password' : 'Show password'}
                            onClick={() => toggleReveal(u.id)}
                          >
                            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </IconButton>
                          <IconButton title="Copy password" onClick={() => void copyPassword(u)}>
                            {copiedId === u.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </IconButton>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400" title="Reset password to record one">
                          Not stored
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <IconButton title="Edit" onClick={() => openEdit(u)}>
                          <Pencil className="w-4 h-4" />
                        </IconButton>
                        <IconButton title="Reset password" onClick={() => openPassword(u)}>
                          <KeyRound className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          title={inactive ? 'Activate' : 'Deactivate'}
                          disabled={u.id === me?.id}
                          onClick={() => toggleActiveMutation.mutate(u)}
                        >
                          {inactive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </IconButton>
                        <IconButton
                          title="Delete"
                          disabled={u.id === me?.id}
                          onClick={() => {
                            if (confirm(`Delete user ${u.username}? This cannot be undone.`)) {
                              deleteMutation.mutate(u.id)
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === 'password'
                ? `Enter a new password for ${selected?.name ?? selected?.username ?? 'this user'}.`
                : 'Fill in the account details below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {mode === 'create' && (
              <Field
                label="Username"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
              />
            )}
            {(mode === 'create' || mode === 'edit') && (
              <>
                <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                {mode === 'create' ? (
                  <label className="block text-sm">
                    <span className="text-gray-600">Role</span>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                ) : (
                  <label className="block text-sm">
                    <span className="text-gray-600">Role</span>
                    <input
                      type="text"
                      value={form.role.charAt(0).toUpperCase() + form.role.slice(1)}
                      readOnly
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 capitalize"
                    />
                  </label>
                )}
                <Field
                  label="Assigned region"
                  value={form.assignedRegion}
                  onChange={(v) => setForm({ ...form, assignedRegion: v })}
                />
              </>
            )}
            {(mode === 'create' || mode === 'password') && (
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="px-4 py-2 rounded-lg bg-[#2d5f2e] text-white text-sm disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm">
      <span className="text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
      />
    </label>
  )
}

function IconButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-green-50 text-gray-600 disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function apiError(err: unknown): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message ?? 'Request failed'
}
