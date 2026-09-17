import { Check } from 'lucide-react'

export type QuestionnaireStep = {
  id: string
  title: string
  hint?: string
}

/**
 * Mobile-first step pager for multi-step symptom questionnaires.
 * Full-width equal nodes + progress track; step titles show on sm+ only.
 */
export function QuestionnaireStepPager({
  steps,
  current,
  onChange,
  className = '',
}: {
  steps: readonly QuestionnaireStep[]
  current: number
  onChange: (index: number) => void
  className?: string
}) {
  const total = steps.length
  const safeCurrent = Math.min(Math.max(current, 0), Math.max(total - 1, 0))
  const percentComplete = Math.round(((safeCurrent + 1) / total) * 100)
  const currentStep = steps[safeCurrent]

  return (
    <div
      className={`mb-5 rounded-2xl border border-[#E6EADF] bg-white px-3.5 py-4 shadow-sm sm:mb-6 sm:px-5 sm:py-5 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#123524]">
            Step {safeCurrent + 1} of {total}
          </p>
          <p className="truncate font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A] sm:text-base">
            {currentStep?.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#EDF3E0] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[#123524] border border-[#D5E6B7]">
          {percentComplete}%
        </span>
      </div>

      <ol className="m-0 flex list-none items-start p-0">
        {steps.map((s, i) => {
          const isActive = i === safeCurrent
          const isDone = i < safeCurrent
          const isLast = i === total - 1

          return (
            <li key={s.id} className="relative flex min-w-0 flex-1 flex-col items-center">
              {/* Line to next node */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={[
                    'absolute left-1/2 top-[1.125rem] z-0 h-0.5 w-full sm:top-5',
                    i < safeCurrent ? 'bg-[#123524]' : 'bg-[#E6EADF]',
                  ].join(' ')}
                />
              ) : null}

              <button
                type="button"
                onClick={() => onChange(i)}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${s.title}${
                  isDone ? ' (completed)' : isActive ? ' (current)' : ''
                }`}
                className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123524]/40 focus-visible:ring-offset-2"
              >
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 sm:h-10 sm:w-10',
                    isActive
                      ? 'scale-110 bg-[#123524] text-white shadow-xs ring-4 ring-[#EDF3E0]'
                      : isDone
                        ? 'bg-[#EDF3E0] text-[#123524] ring-2 border border-[#D5E6B7]'
                        : 'bg-white text-[#5C6B60] ring-1 ring-[#E6EADF]',
                  ].join(' ')}
                >
                  {isDone ? <Check className="h-4 w-4 text-[#123524]" strokeWidth={2.75} /> : i + 1}
                </span>
                <span
                  className={[
                    'hidden max-w-[4.75rem] truncate text-center text-[10px] font-medium leading-tight sm:block md:max-w-[5.75rem]',
                    isActive ? 'font-bold text-[#10241A]' : isDone ? 'text-[#123524]' : 'text-[#5C6B60]',
                  ].join(' ')}
                >
                  {s.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
