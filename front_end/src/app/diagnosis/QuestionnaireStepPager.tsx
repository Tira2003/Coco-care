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
  const trackProgress = total <= 1 ? 100 : (safeCurrent / (total - 1)) * 100
  const percentComplete = Math.round(((safeCurrent + 1) / total) * 100)
  const currentStep = steps[safeCurrent]

  return (
    <div
      className={`mb-5 rounded-2xl border border-green-100/90 bg-white px-3 py-3.5 shadow-sm sm:mb-6 sm:px-4 sm:py-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#2d5f2e]/80">
            Step {safeCurrent + 1} of {total}
          </p>
          <p className="truncate text-sm font-semibold text-[#1a2e1a] sm:text-[15px]">
            {currentStep?.title}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[#2d5f2e] ring-1 ring-green-100">
          {percentComplete}%
        </span>
      </div>

      <div
        className="mb-3.5 h-1.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={safeCurrent + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Questionnaire progress: step ${safeCurrent + 1} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2d5f2e] to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${trackProgress}%` }}
        />
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
                    i < safeCurrent ? 'bg-[#2d5f2e]' : 'bg-gray-200',
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
                className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2d5f2e]/40 focus-visible:ring-offset-2"
              >
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 sm:h-10 sm:w-10',
                    isActive
                      ? 'scale-110 bg-[#2d5f2e] text-white shadow-md shadow-emerald-900/25 ring-4 ring-green-100'
                      : isDone
                        ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200'
                        : 'bg-white text-gray-400 ring-2 ring-gray-200',
                  ].join(' ')}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={2.75} /> : i + 1}
                </span>
                <span
                  className={[
                    'hidden max-w-[4.75rem] truncate text-center text-[10px] font-medium leading-tight sm:block md:max-w-[5.75rem]',
                    isActive ? 'text-[#1a2e1a]' : isDone ? 'text-emerald-800' : 'text-gray-400',
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
