import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Terminal, ChevronRight } from 'lucide-react'
import ProjectSpecModal from './ProjectSpecModal'

export default function CapstoneProjectsSection({ projects = [], theme }) {
  const [activeProjectModal, setActiveProjectModal] = useState(null)

  return (
    <section id="capstone-projects" className="space-y-6 pt-10 border-t border-white/[0.08]">
      {/* ── SECTION HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.accentHue }}
            />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
              Real-World Capstone Projects
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 font-light">
            Engineered to prove competency. Build production software for your portfolio.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-neutral-300">
          <span className="font-semibold text-white">{projects.length}</span>
          <span>challenges</span>
        </div>
      </div>

      {/* ── PROJECTS SHOWCASE GRID ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => (
          <motion.div
            key={proj.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ y: -6 }}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
          >
            {/* Subtle Ambient Accent Glow on Hover */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl rounded-2xl"
              style={{ backgroundColor: theme.accentHue }}
            />

            <div className="relative z-10 p-6 space-y-5">
              {/* Card Top: Milestone & Difficulty */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {proj.milestone}
                </span>

                <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/[0.03] px-2 py-0.5 rounded">
                  {proj.difficulty}
                </span>
              </div>

              {/* Graphical Project Preview Box */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] text-neutral-400 space-y-2 relative overflow-hidden group/box">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] text-neutral-500">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/70" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                    <span className="h-2 w-2 rounded-full bg-green-500/70" />
                  </div>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-neutral-400" />
                    {proj.buildTime}
                  </span>
                </div>

                <div className="pt-1 text-neutral-300 font-light flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">$ build --milestone={idx + 1}</span>
                </div>

                <div className="text-[10px] text-emerald-400/90 font-mono">
                  ✓ Ready for local development
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-neutral-100 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-neutral-400 font-light line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Tech Stack Badges */}
              {proj.skills && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {proj.skills.length > 4 && (
                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                      +{proj.skills.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer: View Spec Button */}
            <div className="relative z-10 p-6 pt-0">
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <span className="font-mono text-[10px] text-neutral-500">
                  {proj.buildTime}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveProjectModal(proj)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer shadow-sm group-hover:border-white/30"
                >
                  <span>View Project Spec</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── INTERACTIVE PROJECT SPEC MODAL ─────────────────────────────────── */}
      <ProjectSpecModal
        project={activeProjectModal}
        isOpen={Boolean(activeProjectModal)}
        onClose={() => setActiveProjectModal(null)}
      />
    </section>
  )
}
