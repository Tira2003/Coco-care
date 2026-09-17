import { ArrowUpRight, Brain, ClipboardList, Microscope } from 'lucide-react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { getCategoryPath, type DiagnosisCategory } from '@/app/diagnosis/categories'

interface DiagnosisCardItem {
  category: DiagnosisCategory
  title: string
  description: string
  badge: 'ML-POWERED' | 'SYMPTOM-BASED'
  badgeClass: string
  dotColor: string
  metaText: string
  icon: string
  iconBg: string
}

const DIAGNOSIS_ITEMS: DiagnosisCardItem[] = [
  {
    category: 'leaves',
    title: 'Coconut Leaves & Leaflets',
    description: 'Uses deep learning vision model to classify leaf diseases from photos.',
    badge: 'ML-POWERED',
    badgeClass: 'bg-[#EDF3E0] text-[#5A7E13] border border-[#D5E6B7]',
    dotColor: 'bg-[#3DA35D]',
    metaText: 'Deep learning • 94% accuracy',
    icon: '🌿',
    iconBg: 'bg-[#EBF5EE]',
  },
  {
    category: 'stem',
    title: 'Coconut Stem & Trunk',
    description: 'CRI guided for stem bleeding, rhinoceros beetle, red palm weevil, termites, basal rot',
    badge: 'SYMPTOM-BASED',
    badgeClass: 'bg-[#FCF0DA] text-[#8A5A00] border border-[#F2DEB5]',
    dotColor: 'bg-[#E57A00]',
    metaText: 'CRI questionnaire • 5 questions',
    icon: '🌲',
    iconBg: 'bg-[#FFF2E6]',
  },
  {
    category: 'bud',
    title: 'Coconut Bud & Crown',
    description: 'Questionnaire for bud rot, Plesispa beetle, and weevil/beetle damage.',
    badge: 'SYMPTOM-BASED',
    badgeClass: 'bg-[#FCF0DA] text-[#8A5A00] border border-[#F2DEB5]',
    dotColor: 'bg-[#3DA35D]',
    metaText: 'CRI questionnaire • 5 questions',
    icon: '🌱',
    iconBg: 'bg-[#EBF5EE]',
  },
  {
    category: 'fruit',
    title: 'Coconut Fruit & Nuts',
    description: 'Questionnaire for coconut mite, scale insects, rats, and nut-fall stress',
    badge: 'SYMPTOM-BASED',
    badgeClass: 'bg-[#FCF0DA] text-[#8A5A00] border border-[#F2DEB5]',
    dotColor: 'bg-[#E57A00]',
    metaText: 'CRI questionnaire • 5 questions',
    icon: '🥥',
    iconBg: 'bg-[#FCEAE8]',
  },
]

export function DiseaseDetection() {
  return (
    <div className="mx-auto max-w-5xl pb-4 sm:pb-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6 overflow-hidden rounded-[24px] bg-[#123524] px-5 py-6 text-white shadow-sm sm:mb-8 sm:rounded-[28px] sm:px-8 sm:py-8"
      >
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#C9F169]">
            <Microscope className="h-3.5 w-3.5 text-[#C9F169]" />
            Step 1 · Choose diagnosis area
          </div>

          <h1 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Coconut Disease Diagnosis
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#AEC0A6] sm:text-sm">
            Select which part of your coconut palm shows symptoms. Leaf diseases are classified
            with our trained vision deep learning model; all other palm regions use a guided CRI symptom questionnaire.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur-xs">
              <Brain className="h-3.5 w-3.5 text-[#C9F169]" />
              <span>
                <strong className="font-semibold text-white">1</strong> ML-powered
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur-xs">
              <ClipboardList className="h-3.5 w-3.5 text-[#F5A524]" />
              <span>
                <strong className="font-semibold text-white">3</strong> symptom-based
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2x2 Grid matching the user design */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {DIAGNOSIS_ITEMS.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 * index }}
          >
            <Link
              to={getCategoryPath(item.category)}
              className="group flex h-full flex-col justify-between rounded-[22px] border border-[#E6EADF] bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(16,36,26,.04),0_6px_20px_rgba(16,36,26,.04)] transition-colors hover:border-[#BFD98F]"
            >
              <div>
                {/* Top row: Icon squircle & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconBg} text-xl shadow-2xs`}>
                    <span>{item.icon}</span>
                  </div>

                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="font-['Bricolage_Grotesque',Inter,sans-serif] text-base sm:text-lg font-bold text-[#10241A] mt-4">
                  {item.title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-[13px] text-[#5C6B60] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Bottom metadata row: dot indicator and arrow icon */}
              <div className="mt-6 flex items-center justify-between pt-2 border-t border-[#F6F7F2]">
                <div className="flex items-center gap-2 text-xs text-[#5C6B60]">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${item.dotColor}`} />
                  <span>{item.metaText}</span>
                </div>

                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#E6EADF] bg-white text-[#5C6B60] group-hover:border-[#123524] group-hover:text-[#10241A] group-hover:bg-[#F6F7F2] transition-colors">
                  <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-xs text-[#5C6B60]"
      >
        Diagnosis results are reviewed by agricultural extension officers when confidence is below verification threshold.
      </motion.p>
    </div>
  )
}
