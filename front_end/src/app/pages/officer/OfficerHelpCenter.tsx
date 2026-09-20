import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ChevronDown, ClipboardList, ExternalLink, HelpCircle, Map, MessageSquare, Phone } from 'lucide-react'
import { HELP_INSTITUTIONS } from '@/app/help'

const FAQS = [
  {
    q: 'What should I review on a pending report?',
    a: 'Open the photo, image result, symptom result, and confidence. Verify when the case is a real outbreak in your district. Reject when the diagnosis is wrong or the crop is healthy. A verify note is sent to the farmer as advice.',
  },
  {
    q: 'Who gets an alert after I verify?',
    a: 'Nearby coconut farms inside the watch radius receive an outbreak alert. The case also appears on the Sri Lanka heatmap as a verified marker.',
  },
  {
    q: 'How do farmer consultations reach me?',
    a: 'Farmers in your assigned district send a thread from Officer consultations. Needs-reply means the last message is from the farmer. Mark resolved when the visit or advice is done.',
  },
  {
    q: 'Can I see outbreaks outside my district?',
    a: 'Yes. Confirmed reports and the heatmap are island-wide so you can watch spread. The pending queue stays limited to your assigned region.',
  },
]

const GUIDES = [
  { title: 'Review pending diagnoses', href: '/officer/reports', icon: ClipboardList },
  { title: 'Reply to farmers', href: '/officer/consultations', icon: MessageSquare },
  { title: 'Watch the outbreak map', href: '/officer/heatmap', icon: Map },
]

export function OfficerHelpCenter() {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const q = query.trim().toLowerCase()

  const faqs = useMemo(
    () => FAQS.filter((item) => !q || `${item.q} ${item.a}`.toLowerCase().includes(q)),
    [q],
  )

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div>
        <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold text-[#10241A] sm:text-3xl">
          Help Center
        </h1>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Officer review, farmer messages, and CRI contacts for field work.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-[#E6EADF] bg-white px-4 py-2.5">
        <HelpCircle className="h-4 w-4 text-[#5C6B60]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search officer help"
          className="w-full bg-transparent text-sm text-[#10241A] outline-none"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {GUIDES.map((guide) => {
          const Icon = guide.icon
          return (
            <Link
              key={guide.href}
              to={guide.href}
              className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] bg-white px-4 py-3 text-sm font-semibold text-[#10241A] hover:bg-[#FBFDF8]"
            >
              <Icon className="h-4 w-4 text-[#123524]" />
              {guide.title}
            </Link>
          )
        })}
      </div>

      <section className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Common questions
        </h2>
        <div className="mt-3 divide-y divide-[#E6EADF]">
          {faqs.map((item) => {
            const open = openFaq === item.q
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : item.q)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold text-[#10241A]"
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 text-[#5C6B60] transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open ? <p className="pb-3 text-sm leading-relaxed text-[#5C6B60]">{item.a}</p> : null}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Government contacts
        </h2>
        {HELP_INSTITUTIONS.map((item) => (
          <article key={item.shortName} className="rounded-2xl border border-[#E6EADF] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="font-['Bricolage_Grotesque',Inter,sans-serif] font-bold text-[#10241A]">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-[#5C6B60]">{item.summary}</p>
            <div className="mt-3 space-y-2 text-sm">
              {item.lines.map((line) => (
                <div key={line.label}>
                  <div className="font-semibold text-[#10241A]">{line.label}</div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {line.phones?.map((phone) => (
                      <a
                        key={phone.href}
                        href={phone.href}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F6F7F2] px-3 py-1 text-xs font-semibold text-[#123524]"
                      >
                        <Phone className="h-3 w-3" />
                        {phone.label}
                      </a>
                    ))}
                    {line.website ? (
                      <a
                        href={line.website.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-[#EDF3E0] px-3 py-1 text-xs font-semibold text-[#123524]"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {line.website.label}
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
