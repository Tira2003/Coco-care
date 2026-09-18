import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Check, Sprout, ShieldCheck, Settings } from 'lucide-react'

interface RolesSectionProps {
  showToast: (msg: string) => void
}

const roles = [
  {
    icon: Sprout,
    title: 'The farmer workspace',
    description:
      'A simple place to manage a farm, check a coconut condition, ask questions and follow what happens to each report.',
    features: [
      'Register a farm with its location, acreage and tree count',
      'Upload leaf images or complete symptom questionnaires',
      'Save reports, recommendations and officer comments',
      'See weather information, notifications and nearby verified alerts',
    ],
    linkLabel: 'See farmer tools',
    linkTo: '/app',
  },
  {
    icon: ShieldCheck,
    title: 'The officer review workspace',
    description:
      'A focused review flow for agricultural officers to assess farmer-submitted reports and strengthen the quality of disease information.',
    features: [
      'Review images, symptoms and the initial AI-assisted result',
      'Add comments and recommendations for the farmer',
      'Verify or reject submitted disease reports',
      'Help turn verified reports into useful regional awareness',
    ],
    linkLabel: 'See the review flow',
    linkTo: '/officer/reports',
  },
  {
    icon: Settings,
    title: 'The platform control center',
    description:
      'A system-level view for managing users, farms, reports, notifications, regional summaries and service health.',
    features: [
      'Manage farmer, officer and administrator accounts',
      'Oversee farms, reports and notification activity',
      'Review regional disease summaries and platform statistics',
      'Monitor core services and system availability',
    ],
    linkLabel: 'See the platform scope',
    linkTo: '/admin',
  },
]

export function RolesSection({ showToast: _showToast }: RolesSectionProps) {
  return (
    <section className="bg-[#F6F7F2] py-20 sm:py-28 px-6" id="roles">
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
            Role-Based Access
          </span>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-[#10241A] max-w-2xl mx-auto leading-tight">
            One platform, three purpose-built dashboards
          </h2>
          <p className="text-[#5C6B60] mt-4 max-w-xl mx-auto text-base leading-relaxed">
            Whether you grow, review or govern — Coco Care gives each role exactly what it needs, nothing more.
          </p>
        </motion.div>

        {/* Dashboard image mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mb-12 rounded-2xl overflow-hidden border border-[#D8E6C4] shadow-[0_24px_64px_rgba(16,36,26,0.12)]"
        >
          {/* Browser chrome bar */}
          <div className="bg-[#EAEFDF] border-b border-[#D8E6C4] px-4 py-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F0A9A9]" />
            <span className="w-3 h-3 rounded-full bg-[#F5D08A]" />
            <span className="w-3 h-3 rounded-full bg-[#A8D4A0]" />
            <div className="ml-4 flex-1 bg-white/60 rounded-full px-3 py-1 text-xs text-[#7C887A] font-medium max-w-xs">
              app.cococare.lk/dashboard
            </div>
          </div>
          <img
            src="/farmer_dashboard_mockup.jpg"
            alt="Coco Care farmer dashboard"
            className="w-full object-cover object-top"
            style={{ maxHeight: '520px' }}
          />
        </motion.div>

        {/* 3 Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map(({ icon: Icon, title, description, features, linkLabel, linkTo }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#E4ECD8] rounded-2xl p-6 flex flex-col gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#EDF3E0] text-[#123524] flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>

              {/* Title + description */}
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-lg font-semibold text-[#10241A] mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-[13px] text-[#5C6B60] leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Feature checklist */}
              <ul className="space-y-2.5 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#3E4D42]">
                    <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#7FA81B] stroke-[2.5]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA link */}
              <Link
                to={linkTo}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#123524] hover:gap-2.5 transition-all duration-200 group mt-2 border-t border-[#E4ECD8] pt-4"
              >
                {linkLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
