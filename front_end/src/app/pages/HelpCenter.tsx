import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  ChevronDown,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  Phone,
  Search,
  UserRound,
} from 'lucide-react'
import {
  HELP_FAQS,
  HELP_GUIDES,
  HELP_INSTITUTIONS,
  HELP_MORE,
  HELP_TOPICS,
  type HelpInstitution,
  type HelpTopic,
} from '@/app/help'

function matchesQuery(text: string, query: string) {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

function scrollSectionIntoView(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  let parent = el.parentElement
  while (parent && parent !== document.body) {
    const style = window.getComputedStyle(parent)
    const canScroll =
      /(auto|scroll)/.test(style.overflowY) && parent.scrollHeight > parent.clientHeight + 1
    if (canScroll) {
      const top =
        el.getBoundingClientRect().top - parent.getBoundingClientRect().top + parent.scrollTop - 16
      parent.scrollTo({ top, behavior: 'smooth' })
      return
    }
    parent = parent.parentElement
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function institutionMatches(item: HelpInstitution, query: string) {
  if (!query) return true
  const haystack = [
    item.name,
    item.shortName,
    item.summary,
    ...item.lines.flatMap((line) => [
      line.label,
      ...(line.phones?.map((phone) => phone.label) ?? []),
      line.website?.label ?? '',
    ]),
  ].join(' ')
  return matchesQuery(haystack, query)
}

export function HelpCenter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [topic, setTopic] = useState<HelpTopic | 'all'>('all')
  const [openFaq, setOpenFaq] = useState<string | null>(HELP_FAQS[0]?.q ?? null)
  const query = searchParams.get('q') ?? ''

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash !== 'guides' && hash !== 'contacts') return
    if (hash === 'contacts') setTopic('contacts')
    window.requestAnimationFrame(() => scrollSectionIntoView(hash))
  }, [])

  const setTopicAndMaybeScroll = (next: HelpTopic | 'all') => {
    setTopic(next)
    if (next === 'contacts') {
      window.requestAnimationFrame(() => scrollSectionIntoView('contacts'))
    }
  }

  const setQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value)
    else next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const guides = useMemo(
    () =>
      HELP_GUIDES.filter(
        (item) => matchesQuery(item.title, query) || matchesQuery(item.description, query),
      ),
    [query],
  )

  const institutions = useMemo(
    () => HELP_INSTITUTIONS.filter((item) => institutionMatches(item, query)),
    [query],
  )

  const faqs = useMemo(
    () =>
      HELP_FAQS.filter((item) => {
        if (topic !== 'all' && item.topic !== topic) return false
        return matchesQuery(item.q, query) || matchesQuery(item.a, query)
      }),
    [query, topic],
  )

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[24px] bg-[#123524] px-5 py-6 text-white shadow-sm sm:rounded-[28px] sm:px-8 sm:py-8">
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#C9F169]">
            <HelpCircle className="h-3.5 w-3.5" />
            Help Center
          </p>
          <h1 className="mt-3 font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight sm:text-3xl">
            How can we help your farm?
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#AEC0A6]">
            Short guides for diagnosis, Coco AI, officer consultations, and your account — plus
            official CRI and CDA contact numbers. Search or jump into a topic.
          </p>
          <label className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[#5C6B60] sm:max-w-md">
            <Search className="h-4 w-4 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help, for example voice note or leaf scan"
              className="w-full bg-transparent text-sm text-[#10241A] outline-none placeholder:text-[#8A968C]"
            />
          </label>
        </div>
      </section>

      <section id="guides" className="scroll-mt-24">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Guides
        </h2>
        <p className="mt-1 text-sm text-[#5C6B60]">Open the screen and follow the steps there.</p>
        {guides.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-[#E6EADF] bg-white px-4 py-6 text-sm text-[#5C6B60]">
            No guides match that search.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href + item.title}
                  to={item.href}
                  className="rounded-2xl border border-[#E6EADF] bg-white p-4 transition-colors hover:border-[#D7E3C4] hover:bg-[#FBFDF8]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EDF3E0] text-[#123524]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-bold text-[#10241A]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5C6B60]">{item.description}</p>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Frequently asked
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {HELP_TOPICS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTopicAndMaybeScroll(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                topic === item.id
                  ? 'bg-[#123524] text-white'
                  : 'bg-[#EDF3E0] text-[#123524] hover:bg-[#E2EBCF]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {faqs.length === 0 ? (
            <p className="rounded-2xl border border-[#E6EADF] bg-white px-4 py-6 text-sm text-[#5C6B60]">
              No answers match that search.
            </p>
          ) : (
            faqs.map((item) => {
              const open = openFaq === item.q
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border bg-white ${
                    open ? 'border-[#D7E3C4] shadow-sm' : 'border-[#E6EADF]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : item.q)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="font-['Bricolage_Grotesque',Inter,sans-serif] text-sm font-semibold text-[#10241A]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#5C6B60] transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {open ? (
                    <p className="border-t border-[#E6EADF] px-4 py-3 text-sm leading-relaxed text-[#5C6B60]">
                      {item.a}
                    </p>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </section>

      <section id="contacts" className="scroll-mt-24">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          Government contacts
        </h2>
        <p className="mt-1 text-sm text-[#5C6B60]">
          Primary contact numbers for major coconut-related government institutions in Sri Lanka.
        </p>
        {institutions.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-[#E6EADF] bg-white px-4 py-6 text-sm text-[#5C6B60]">
            No contacts match that search.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {institutions.map((item) => (
              <article
                key={item.shortName}
                className="rounded-2xl border border-[#E6EADF] bg-white p-4 sm:p-5"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B60]">
                  {item.shortName}
                </p>
                <h3 className="mt-1 font-['Bricolage_Grotesque',Inter,sans-serif] text-base font-bold text-[#10241A]">
                  {item.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#5C6B60]">{item.summary}</p>
                <ul className="mt-4 space-y-3">
                  {item.lines.map((line) => (
                    <li key={line.label}>
                      <p className="text-xs font-semibold text-[#10241A]">{line.label}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#123524]">
                        {line.phones?.map((phone, index) => (
                          <span key={phone.href} className="inline-flex items-center gap-1">
                            {index > 0 ? <span className="text-[#8A968C]">/</span> : null}
                            <a
                              href={phone.href}
                              className="inline-flex items-center gap-1 font-medium hover:underline"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              {phone.label}
                            </a>
                          </span>
                        ))}
                        {line.website ? (
                          <a
                            href={line.website.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium hover:underline"
                          >
                            {line.website.label}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#E6EADF] bg-[#FBFDF8] p-5 sm:p-6">
        <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-lg font-bold text-[#10241A]">
          {HELP_MORE.title}
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#5C6B60]">{HELP_MORE.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/app/consultations"
            className="inline-flex items-center gap-2 rounded-full bg-[#123524] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C281B]"
          >
            <UserRound className="h-4 w-4" />
            Ask a regional officer
          </Link>
          <Link
            to="/app/chatbot"
            className="inline-flex items-center gap-2 rounded-full border border-[#E6EADF] bg-white px-4 py-2.5 text-sm font-semibold text-[#123524] hover:bg-[#F1F5EA]"
          >
            <MessageSquare className="h-4 w-4" />
            Open Coco AI
          </Link>
        </div>
      </section>
    </div>
  )
}
