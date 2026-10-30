import { motion } from 'framer-motion'
import { BookOpen, ExternalLink } from 'lucide-react'

export default function CuratedResourcesSection({ resources = [], trackTitle = '' }) {
  if (!resources || resources.length === 0) return null

  return (
    <section id="curated-resources" className="space-y-6 pt-10 border-t border-white/[0.08]">
      {/* ── SECTION HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
              Curated Resources & Documentation
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 font-light">
            Official specifications, battle-tested cheat sheets, and verified guides curated for {trackTitle || 'this blueprint'}.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-neutral-300">
          <BookOpen className="h-3 w-3 text-neutral-400" />
          <span className="font-semibold text-white">{resources.length}</span>
          <span>references</span>
        </div>
      </div>

      {/* ── RESOURCES GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
        {resources.map((res, idx) => (
          <motion.a
            key={res.title || idx}
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl border border-white/10 bg-[#07080c]/80 hover:border-white/20 hover:bg-[#07080c] transition-all duration-300 p-5 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer"
          >
            {/* Top Hairline accent */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
              aria-hidden="true"
            />

            <div className="space-y-3">
              {/* Type pill & External Icon */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[9px] font-mono text-neutral-300 uppercase tracking-wider">
                  {res.type || 'Resource'}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-500 group-hover:text-white transition-colors" />
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-neutral-200 transition-colors line-clamp-1">
                  {res.title}
                </h4>
                <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                  {res.description}
                </p>
              </div>

              {/* Tags */}
              {Array.isArray(res.tags) && res.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom URL preview */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-neutral-400 transition-colors">
              <span className="truncate max-w-[200px]">
                {res.url.replace(/^https?:\/\//, '')}
              </span>
              <span className="text-white text-xs font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Open Spec →
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  )
}
