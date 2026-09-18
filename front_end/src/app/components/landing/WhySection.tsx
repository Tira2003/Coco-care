import { motion } from 'motion/react'
import { Search, BookOpen, Bell, LayoutGrid } from 'lucide-react'

const reasons = [
  {
    number: '01',
    icon: Search,
    title: 'Spotting the early signs',
    description:
      'Similar symptoms can point to very different causes. A clear first look helps you decide what deserves attention.',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Finding the right guidance',
    description:
      'Useful advice should be reliable, local and understandable when you are standing in the middle of a farm.',
  },
  {
    number: '03',
    icon: Bell,
    title: 'Knowing what is nearby',
    description:
      'A confirmed case in your area can change what you watch for next. Verified information should travel further.',
  },
  {
    number: '04',
    icon: LayoutGrid,
    title: 'Keeping the story together',
    description:
      "A farm's history matters. Reports, recommendations and weather context should not disappear after one visit.",
  },
]

export function WhySection() {
  return (
    <section className="bg-[#F6F7F2] py-20 sm:py-28 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

        {/* Left: headline + intro */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          

          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-[2.8rem] sm:text-[3.4rem] lg:text-[3.8rem] font-semibold leading-[1.08] tracking-[-0.02em] text-[#10241A] mb-7">
            When a leaf<br />
            changes,<br />
            every day<br />
            matters.
          </h2>

          <div className="w-10 h-px bg-[#C4D4B0] mb-7" />

          <p className="text-sm sm:text-base text-[#5C6B60] leading-relaxed max-w-sm">
            A new mark on a frond can be difficult to name. Advice can be far away.
            And a notebook cannot tell you what is happening in the next village.
          </p>
        </motion.div>

        {/* Right: 2x2 reason cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reasons.map(({ number, icon: Icon, title, description }, i) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#E4ECD8] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon + number row */}
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold text-[#C4D4B0] tracking-widest">
                  {number}
                </span>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-base font-semibold text-[#10241A] mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-[13px] text-[#5C6B60] leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
