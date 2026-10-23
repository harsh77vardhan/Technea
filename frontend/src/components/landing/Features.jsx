import { useRef } from 'react'
import { Brain, Cpu, Layers, Zap } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ThreeCubeBackground from './ThreeCubeBackground'

gsap.registerPlugin(useGSAP)

const FEATURE_LIST = [
  {
    icon: Brain,
    title: 'Adaptive AI Mentor',
    description:
      'Never get stuck on an error code again. Ask natural questions and receive plain-English breakdowns with targeted analogies.',
  },
  {
    icon: Layers,
    title: 'Personalized Roadmaps',
    description:
      'Dynamic curriculum sequences that adapt to your background knowledge, skipping fluff and focusing on high-leverage skills.',
  },
  {
    icon: Cpu,
    title: 'Zero Terminal Setup',
    description:
      'Write, test, and run exercises directly inside an intelligent sandbox. No command-line troubleshooting or complex installations.',
  },
  {
    icon: Zap,
    title: 'Instant Error Explainer',
    description:
      'Translates intimidating stack traces into beginner-friendly explanations and shows you exactly how to fix your logic.',
  },
]

export default function Features() {
  const sectionRef = useRef(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.from('.feat-header-elem', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      }).from(
        '.feat-grid-card',
        {
          opacity: 0,
          y: 40,
          stagger: 0.12,
          duration: 0.85,
          ease: 'power3.out',
        },
        '-=0.5'
      )
    },
    { scope: sectionRef }
  )

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden bg-black text-white py-24 sm:py-32 border-b border-neutral-900"
    >
      {/* ── 3D Rotating Geometric Cube Background ─────────────────────── */}
      <ThreeCubeBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="feat-header-elem text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-500">
            Platform Architecture
          </p>
          <h2 className="feat-header-elem mt-4 text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
            From Curiosity to Capability
          </h2>
          <div className="feat-header-elem mx-auto mt-6 h-px w-10 bg-neutral-800 origin-center" />
          <p className="feat-header-elem mt-6 text-base sm:text-lg leading-relaxed text-neutral-400">
            Engineered to replace passive video tutorials with an active, mentor-supported learning experience designed for complete beginners.
          </p>
        </div>

        {/* ── Feature Grid: Thin Dark Borders on Black ───────────────────── */}
        <div className="mt-20 grid grid-cols-1 border-t border-l border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_LIST.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="feat-grid-card group flex flex-col justify-between border-r border-b border-neutral-800 p-8 sm:p-10 transition-colors duration-200 hover:bg-neutral-950"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center border border-neutral-700 bg-neutral-900 text-white transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-8 text-base font-bold uppercase tracking-tight text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                    {feat.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

