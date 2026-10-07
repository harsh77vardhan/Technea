import { Compass, Lightbulb, Code2, Trophy } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Compass,
    title: 'Choose Your Skill Goal',
    description:
      'Search or select any topic you want to learn. Technea assesses your comfort level to craft a custom learning path.',
  },
  {
    step: '02',
    icon: Lightbulb,
    title: 'Digest Micro-Lessons',
    description:
      'No 45-minute lectures. Every lesson is broken into bite-sized, conceptual milestones with practical examples.',
  },
  {
    step: '03',
    icon: Code2,
    title: 'Guided Hands-on Practice',
    description:
      'Write real code in the browser. When you hit a roadblock, your AI tutor explains where you stumbled and why.',
  },
  {
    step: '04',
    icon: Trophy,
    title: 'Build Portfolio Proof',
    description:
      'Complete end-to-end beginner projects that demonstrate tangible technical skills to employers or collaborators.',
  },
]

const LEARNING_PATHS = [
  {
    number: '01',
    title: 'AI & Machine Learning',
    description:
      'Learn Python, AI fundamentals, prompt engineering, and modern AI tools.',
  },
  {
    number: '02',
    title: 'Web Development',
    description:
      'Build websites and understand modern frontend development with React.',
  },
  {
    number: '03',
    title: 'Data & Automation',
    description:
      'Learn how to work with data, create insights, and automate workflows.',
  },
  {
    number: '04',
    title: 'Creative Technology',
    description:
      'Explore technology-driven creative skills and digital tools.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-white text-neutral-950 py-24 sm:py-32 border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            Methodology
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-neutral-950">
            Zero to Strong Foundation
          </h2>
          <div className="mx-auto mt-6 h-px w-10 bg-neutral-300" />
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-neutral-600">
            A structured, step-by-step progression engineered to help beginners overcome tutorial paralysis and build genuine momentum.
          </p>
        </div>

        {/* ── Step Grid: Thin Light Borders on White ─────────────────────── */}
        <div className="mt-20 grid grid-cols-1 border-t border-l border-neutral-200 sm:grid-cols-2 lg:grid-cols-4 bg-white">
          {STEPS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.step}
                className="group flex flex-col justify-between border-r border-b border-neutral-200 p-8 sm:p-10 transition-colors duration-200 hover:bg-neutral-50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-neutral-300 group-hover:text-black transition-colors duration-200">
                      {item.step}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center border border-neutral-200 bg-neutral-100 text-black">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-base font-bold uppercase tracking-tight text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Compact Learning Paths Summary ─────────────────────────────── */}
        <div id="curriculum" className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t border-neutral-200 scroll-mt-24">
          <div className="flex items-center gap-4 mb-8 sm:mb-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Learning Paths
            </h3>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {LEARNING_PATHS.map((path) => (
              <div key={path.number} className="group">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-xs font-semibold text-neutral-400 group-hover:text-neutral-950 transition-colors duration-200">
                    {path.number}
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-neutral-950">
                    {path.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                  {path.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
