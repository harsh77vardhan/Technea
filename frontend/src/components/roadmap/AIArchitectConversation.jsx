import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Plus,
  X,
  Target,
  Compass,
  Clock,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react'

const STEP_METADATA = [
  { id: 1, label: 'Goal', icon: Target, title: 'What is your primary goal?', subtitle: 'Describe your objective or choose from trending tech tracks.' },
  { id: 2, label: 'Experience', icon: Compass, title: 'What is your experience level?', subtitle: 'We calibrate pacing and prerequisite depth to where you stand today.' },
  { id: 3, label: 'Time', icon: Clock, title: 'How much time can you commit?', subtitle: 'We sequence your milestones based on your actual weekly bandwidth.' },
  { id: 4, label: 'Language', icon: Code2, title: 'What is your preferred language?', subtitle: 'Core syntax and coding exercises will be tailored to this language.' },
  { id: 5, label: 'Skills', icon: Layers, title: 'What skills do you currently possess?', subtitle: 'Select what you already know so we skip redundant basics.' },
  { id: 6, label: 'Role', icon: Cpu, title: 'What is your target professional role?', subtitle: 'Your capstone projects and interview prep will align to this title.' },
]

const QUICK_GOALS = [
  'Full Stack Developer',
  'AI Engineer',
  'Cloud & DevOps',
  'Cybersecurity',
  'Data Science',
  'Systems Engineering',
]

const EXPERIENCE_OPTIONS = [
  { id: 'Complete Beginner', label: 'Complete Beginner', tier: 'Tier 0', desc: 'Zero coding background or starting completely fresh.' },
  { id: 'Some Basics', label: 'Some Basics', tier: 'Tier 1', desc: 'Familiar with core syntax, loops, variables, and logic.' },
  { id: 'Built Projects', label: 'Built Projects', tier: 'Tier 2', desc: 'Have built apps/scripts, looking for production rigor.' },
  { id: 'Working Engineer', label: 'Working Engineer', tier: 'Tier 3', desc: 'Practicing developer leveling up or pivoting domains.' },
]

const TIME_OPTIONS = [
  { id: '30 mins/day', label: '30 mins/day', commitment: '3.5 hrs / wk', desc: 'Micro-learning cadence · Steady sustainable progress' },
  { id: '1-2 hours/day', label: '1-2 hours/day', commitment: '8-12 hrs / wk', desc: 'Recommended balance · Solid hands-on retention' },
  { id: '3-4 hours/day', label: '3-4 hours/day', commitment: '20-25 hrs / wk', desc: 'Accelerated immersion · High-velocity mastery' },
  { id: 'Full-time 6+ hours', label: 'Full-time 6+ hours', commitment: '40+ hrs / wk', desc: 'Full-time bootcamp intensity · Rapid job transition' },
]

const LANGUAGE_OPTIONS = [
  { id: 'Python', label: 'Python', desc: 'AI, ML, backend automation & data engineering' },
  { id: 'TypeScript / JavaScript', label: 'TypeScript / JavaScript', desc: 'Full-stack web, node runtimes & modern reactive UIs' },
  { id: 'Go', label: 'Go', desc: 'Cloud-native services, microservices & high throughput' },
  { id: 'Rust', label: 'Rust', desc: 'Systems programming, memory safety & high performance' },
  { id: 'Java', label: 'Java', desc: 'Enterprise distributed systems & backend architecture' },
  { id: 'C++', label: 'C++', desc: 'Game engines, embedded systems & latency-critical code' },
  { id: 'Swift', label: 'Swift', desc: 'Native Apple ecosystem, iOS & spatial computing' },
]

const DEFAULT_SKILL_PILLS = [
  'HTML/CSS',
  'Git',
  'Python Basics',
  'JavaScript',
  'SQL',
  'React',
  'Docker',
  'None / Starting Fresh',
]

const TARGET_ROLE_OPTIONS = [
  { id: 'Frontend Engineer', label: 'Frontend Engineer', desc: 'Design systems, performance, reactivity & client architecture.' },
  { id: 'Backend Architect', label: 'Backend Architect', desc: 'Scalable APIs, database schemas, caching & event streaming.' },
  { id: 'Full-Stack Developer', label: 'Full-Stack Developer', desc: 'End-to-end web apps, databases, interfaces & cloud deployment.' },
  { id: 'AI/ML Engineer', label: 'AI/ML Engineer', desc: 'Model architectures, neural pipelines, embeddings & production inference.' },
  { id: 'DevOps & Cloud Specialist', label: 'DevOps & Cloud Specialist', desc: 'CI/CD pipelines, Kubernetes, Terraform & infrastructure-as-code.' },
  { id: 'Systems Programmer', label: 'Systems Programmer', desc: 'Low-level runtimes, memory safety, compilers & concurrency.' },
]

