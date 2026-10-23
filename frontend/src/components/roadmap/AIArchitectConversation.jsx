import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Check, RotateCcw } from 'lucide-react'

const EXPERIENCE_OPTIONS = [
  {
    id: 'no_knowledge',
    level: 'Beginner',
    label: 'Absolute Beginner',
    desc: 'Zero coding background. Starting from first principles.',
  },
  {
    id: 'basic_knowledge',
    level: 'Beginner',
    label: 'Foundational',
    desc: 'Familiar with basic syntax, logic, and concepts.',
  },
  {
    id: 'some_projects',
    level: 'Intermediate',
    label: 'Intermediate',
    desc: 'Built independent projects. Seeking production depth.',
  },
  {
    id: 'job_ready',
    level: 'Advanced',
    label: 'Advanced',
    desc: 'Experienced engineer transitioning to this domain.',
  },
]

const TIME_OPTIONS = [
  { id: '30_mins', label: '5 Hours / week', desc: 'Steady focus around a busy schedule.' },
  { id: '1_hour', label: '10 Hours / week', desc: 'Balanced rhythm with weekly milestones.' },
  { id: '2_hours', label: '15 Hours / week', desc: 'Accelerated engineering progression.' },
  { id: '4_hours', label: '25+ Hours / week', desc: 'Full immersive daily sprint.' },
]

const GOAL_OPTIONS = [
  { id: 'get_job', label: 'Placement & Job', desc: 'Interviews & high-signal portfolio' },
  { id: 'get_internship', label: 'Internship', desc: 'Verified entry credentials' },
  { id: 'startup', label: 'Startup MVP', desc: 'Full-stack SaaS from scratch' },
  { id: 'freelance', label: 'Freelancing', desc: 'Client systems & APIs' },
  { id: 'college', label: 'CS Mastery', desc: 'Core theory & system design' },
]

const STYLE_OPTIONS = [
  { id: 'projects', label: 'Hands-on Projects', desc: 'Build while learning' },
  { id: 'videos', label: 'Video Breakdowns', desc: 'Guided visual instruction' },
  { id: 'reading', label: 'Specs & Docs', desc: 'Technical documentation' },
]

