import { Check, Circle } from 'lucide-react'
import type { ReactNode } from 'react'

type ChoiceVariant = 'single' | 'multi' | 'compact'

/**
 * High-emphasis answer option for symptom questionnaires.
 * Selected state uses a solid brand fill + icon so choices read clearly at a glance.
 */
export function QuizChoice({
  active,
  onClick,
  children,
  variant = 'single',
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  variant?: ChoiceVariant
}) {
  const isCompact = variant === 'compact'
  const isMulti = variant === 'multi'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'group relative flex w-full items-center gap-3 rounded-2xl border-2 text-left transition-all duration-200',
        isCompact ? 'min-h-[2.75rem] px-3.5 py-2.5' : 'min-h-[3.25rem] px-4 py-3.5',
        active
          ? 'border-[#2d5f2e] bg-gradient-to-br from-[#2d5f2e] to-[#1a2e1a] text-white shadow-md shadow-emerald-900/20'
          : 'border-gray-200 bg-white text-gray-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/60 hover:shadow',
      ].join(' ')}
    >
      <span
        className={[
          'flex shrink-0 items-center justify-center transition-colors',
          isMulti ? 'rounded-md' : 'rounded-full',
          isCompact ? 'h-5 w-5' : 'h-6 w-6',
          active
            ? 'bg-white text-[#2d5f2e]'
            : 'border-2 border-gray-300 bg-white text-transparent group-hover:border-emerald-400',
        ].join(' ')}
        aria-hidden
      >
        {active ? (
          isMulti || !isCompact ? (
            <Check className={isCompact ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={3} />
          ) : (
            <Circle className="h-2.5 w-2.5 fill-current" />
          )
        ) : null}
      </span>
      <span
        className={[
          'min-w-0 flex-1 leading-snug',
          isCompact ? 'text-sm' : 'text-sm sm:text-[15px]',
          active ? 'font-semibold' : 'font-medium',
        ].join(' ')}
      >
        {children}
      </span>
    </button>
  )
}

/** Alias used by pages that previously named the control Choice */
export const Choice = QuizChoice

export function QuizChoiceGrid({
  children,
  cols = 2,
}: {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
}) {
  const colClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : cols === 4
          ? 'grid-cols-2 sm:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2'

  return <div className={`grid ${colClass} gap-3`}>{children}</div>
}

export function QuizQuestion({
  label,
  hint,
  safety,
  children,
}: {
  label: string
  hint?: string
  safety?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-emerald-100/80 bg-gradient-to-b from-emerald-50/40 to-white p-4 sm:p-5">
      <div>
        <p className="text-[15px] font-semibold leading-snug text-[#1a2e1a] sm:text-base">{label}</p>
        {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
        {safety ? (
          <p className="mt-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900">
            {safety}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function YnRow({
  label,
  value,
  onChange,
  safety,
}: {
  label: string
  value: 'yes' | 'no' | 'unsure' | ''
  onChange: (v: 'yes' | 'no' | 'unsure') => void
  safety?: string
}) {
  const options = [
    { id: 'yes' as const, text: 'Yes' },
    { id: 'no' as const, text: 'No' },
    { id: 'unsure' as const, text: 'Not sure' },
  ]

  return (
    <QuizQuestion label={label} safety={safety}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {options.map((opt) => (
          <QuizChoice
            key={opt.id}
            active={value === opt.id}
            onClick={() => onChange(opt.id)}
            variant="compact"
          >
            <span className="text-center sm:text-left">{opt.text}</span>
          </QuizChoice>
        ))}
      </div>
    </QuizQuestion>
  )
}