export default function AIArchitectConversation({
  initialGoal = '',
  initialPreferences = null,
  onStartSynthesis,
  onResetGoal,
  onUserInteracting,
}) {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Goal
  const [goal, setGoal] = useState(() => initialPreferences?.goal || initialGoal || '')

  // Step 2: Experience
  const [experience, setExperience] = useState(
    () => initialPreferences?.experience_level || 'Complete Beginner'
  )

  // Step 3: Time Available
  const [time, setTime] = useState(
    () => initialPreferences?.available_time || '1-2 hours/day'
  )

  // Step 4: Preferred Language
  const [language, setLanguage] = useState(
    () => initialPreferences?.preferred_language || 'TypeScript / JavaScript'
  )

  // Step 5: Current Skills
  const [selectedSkills, setSelectedSkills] = useState(() => {
    if (initialPreferences?.current_skills && Array.isArray(initialPreferences.current_skills)) {
      return initialPreferences.current_skills
    }
    return ['HTML/CSS', 'JavaScript']
  })
  const [customSkillInput, setCustomSkillInput] = useState('')

  // Step 6: Target Role
  const [targetRole, setTargetRole] = useState(
    () => initialPreferences?.target_role || 'Full-Stack Developer'
  )

  const goalInputRef = useRef(null)
  const skillInputRef = useRef(null)

  // Sync initial goal if changed from outside
  const [prevInitialGoal, setPrevInitialGoal] = useState(initialGoal)
  if (initialGoal !== prevInitialGoal) {
    setPrevInitialGoal(initialGoal)
    if (initialGoal && !goal) {
      setGoal(initialGoal)
    }
  }

  // Focus input on step 1
  useEffect(() => {
    if (currentStep === 1 && goalInputRef.current) {
      goalInputRef.current.focus()
    }
  }, [currentStep])

  // Skill toggling
  const toggleSkill = (skill) => {
    onUserInteracting?.('selecting')
    if (skill === 'None / Starting Fresh') {
      setSelectedSkills(['None / Starting Fresh'])
      return
    }

    setSelectedSkills((prev) => {
      const filtered = prev.filter((s) => s !== 'None / Starting Fresh')
      if (filtered.includes(skill)) {
        const next = filtered.filter((s) => s !== skill)
        return next.length > 0 ? next : ['None / Starting Fresh']
      }
      return [...filtered, skill]
    })
  }

  const handleAddCustomSkill = (e) => {
    e?.preventDefault()
    const trimmed = customSkillInput.trim()
    if (!trimmed) return

    setSelectedSkills((prev) => {
      const filtered = prev.filter((s) => s !== 'None / Starting Fresh')
      if (filtered.includes(trimmed)) return filtered
      return [...filtered, trimmed]
    })
    setCustomSkillInput('')
  }

  const removeSkill = (skill) => {
    setSelectedSkills((prev) => {
      const next = prev.filter((s) => s !== skill)
      return next.length > 0 ? next : ['None / Starting Fresh']
    })
  }

  // Navigation handlers
  const canProceed = () => {
    if (currentStep === 1) return goal.trim().length > 0
    if (currentStep === 2) return Boolean(experience)
    if (currentStep === 3) return Boolean(time)
    if (currentStep === 4) return Boolean(language)
    if (currentStep === 5) return selectedSkills.length > 0
    if (currentStep === 6) return Boolean(targetRole)
    return true
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1)
      onUserInteracting?.('step')
    } else {
      handleFinalSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      onUserInteracting?.('back')
    }
  }

  const handleFinalSubmit = () => {
    const finalGoal = goal.trim() || 'Full Stack Developer'
    onStartSynthesis?.({
      goal: finalGoal,
      experience_level: experience,
      available_time: time,
      preferred_language: language,
      current_skills: selectedSkills,
      target_role: targetRole,
      // Pass mapped values for backward compatibility with backend
      current_level: experience,
      main_goal: 'Job',
      preferred_style: 'Projects',
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (currentStep === 5 && customSkillInput.trim()) {
        handleAddCustomSkill(e)
        return
      }
      if (canProceed()) {
        e.preventDefault()
        handleNext()
      }
    }
  }

  const currentMeta = STEP_METADATA[currentStep - 1]
  const CurrentIcon = currentMeta.icon

  return (
    <div
      onKeyDown={handleKeyDown}
      className="w-full text-left"
    >
      {/* ── STEPPER PROGRESS BAR (MINIMALIST 6-STEP) ────────── */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400">
              Step 0{currentStep} of 06
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
            {currentMeta.label}
          </span>
        </div>

        {/* 6-step segment track */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {STEP_METADATA.map((step) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id < currentStep || canProceed()) {
                    setCurrentStep(step.id)
                  }
                }}
                className="group relative h-1.5 w-full rounded-full overflow-hidden bg-neutral-900/80 transition-all cursor-pointer"
                title={`Step ${step.id}: ${step.label}`}
                aria-label={`Go to Step ${step.id}: ${step.label}`}
              >
                <div
                  className={`h-full w-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                      : isCompleted
                      ? 'bg-neutral-400 group-hover:bg-neutral-300'
                      : 'bg-transparent'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── STEP TITLE & SUBTITLE ──────────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] mb-3">
          <CurrentIcon className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-300">
            {currentMeta.label} Configuration
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {currentMeta.title}
        </h2>
        <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* ── INTERACTIVE STEP CONTENT (Framer Motion) ────────── */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: GOAL */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="roadmap-goal-input"
                  className="block text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2"
                >
                  Your Desired Trajectory
                </label>
                <div className="relative">
                  <input
                    id="roadmap-goal-input"
                    ref={goalInputRef}
                    type="text"
                    value={goal}
                    onChange={(e) => {
                      setGoal(e.target.value)
                      if (!e.target.value) onResetGoal?.()
                      onUserInteracting?.('typing')
                    }}
                    placeholder="e.g. Full Stack Developer, AI/ML Specialist, Systems Architect..."
                    className="w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/[0.12] rounded-xl px-4 py-3.5 text-base text-white placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all shadow-inner"
                  />
                  {goal && (
                    <button
                      type="button"
                      onClick={() => setGoal('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2.5">
                  Popular Career Blueprints
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_GOALS.map((qGoal) => {
                    const isSelected = goal.toLowerCase() === qGoal.toLowerCase()
                    return (
                      <button
                        key={qGoal}
                        type="button"
                        onClick={() => {
                          setGoal(qGoal)
                          onUserInteracting?.('chip')
                        }}
                        className={`text-xs font-medium px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-white bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                            : 'border-white/[0.08] bg-[#0c0c0c] text-neutral-300 hover:border-white/[0.25] hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        <span>{qGoal}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experience === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setExperience(opt.id)
                      onUserInteracting?.('select')
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                        : 'border-white/[0.08] bg-[#0a0a0a]/90 hover:border-white/[0.22] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                          {opt.tier}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-white bg-white text-black'
                              : 'border-neutral-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* STEP 3: TIME AVAILABLE */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {TIME_OPTIONS.map((opt) => {
                const isSelected = time === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTime(opt.id)
                      onUserInteracting?.('select')
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                        : 'border-white/[0.08] bg-[#0a0a0a]/90 hover:border-white/[0.22] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                          {opt.commitment}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-white bg-white text-black'
                              : 'border-neutral-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* STEP 4: PREFERRED LANGUAGE */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.id)
                        onUserInteracting?.('select')
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-white bg-white/[0.06] text-white shadow-[0_0_16px_rgba(255,255,255,0.05)]'
                          : 'border-white/[0.08] bg-[#0a0a0a]/90 text-neutral-300 hover:border-white/[0.22] hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-white">{opt.label}</h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{opt.desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-white bg-white text-black'
                            : 'border-neutral-700 bg-transparent'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: CURRENT SKILLS (MULTI-SELECT + CUSTOM INPUT) */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              <div>
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-3">
                  Select What You Already Know
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SKILL_PILLS.map((pill) => {
                    const isSelected = selectedSkills.includes(pill)
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => toggleSkill(pill)}
                        className={`text-xs font-medium px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-white bg-white text-black font-semibold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                            : 'border-white/[0.08] bg-[#0c0c0c] text-neutral-300 hover:border-white/[0.25] hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                        <span>{pill}</span>
                      </button>
                    )
                  })}

                  {/* Render any additional custom skills */}
                  {selectedSkills
                    .filter((s) => !DEFAULT_SKILL_PILLS.includes(s))
                    .map((customSkill) => (
                      <span
                        key={customSkill}
                        className="text-xs font-medium px-3 py-2 rounded-xl border border-white bg-white/10 text-white flex items-center gap-1.5"
                      >
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                        <span>{customSkill}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSkill(customSkill)
                          }}
                          className="ml-1 text-neutral-400 hover:text-white cursor-pointer"
                          aria-label={`Remove ${customSkill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              </div>

              {/* Custom skill adder */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label
                  htmlFor="custom-skill-input"
                  className="block text-xs font-mono text-neutral-400 uppercase tracking-widest mb-2"
                >
                  Add Custom Tech or Skill
                </label>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    id="custom-skill-input"
                    ref={skillInputRef}
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="e.g. Tailwind, Next.js, Kubernetes..."
                    className="flex-1 bg-[#0a0a0a]/90 border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    disabled={!customSkillInput.trim()}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: TARGET ROLE */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {TARGET_ROLE_OPTIONS.map((opt) => {
                const isSelected = targetRole === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTargetRole(opt.id)
                      onUserInteracting?.('select')
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                      isSelected
                        ? 'border-white bg-white/[0.06] shadow-[0_0_20px_rgba(255,255,255,0.06)]'
                        : 'border-white/[0.08] bg-[#0a0a0a]/90 hover:border-white/[0.22] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                          Role Profile
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-white bg-white text-black'
                              : 'border-neutral-700 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        {opt.label}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STEPPER NAVIGATION (BACK & NEXT BUTTONS) ───────── */}
      <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
        {/* Back button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-[#0a0a0a]/80 text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white hover:border-white/[0.25] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {/* Right side: Next / Synthesize */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
            Press Enter ↵
          </span>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Synthesize Roadmap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
