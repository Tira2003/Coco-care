import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, Check, Sprout, ShieldCheck, Settings } from 'lucide-react'

interface RolesSectionProps {
  showToast: (msg: string) => void
}

export function RolesSection({ showToast }: RolesSectionProps) {
  const [activeRole, setActiveRole] = useState<'farmer' | 'officer' | 'admin'>('farmer')

  return (
    <section className="py-20 sm:py-24" id="roles">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7FA81B] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#7FA81B]" />
            Role-Based Access
          </span>
          <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-[#10241A] max-w-xl mx-auto">
            One platform, three purpose-built dashboards
          </h2>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#E7EDDB] rounded-full p-1.5 gap-1 shadow-inner">
            {(['farmer', 'officer', 'admin'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 capitalize ${
                  activeRole === role
                    ? 'bg-[#123524] text-white shadow-md'
                    : 'text-[#5C6B60] hover:text-[#10241A]'
                }`}
              >
                {role === 'farmer' && (
                  <span className="inline-flex items-center gap-1.5">
                    <Sprout className="h-4 w-4" /> Farmer
                  </span>
                )}
                {role === 'officer' && (
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Officer
                  </span>
                )}
                {role === 'admin' && (
                  <span className="inline-flex items-center gap-1.5">
                    <Settings className="h-4 w-4" /> Admin
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Role Panels */}
        <div className="min-h-[380px]">
          {/* Farmer Panel */}
          {activeRole === 'farmer' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
            >
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                  The Farmer workspace
                </h3>
                <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                  Everything a grower needs day-to-day — diagnose, learn, track and plan, all from{' '}
                  <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                    /app
                  </code>.
                </p>
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Run AI leaf diagnoses and symptom questionnaires',
                    'Chat with the CRI-grounded assistant, citations included',
                    'Track every report from submission to verified outcome',
                    'Watch local weather and the regional outbreak map',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                      <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                >
                  Open Farmer Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                  <span>Diagnosis Report #1287</span>
                  <span className="text-[11px] font-bold bg-[#C9F169] text-[#0C281B] px-2.5 py-0.5 rounded-full">
                    Auto-verified
                  </span>
                </div>
                <div className="bg-[#F6F7F2] rounded-2xl p-4 my-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#10241A]">Bud Rot</div>
                    <div className="text-xs text-[#5C6B60]">Fusion confidence 94% · Photo + symptoms</div>
                  </div>
                  <span className="text-xs font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-1 rounded-full">
                    High agreement
                  </span>
                </div>
                <div className="flex gap-1.5 my-3">
                  <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#C9F169]" />
                </div>
                <div className="flex justify-between text-[11px] text-[#5C6B60] font-semibold">
                  <span>Uploaded</span>
                  <span>Analyzed</span>
                  <span>Verified</span>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E4E8DC] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#10241A]">Officer Advice Attached</div>
                    <div className="text-[#5C6B60]">Dilani F. · 2 hours ago</div>
                  </div>
                  <span className="text-xs font-bold text-[#123524] bg-[#EDF3E0] px-2.5 py-1 rounded-full">
                    3 action steps
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Officer Panel */}
          {activeRole === 'officer' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
            >
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                  The Officer console
                </h3>
                <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                  Agricultural officers verify edge cases and push expertise back to the field at{' '}
                  <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                    /officer
                  </code>.
                </p>
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Review a prioritized queue of ambiguous submissions',
                    'Verify, correct, or request more info with one tap',
                    'Add region-specific advice to every verdict',
                    'Trigger radius-based alerts to nearby farms',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                      <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/officer/reports"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                >
                  Open Officer Console <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                  <span>Review Queue</span>
                  <span className="text-[11px] font-bold bg-[#FCF0DA] text-[#8A5A00] px-2.5 py-0.5 rounded-full">
                    3 pending review
                  </span>
                </div>
                <div className="space-y-2.5 my-4">
                  <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#5B7A46] text-white font-bold flex items-center justify-center shrink-0">
                      KP
                    </div>
                    <div className="flex-1 min-w-0">
                      <b className="text-[#10241A] truncate block">Kandy South Farm</b>
                      <span className="text-[#5C6B60]">Leaf miner · 71% confidence</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => showToast('Report marked as verified!')}
                        className="px-3 py-1 rounded-full bg-[#123524] text-white font-bold text-[11px]"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#8A6D3B] text-white font-bold flex items-center justify-center shrink-0">
                      RM
                    </div>
                    <div className="flex-1 min-w-0">
                      <b className="text-[#10241A] truncate block">Ratmalana Estate</b>
                      <span className="text-[#5C6B60]">Stem bleeding · 66% confidence</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => showToast('Review details opened')}
                        className="px-3 py-1 rounded-full border border-[#E4E8DC] text-[#5C6B60] font-bold text-[11px] bg-white"
                      >
                        Info
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[#F6F7F2] p-3 rounded-xl text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#3D6B7A] text-white font-bold flex items-center justify-center shrink-0">
                      SJ
                    </div>
                    <div className="flex-1 min-w-0">
                      <b className="text-[#10241A] truncate block">Jaela Smallholding</b>
                      <span className="text-[#5C6B60]">Suspected outbreak · radius 5 km</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Radius alert dispatched to 32 farms!')}
                      className="px-3 py-1 rounded-full bg-[#123524] text-white font-bold text-[11px]"
                    >
                      Alert
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Panel */}
          {activeRole === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center"
            >
              <div>
                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl sm:text-3xl font-bold text-[#10241A] mb-3">
                  The Admin console
                </h3>
                <p className="text-[#5C6B60] text-base mb-6 leading-relaxed">
                  Platform governance and health at a glance at{' '}
                  <code className="bg-[#EDF3E0] px-2 py-0.5 rounded text-sm text-[#123524] font-semibold">
                    /admin
                  </code>.
                </p>
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Manage users, farms and role assignments',
                    'Moderate reports and broadcast notifications',
                    'Monitor service health — Vision, RAG, DB, Weather',
                    'Export insights across regions and seasons',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm sm:text-base text-[#10241A]">
                      <span className="w-5 h-5 rounded-full bg-[#C9F169] text-[#0C281B] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#123524] text-white text-sm font-semibold hover:bg-[#0C281B] transition-all"
                >
                  Open Admin Portal <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-white border border-[#E4E8DC] rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between font-['Bricolage_Grotesque',sans-serif] font-bold text-sm text-[#10241A] pb-3 border-b border-[#E4E8DC]">
                  <span>System Health</span>
                  <span className="text-[11px] font-bold bg-[#C9F169] text-[#0C281B] px-2.5 py-0.5 rounded-full">
                    All operational
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 my-3.5">
                  {['Vision API', 'RAG Service', 'PostgreSQL + pgvector', 'Weather Sync'].map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EDF3E0] text-[#123524] px-2.5 py-1 rounded-full">
                      <Check className="h-3 w-3 stroke-[3] text-[#7FA81B]" />
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#123524] text-white font-bold flex items-center justify-center text-[10px]">
                        NP
                      </div>
                      <div>
                        <b className="text-[#10241A] block">Nimal Perera</b>
                        <span className="text-[#5C6B60]">Farmer · Kurunegala · 24 reports</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#123524] bg-[#EDF3E0] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#7A3D3D] text-white font-bold flex items-center justify-center text-[10px]">
                        DF
                      </div>
                      <div>
                        <b className="text-[#10241A] block">Dilani Fernando</b>
                        <span className="text-[#5C6B60]">Officer · Puttalam region</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#123524] bg-[#EDF3E0] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#F6F7F2] p-2.5 rounded-xl">
                    <div>
                      <b className="text-[#10241A] block">Broadcast Channel</b>
                      <span className="text-[#5C6B60]">Weather warning → 1,204 farmers</span>
                    </div>
                    <span className="text-[11px] font-bold bg-[#FCF0DA] text-[#8A5A00] px-2 py-0.5 rounded-full">
                      Queued
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