export default function AIArchitectConversation({
  initialGoal,
  onStartSynthesis,
  onResetGoal,
  onUserInteracting,
}) {
  const [activeStep, setActiveStep] = useState(1) // 1: Experience, 2: Time, 3: Goal, 4: Style
  const goalText = initialGoal
  const [experience, setExperience] = useState('basic_knowledge')
  const [time, setTime] = useState('1_hour')
  const [primaryGoal, setPrimaryGoal] = useState('get_job')
  const [style, setStyle] = useState('projects')

  const containerRef = useRef(null)

  // Scroll to latest question
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [activeStep])

  const handleSelectExperience = (opt) => {
    setExperience(opt.id)
    onUserInteracting?.('typing')
    setTimeout(() => {
      setActiveStep(2)
      onUserInteracting?.('focus')
    }, 280)
  }

  const handleSelectTime = (opt) => {
    setTime(opt.id)
    onUserInteracting?.('typing')
    setTimeout(() => {
      setActiveStep(3)
      onUserInteracting?.('focus')
    }, 280)
  }

  const handleSelectGoal = (opt) => {
    setPrimaryGoal(opt.id)
    onUserInteracting?.('typing')
    setTimeout(() => {
      setActiveStep(4)
      onUserInteracting?.('focus')
    }, 280)
  }

  const handleSelectStyle = (opt) => {
    setStyle(opt.id)
    onUserInteracting?.('typing')
  }

  const handleGenerate = () => {
    const expObj = EXPERIENCE_OPTIONS.find((e) => e.id === experience) || EXPERIENCE_OPTIONS[1]
    onStartSynthesis({
      goal: goalText,
      experience_level: expObj.level,
      current_level: experience,
      available_time: time,
      main_goal: primaryGoal,
      preferred_style: style,
    })
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-h-[70vh] overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none"
    >
      {/* ── Active Target Goal Pill & Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-white/[0.06] pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0084FF]/10 border border-[#0084FF]/25">
            <Sparkles className="h-3.5 w-3.5 text-[#0084FF]" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-[0.24em] uppercase text-neutral-400 block">
              TARGET SPECIALIZATION
            </span>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              {goalText}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetGoal}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs font-mono text-neutral-400 hover:text-white hover:border-[#0084FF]/40 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Change</span>
        </button>
      </motion.div>

      {/* ── Dialogue 1: Experience Level ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-3"
      >
        <div className="flex items-start gap-2.5">
          <span className="text-[11px] font-mono text-[#0084FF] font-semibold shrink-0 mt-0.5">
            01 //
          </span>
          <p className="text-sm sm:text-base text-neutral-200 font-medium tracking-tight">
            How would you describe your current technical experience in this domain?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isSelected = experience === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectExperience(opt)}
                className={`relative group rounded-xl p-3.5 text-left transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'border-[#0084FF] bg-[#0084FF]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(0,132,255,0.14)]'
                    : 'border-white/[0.07] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight ${
                      isSelected ? 'text-[#0084FF]' : 'text-neutral-300 group-hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#0084FF]" />}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{opt.desc}</p>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Dialogue 2: Time Commitment ── */}
      {activeStep >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3 pt-2"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-[11px] font-mono text-[#0084FF] font-semibold shrink-0 mt-0.5">
              02 //
            </span>
            <p className="text-sm sm:text-base text-neutral-200 font-medium tracking-tight">
              How much time can you realistically dedicate every week?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6">
            {TIME_OPTIONS.map((opt) => {
              const isSelected = time === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTime(opt)}
                  className={`rounded-xl p-3 text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#0084FF] bg-[#0084FF]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(0,132,255,0.14)]'
                      : 'border-white/[0.07] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block ${
                      isSelected ? 'text-[#0084FF]' : 'text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Dialogue 3: Primary Career Mission ── */}
      {activeStep >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-3 pt-2"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-[11px] font-mono text-[#FF0055] font-semibold shrink-0 mt-0.5">
              03 //
            </span>
            <p className="text-sm sm:text-base text-neutral-200 font-medium tracking-tight">
              What is your primary milestone outcome?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-6">
            {GOAL_OPTIONS.map((opt) => {
              const isSelected = primaryGoal === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectGoal(opt)}
                  className={`rounded-xl p-3 text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#FF0055] bg-[#FF0055]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(255,0,85,0.14)]'
                      : 'border-white/[0.07] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block ${
                      isSelected ? 'text-[#FF0055]' : 'text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Dialogue 4: Learning Style & Final Action ── */}
      {activeStep >= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-start gap-2.5">
            <span className="text-[11px] font-mono text-[#0084FF] font-semibold shrink-0 mt-0.5">
              04 //
            </span>
            <p className="text-sm sm:text-base text-neutral-200 font-medium tracking-tight">
              Preferred learning architecture:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pl-6">
            {STYLE_OPTIONS.map((opt) => {
              const isSelected = style === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectStyle(opt)}
                  className={`rounded-xl p-3 text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#0084FF] bg-[#0084FF]/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_16px_rgba(0,132,255,0.14)]'
                      : 'border-white/[0.07] bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold block ${
                      isSelected ? 'text-[#0084FF]' : 'text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-tight">{opt.desc}</p>
                </button>
              )
            })}
          </div>

          {/* ── Final Action: Machined Luxury Hardware Trigger ── */}
          <div className="pt-4 pl-6">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full relative group rounded-xl bg-[#FF0055] text-white hover:bg-[#ff1a6b] px-6 py-3.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.8),0_0_20px_rgba(255,0,85,0.35)] active:scale-[0.99]"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-xs sm:text-sm font-bold font-mono uppercase tracking-[0.18em]">
                Synthesize Career Architecture
              </span>
              <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
