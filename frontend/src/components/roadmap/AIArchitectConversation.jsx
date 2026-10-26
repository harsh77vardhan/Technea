import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Sparkles,
  ArrowRight,
  Brain,
  Layers,
  Cloud,
  Shield,
  Database,
  Cpu,
  Check,
  X,
  Briefcase,
  GraduationCap,
  Rocket,
  Globe,
  Terminal,
  FolderGit2,
  BookOpen,
  PlayCircle,
  Clock,
} from 'lucide-react'

const TRAJECTORY_CHIPS = [
  { id: 'ai', label: 'Autonomous AI Engineer', query: 'Autonomous AI Engineer', icon: Brain, badge: 'Popular' },
  { id: 'fullstack', label: 'Full Stack Architect', query: 'Full Stack Architect', icon: Layers, badge: 'High Demand' },
  { id: 'cloud', label: 'Cloud & DevOps Platform', query: 'Cloud & DevOps Engineer', icon: Cloud, badge: 'Enterprise' },
  { id: 'cyber', label: 'Cybersecurity Specialist', query: 'Cybersecurity Specialist', icon: Shield, badge: 'Mission Critical' },
  { id: 'data', label: 'Data Science & MLOps', query: 'Data Scientist & MLOps', icon: Database, badge: 'Trending' },
  { id: 'systems', label: 'Distributed Systems Core', query: 'Distributed Systems Engineer', icon: Cpu, badge: 'High Scale' },
]

const EXPERIENCE_OPTIONS = [
  {
    id: 'no_knowledge',
    level: 'Beginner',
    label: 'Absolute Beginner',
    subtitle: 'Zero coding background',
    desc: 'First-principles logic, foundational algorithmic thinking, and core toolchains.',
    tag: 'Tier 0',
  },
  {
    id: 'basic_knowledge',
    level: 'Beginner',
    label: 'Foundational Developer',
    subtitle: 'Basic syntax & concepts',
    desc: 'Familiar with variables, basic data structures, conditionals, and simple scripts.',
    tag: 'Tier 1',
  },
  {
    id: 'some_projects',
    level: 'Intermediate',
    label: 'Intermediate Builder',
    subtitle: 'Built standalone apps',
    desc: 'Experienced building full-stack apps. Ready for distributed architectures and system scale.',
    tag: 'Tier 2',
  },
  {
    id: 'job_ready',
    level: 'Advanced',
    label: 'Advanced Specialist',
    subtitle: 'Production background',
    desc: 'Seasoned engineer transitioning or leveling up to senior/staff technical mastery.',
    tag: 'Tier 3',
  },
]

const TIME_OPTIONS = [
  {
    id: '30_mins',
    hours: '5 Hours / week',
    label: '5h / wk',
    subtitle: 'Steady Focus',
    desc: 'Focused micro-sprints around work or academic studies.',
  },
  {
    id: '1_hour',
    hours: '10 Hours / week',
    label: '10h / wk',
    subtitle: 'Balanced Rhythm',
    desc: 'Optimal velocity with weekly production milestones.',
    popular: true,
  },
  {
    id: '2_hours',
    hours: '15-20 Hours / week',
    label: '15h / wk',
    subtitle: 'Accelerated Track',
    desc: 'Fast-track trajectory through deep labs and architectural builds.',
  },
  {
    id: '4_hours',
    hours: '25+ Hours / week',
    label: '25h+ / wk',
    subtitle: 'Immersive Sprint',
    desc: 'Full-time intensive acceleration towards immediate placement.',
  },
]

const GOAL_OPTIONS = [
  {
    id: 'get_job',
    label: 'Placement & Job',
    subtitle: 'High-Signal Portfolio',
    desc: 'Technical interviews, system design, and verified production code.',
    icon: Briefcase,
  },
  {
    id: 'get_internship',
    label: 'Internship Credentials',
    subtitle: 'Entry Fast-Track',
    desc: 'Verified fundamentals and fast practical proofs of competence.',
    icon: GraduationCap,
  },
  {
    id: 'startup',
    label: 'Startup MVP',
    subtitle: 'Zero to Production',
    desc: 'End-to-end full-stack SaaS delivery, scalable database, and cloud deployments.',
    icon: Rocket,
  },
  {
    id: 'freelance',
    label: 'Freelance Systems',
    subtitle: 'Client APIs & Contracts',
    desc: 'Client-facing deliverables, modern API ecosystems, and swift delivery.',
    icon: Globe,
  },
  {
    id: 'college',
    label: 'CS Core Mastery',
    subtitle: 'Theory & Systems',
    desc: 'System architecture, operating systems, networking, and algorithmic rigor.',
    icon: Terminal,
  },
]

