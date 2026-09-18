import { ArrowRight } from 'lucide-react'

interface InsightsSectionProps {
  showToast: (msg: string) => void
}

export function InsightsSection({ showToast }: InsightsSectionProps) {
  const articles = [
    {
      category: 'Field Guide',
      title: '5 early signs of Bud Rot every grower should know',
      description:
        'From spear-leaf discoloration to a rotten smell at the crown — spot it early with this illustrated checklist from CRI manuals.',
      image:
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Hands planting a young seedling',
    },
    {
      category: 'Behind the Scenes',
      title: 'How RAG keeps our AI grounded in CRI science',
      description:
        'A look inside the retrieval pipeline: Gemini embeddings, pgvector search and why answers cite their source circulars — always.',
      image:
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
      alt: 'Fresh green coconut leaves',
    },
  ]

  return (
    <section className="py-20 sm:py-24" id="insights">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
            Blog
          </span>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-[#10241A]">
            Insights & stories from the field
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <article
              key={article.title}
              className="bg-white border border-[#E4E8DC] rounded-3xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#DCEBC4] to-[#9CC069]">
                <img
                  src={article.image}
                  alt={article.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-7">
                <span className="inline-flex text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-0.5 rounded-full mb-3">
                  {article.category}
                </span>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] font-bold text-xl text-[#10241A] mb-2">
                  {article.title}
                </h3>
                <p className="text-[#5C6B60] text-sm leading-relaxed mb-4">
                  {article.description}
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Article coming soon — stay tuned!')}
                  className="inline-flex items-center gap-1.5 font-semibold text-sm text-[#123524] hover:text-[#7FA81B] transition-colors"
                >
                  Read article <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
