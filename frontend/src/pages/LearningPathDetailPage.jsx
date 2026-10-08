import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function LearningPathDetailPage({
  path = null,
  onBack = () => {},
  onStartLearning = () => {},
}) {
  // Configured defaults matching the specification with optional prop fallbacks
  const title = path?.title || 'Python Foundations'
  const description =
    path?.description ||
    'Master fundamental programming logic, data structures, and practical application development.'
  const level = path?.level || 'Beginner'
  const duration = path?.duration || '4 Weeks'
  const technology = path?.category || 'Python'

  const journeySteps = [
    {
      num: '01',
      title: 'Fundamentals',
      topics: 'Variables, logic, loops',
    },
    {
      num: '02',
      title: 'Core Python',
      topics: 'Functions, lists, dictionaries',
    },
    {
      num: '03',
      title: 'Practical Skills',
      topics: 'Files, APIs, libraries',
    },
    {
      num: '04',
      title: 'Build Projects',
      topics: 'Mini applications',
    },
  ]

  const projects = [
    'Calculator',
    'Automation Script',
    'API Project',
  ]

  return (
    <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12">
        {/* ── TOP SECTION ─────────────────────────────────────────────────── */}
        <header className="space-y-6">
          {/* Back Action */}
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Results</span>
          </button>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 font-light max-w-2xl">
              {description}
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-mono text-xs text-neutral-300 border border-white/10 bg-white/[0.03] px-2.5 py-1 rounded">
              {level}
            </span>
            <span className="font-mono text-xs text-neutral-300 border border-white/10 bg-white/[0.03] px-2.5 py-1 rounded">
              {duration}
            </span>
            <span className="font-mono text-xs text-neutral-300 border border-white/10 bg-white/[0.03] px-2.5 py-1 rounded">
              {technology}
            </span>
          </div>
        </header>

        {/* ── MAIN CONTENT & SIDEBAR ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-8 border-t border-white/[0.08]">
          {/* MAIN SECTION: Clean Vertical Roadmap Timeline */}
          <section className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
              Learning Journey
            </h2>

            <div className="relative pl-6 sm:pl-8 space-y-8 border-l border-white/10 ml-2">
              {journeySteps.map((step) => (
                <div key={step.num} className="relative group">
                  {/* Subtle Node Indicator */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#08090d] border border-white/20 group-hover:border-white transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/50 group-hover:bg-white transition-colors" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs text-neutral-500 font-semibold">
                        {step.num}
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-400 font-light">
                      {step.topics}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SIDE SECTION: Premium Summary Card */}
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                Your Path
              </h2>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-neutral-500">Level:</span>
                  <span className="text-white font-medium">{level}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-neutral-500">Duration:</span>
                  <span className="text-white font-medium">{duration}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-neutral-500">Projects:</span>
                  <span className="text-white font-medium">{projects.length}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onStartLearning}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <span>Start Learning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </aside>
        </div>

        {/* ── BOTTOM SECTION: Projects List ────────────────────────────────── */}
        <section className="pt-8 border-t border-white/[0.08] space-y-5">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
            Projects You Will Build
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projects.map((proj, idx) => (
              <div
                key={proj}
                className="group rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 flex items-center justify-between hover:border-white/20 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-neutral-500">
                    0{idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                    {proj}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-600 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