const STYLE_OPTIONS = [
  {
    id: 'projects',
    label: 'Hands-on Projects',
    subtitle: 'Build while learning',
    desc: 'Code production repos, deploy real microservices, and solve engineering challenges.',
    icon: FolderGit2,
    badge: 'Recommended',
  },
  {
    id: 'reading',
    label: 'Specs & Technical Docs',
    subtitle: 'Deep architecture RFCs',
    desc: 'Study system specs, whitepapers, RFCs, and official platform documentation.',
    icon: BookOpen,
  },
  {
    id: 'videos',
    label: 'Guided Visual Labs',
    subtitle: 'Curated video breakdowns',
    desc: 'High-signal visual walkthroughs, architectural diagrams, and step-by-step videos.',
    icon: PlayCircle,
  },
]

export default function AIArchitectConversation({
  initialGoal = '',
  onStartSynthesis,
  onGoalChange,
}) {
  const [goal, setGoal] = useState(initialGoal || 'Full Stack Architect')
  const [experience, setExperience] = useState('basic_knowledge')
  const [time, setTime] = useState('1_hour')
  const [primaryGoal, setPrimaryGoal] = useState('get_job')
  const [style, setStyle] = useState('projects')

  const handleGoalInput = (val) => {
    setGoal(val)
    onGoalChange?.(val)
  }

  const handleSelectTrajectory = (query) => {
    setGoal(query)
    onGoalChange?.(query)
  }

  const handleGenerate = () => {
    const cleanGoal = goal.trim() || 'Full Stack Architect'
    const expObj = EXPERIENCE_OPTIONS.find((e) => e.id === experience) || EXPERIENCE_OPTIONS[1]
    onStartSynthesis?.({
      goal: cleanGoal,
      experience_level: expObj.level,
      current_level: experience,
      available_time: time,
      main_goal: primaryGoal,
      preferred_style: style,
    })
  }

  const activeExp = EXPERIENCE_OPTIONS.find((e) => e.id === experience)
  const activeTime = TIME_OPTIONS.find((t) => t.id === time)
  const activeGoal = GOAL_OPTIONS.find((g) => g.id === primaryGoal)
  const activeStyle = STYLE_OPTIONS.find((s) => s.id === style)

  return (
    <div
      data-lenis-prevent
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 select-none"
    >
      {/* ── Section 1: Hero Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00A3FF]/30 bg-[#00A3FF]/[0.08] px-3.5 py-1 text-[11px] font-mono tracking-[0.25em] uppercase text-[#00A3FF]">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#00A3FF] animate-pulse" />
          <span>AI COMMAND CENTER // V3.2</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          ARCHITECT YOUR <span className="text-[#00A3FF]">CAREER</span>{' '}
          <span className="text-[#FF0055]">TRAJECTORY</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Configure your engineering roadmap. Our autonomous neural compiler maps prerequisite
          dependencies, verified courses, and production project blueprints to your velocity.
        </p>
      </div>

      {/* ── Section 2: Career Search Console ── */}
      <div className="space-y-3">
        <div className="relative rounded-2xl border border-white/[0.12] bg-[#07080c]/90 p-2 sm:p-2.5 transition-all duration-300 focus-within:border-[#00A3FF] focus-within:shadow-[0_0_30px_rgba(0,163,255,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 px-2 sm:px-3">
            <Search className="h-5 w-5 text-[#00A3FF] shrink-0" />
            <input
              type="text"
              value={goal}
              onChange={(e) => handleGoalInput(e.target.value)}
              placeholder="e.g. Autonomous AI Engineer, Cloud DevOps Architect, Rust Core Systems..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none font-mono tracking-wide"
            />
            {goal && (
              <button
                type="button"
                onClick={() => handleGoalInput('')}
                className="text-neutral-500 hover:text-white transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Instant Trajectory Quick Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-400 block pl-1">
            INSTANT TRAJECTORY PRESETS
          </span>
          <div className="flex flex-wrap gap-2">
            {TRAJECTORY_CHIPS.map((chip) => {
              const Icon = chip.icon
              const isSelected = goal.toLowerCase().trim() === chip.query.toLowerCase().trim()
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleSelectTrajectory(chip.query)}
                  className={`group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-[0_0_15px_rgba(0,163,255,0.25)]'
                      : 'border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#00A3FF]' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                  <span>{chip.label}</span>
                  {chip.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.06] text-neutral-400 group-hover:text-neutral-200">
                      {chip.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 3: Configuration Modules Deck ── */}
      <div className="space-y-6">
        {/* Module 01: Experience Level */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#00A3FF] flex items-center gap-2">
              <span>01 //</span>
              <span>TECHNICAL EXPERIENCE BASELINE</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Active: {activeExp?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {EXPERIENCE_OPTIONS.map((opt) => {
              const isSelected = experience === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExperience(opt.id)}
                  className={`group relative rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#00A3FF] bg-[#00A3FF]/[0.08] shadow-[0_0_20px_rgba(0,163,255,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'border-white/[0.08] bg-[#06070a]/70 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 text-neutral-400">
                        {opt.tag}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#00A3FF]" />}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold tracking-tight ${isSelected ? 'text-[#00A3FF]' : 'text-white'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{opt.subtitle}</div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed line-clamp-2">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Module 02: Weekly Commitment */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#00A3FF] flex items-center gap-2">
              <span>02 //</span>
              <span>WEEKLY COMMITMENT VELOCITY</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Active: {activeTime?.hours}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {TIME_OPTIONS.map((opt) => {
              const isSelected = time === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTime(opt.id)}
                  className={`group relative rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? 'border-[#00A3FF] bg-[#00A3FF]/[0.08] shadow-[0_0_20px_rgba(0,163,255,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'border-white/[0.08] bg-[#06070a]/70 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                      <Clock className="h-3 w-3 text-[#00A3FF]" />
                      {opt.label}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#00A3FF]" />}
                  </div>
                  <div className={`text-xs sm:text-sm font-bold tracking-tight ${isSelected ? 'text-[#00A3FF]' : 'text-white'}`}>
                    {opt.hours}
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-snug">{opt.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Module 03: Primary Strategic Outcome */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#FF0055] flex items-center gap-2">
              <span>03 //</span>
              <span>PRIMARY STRATEGIC OUTCOME</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Active: {activeGoal?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {GOAL_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = primaryGoal === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPrimaryGoal(opt.id)}
                  className={`group relative rounded-2xl p-3.5 text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#FF0055] bg-[#FF0055]/[0.08] shadow-[0_0_20px_rgba(255,0,85,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'border-white/[0.08] bg-[#06070a]/70 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#FF0055]/20 text-[#FF0055]' : 'bg-white/[0.04] text-neutral-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#FF0055]" />}
                    </div>
                    <div className={`text-xs font-bold tracking-tight ${isSelected ? 'text-[#FF0055]' : 'text-white'}`}>
                      {opt.label}
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2 leading-tight">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Module 04: Learning Architecture & Style */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#00A3FF] flex items-center gap-2">
              <span>04 //</span>
              <span>LEARNING ARCHITECTURE & STYLE</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              Active: {activeStyle?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {STYLE_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const isSelected = style === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStyle(opt.id)}
                  className={`group relative rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#00A3FF] bg-[#00A3FF]/[0.08] shadow-[0_0_20px_rgba(0,163,255,0.18),inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'border-white/[0.08] bg-[#06070a]/70 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#00A3FF]/20 text-[#00A3FF]' : 'bg-white/[0.04] text-neutral-400'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#00A3FF]" />}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold tracking-tight ${isSelected ? 'text-[#00A3FF]' : 'text-white'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{opt.subtitle}</div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Section 4: Live Telemetry Configuration Strip ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#050608]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 text-neutral-400">
          <span className="text-[#00A3FF] font-bold">TELEMETRY:</span>
          <span className="rounded bg-white/[0.05] px-2 py-0.5 text-white">{goal || 'Target Role'}</span>
          <span>•</span>
          <span className="rounded bg-white/[0.05] px-2 py-0.5 text-white">{activeExp?.label}</span>
          <span>•</span>
          <span className="rounded bg-white/[0.05] px-2 py-0.5 text-white">{activeTime?.hours}</span>
          <span>•</span>
          <span className="rounded bg-white/[0.05] px-2 py-0.5 text-[#FF0055]">{activeGoal?.label}</span>
        </div>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
          READY FOR SYNTHESIS
        </span>
      </div>

      {/* ── Section 5: High-Impact Synthesis Action Button ── */}
      <div className="pt-2">
        <motion.button
          type="button"
          onClick={handleGenerate}
          disabled={!goal.trim()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full relative group rounded-2xl bg-gradient-to-r from-[#00A3FF] via-[#0084FF] to-[#FF0055] text-white p-[1px] shadow-[0_0_35px_rgba(0,163,255,0.25),0_15px_40px_rgba(0,0,0,0.8)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="w-full h-full rounded-[15px] bg-[#05060a]/90 hover:bg-[#05060a]/75 backdrop-blur-xl px-6 py-4 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00A3FF]/20 to-[#FF0055]/20 border border-white/10">
                <Sparkles className="h-5 w-5 text-[#00A3FF] animate-pulse" />
              </div>
              <div className="text-left">
                <span className="text-sm sm:text-base font-bold font-mono tracking-wider uppercase block text-white">
                  SYNTHESIZE CAREER ARCHITECTURE
                </span>
                <span className="text-[11px] font-mono text-neutral-400 block">
                  Autonomous Graph Compiler • Tailored Milestone Sequence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-[#00A3FF] hidden md:inline uppercase">
                EXECUTE SEQUENCE
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 group-hover:bg-[#00A3FF] group-hover:text-black transition-all">
                <ArrowRight className="h-4 w-4 text-white group-hover:text-black transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
