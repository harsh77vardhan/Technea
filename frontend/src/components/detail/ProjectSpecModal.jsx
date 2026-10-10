import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, CheckCircle2 } from 'lucide-react'

export default function ProjectSpecModal({ project, isOpen, onClose }) {
  if (!isOpen || !project) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0b0d13] p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1.5">
              <span className="font-mono text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                {project.milestone}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {project.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close project brief"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-neutral-300">
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1">
              Level: {project.difficulty}
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-neutral-400" />
              <span>Est. Time: {project.buildTime}</span>
            </span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-2.5 py-1">
              Portfolio Ready
            </span>
          </div>

          {/* Project Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
              Project Architecture Overview
            </h3>
            <p className="text-sm text-neutral-300 font-light leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Key Deliverables & Engineering Requirements */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Core Deliverables & Specifications
              </h3>
              <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                {project.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 font-light">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Tech Stack & Skills */}
          {project.skills && project.skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Technologies & Tools Applied
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-neutral-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-500">
              Technea Open-Source Spec
            </span>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-md"
            >
              Close Spec
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
