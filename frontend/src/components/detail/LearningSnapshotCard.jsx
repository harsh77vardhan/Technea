import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Check,
  Layers,
  BookOpen,
  Code2,
  Compass,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'

/**
 * Returns compact learning topics based on track title / category
 */
function getWhatYoullLearn(path) {
  if (path?.whatYoullLearn && Array.isArray(path.whatYoullLearn) && path.whatYoullLearn.length > 0) {
    return path.whatYoullLearn.slice(0, 5)
  }

  const title = (path?.title || '').toLowerCase()
  const category = (path?.category || '').toLowerCase()

  if (title.includes('python')) {
    return [
      'Variables & Data Types',
      'Functions',
      'Data Structures',
      'Problem Solving',
      'Real-world Python Projects',
    ]
  }

  if (title.includes('react')) {
    return [
      'Components & JSX',
      'State & Custom Hooks',
      'Virtual DOM Architecture',
      'Performance Tuning',
      'Real-world React Projects',
    ]
  }

  if (
    category.includes('ai') ||
    category.includes('machine learning') ||
    title.includes('machine learning') ||
    title.includes('ai')
  ) {
    return [
      'Core ML Algorithms',
      'NumPy & Pandas Pipelines',
      'Supervised Models',
      'Model Evaluation',
      'Real-world AI Projects',
    ]
  }

  if (category.includes('data') || title.includes('data') || title.includes('sql')) {
    return [
      'Data Cleaning & Prep',
      'Exploratory Analysis',
      'Statistical Modeling',
      'SQL Query Patterns',
      'Real-world Analytics',
    ]
  }

  if (title.includes('javascript') || title.includes('web') || title.includes('full stack')) {
    return [
      'Modern ES6+ Syntax',
      'Async Programming',
      'DOM Manipulation',
      'RESTful APIs',
      'Real-world Web Projects',
    ]
  }

  if (title.includes('java')) {
    return [
      'Core OOP Principles',
      'Collections & Generics',
      'Concurrency & Threads',
      'Stream API & Lambdas',
      'Real-world Java Projects',
    ]
  }

  if (title.includes('c++')) {
    return [
      'Memory & Pointers',
      'Object-Oriented C++',
      'Standard Template Library',
      'Modern C++ Idioms',
      'Real-world Systems',
    ]
  }

  if (title.includes('algorithm') || title.includes('data structure')) {
    return [
      'Time & Space Big-O',
      'Trees, Graphs & Hashes',
      'Sorting & Searching',
      'Dynamic Programming',
      'Technical Interviews',
    ]
  }

  // Fallback: derive concise names from roadmap_steps
  if (path?.roadmap_steps && path.roadmap_steps.length >= 3) {
    return path.roadmap_steps
      .slice(0, 5)
      .map((s) => s.title?.split('&')[0]?.split(',')[0]?.trim() || s.title)
  }

  return [
    'Core Syntax & Basics',
    'Modular Architecture',
    'Data Structures',
    'Defensive Testing',
    'Capstone Projects',
  ]
}

/**
 * Returns concise target career domains (avoiding paragraphs)
 */
function getCareerTags(path) {
  const title = (path?.title || '').toLowerCase()
  const category = (path?.category || '').toLowerCase()

  if (title.includes('python')) {
    return ['Automation', 'Data Science', 'Backend', 'AI']
  }
  if (title.includes('react')) {
    return ['Frontend Arch', 'UI Systems', 'Full-Stack React']
  }
  if (category.includes('ai') || category.includes('machine learning') || title.includes('ai')) {
    return ['Machine Learning', 'Applied AI', 'Model Inference']
  }
  if (category.includes('data') || title.includes('data') || title.includes('sql')) {
    return ['Data Analytics', 'SQL & Warehousing', 'BI Systems']
  }
  if (title.includes('javascript') || title.includes('web')) {
    return ['Full-Stack Web', 'API Development', 'Modern Cloud']
  }
  if (title.includes('java')) {
    return ['Enterprise Services', 'Cloud Architecture', 'Microservices']
  }
  if (title.includes('c++')) {
    return ['Systems Software', 'High Performance', 'Game Engines']
  }
  if (title.includes('algorithm') || title.includes('data structure')) {
    return ['Technical Interviews', 'Algorithms', 'System Design']
  }

  return ['Automation', 'Data Science', 'Backend', 'AI']
}

export default function LearningSnapshotCard({
  path,
  theme,
  metrics,
  coursesCount = 0,
  projectsCount = 3,
  onContinueLearning = () => {},
}) {
  const skillTitle = path?.title || 'Python Fundamentals'
  const learningPoints = useMemo(() => getWhatYoullLearn(path), [path])
  const careerTags = useMemo(() => getCareerTags(path), [path])

  // Learning Stats: numbers + short labels
  const milestonesCount =
    metrics?.stepsCount ||
    (path?.roadmap_steps && path.roadmap_steps.length > 0 ? path.roadmap_steps.length : 7)

  const resolvedCoursesCount =
    coursesCount > 0
      ? coursesCount
      : (metrics?.coursesCount > 0 ? metrics.coursesCount : 10)

  const resolvedProjectsCount = projectsCount > 0 ? projectsCount : 3

  const rawLevel = path?.level || 'Beginner'
  const levelDisplay = rawLevel.toLowerCase().includes('level') ? rawLevel : `${rawLevel} Level`

  const rawDuration = path?.duration || '4 Weeks'
  const durationDisplay = rawDuration.toLowerCase().startsWith('estimated')
    ? rawDuration
    : `Estimated ${rawDuration}`

  const stats = [
    {
      id: 'milestones',
      icon: Layers,
      iconColor: 'text-sky-400',
      label: `${milestonesCount} Milestones`,
    },
    {
      id: 'courses',
      icon: BookOpen,
      iconColor: 'text-emerald-400',
      label: `${resolvedCoursesCount} Courses`,
    },
    {
      id: 'projects',
      icon: Code2,
      iconColor: 'text-purple-400',
      label: `${resolvedProjectsCount} Projects`,
    },
    {
      id: 'level',
      icon: Compass,
      iconColor: 'text-amber-400',
      label: levelDisplay,
    },
    {
      id: 'duration',
      icon: Clock,
      iconColor: 'text-rose-400',
      label: durationDisplay,
      fullWidth: true,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative rounded-2xl p-px bg-gradient-to-b from-white/20 via-white/[0.08] to-white/10 shadow-xl backdrop-blur-xl group overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-2xl opacity-15"
        style={{ backgroundColor: theme?.accentHue || '#38bdf8' }}
      />

      <div className="relative rounded-2xl bg-[#0a0c10]/95 p-4 sm:p-5 backdrop-blur-xl space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
              Learning Snapshot
            </h2>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-neutral-400">
            Overview
          </span>
        </div>

        {/* 1. Skill Overview */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            <Sparkles className="h-3 w-3 text-sky-400" />
            <span>Skill Overview</span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-white tracking-tight truncate">
            {skillTitle}
          </div>
        </div>

        {/* 2. What You'll Learn (Compact bullet points) */}
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            What You&apos;ll Learn:
          </div>
          <ul className="space-y-1">
            {learningPoints.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs text-neutral-300 font-light truncate"
              >
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Learning Stats (Compact chip grid) */}
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Learning Stats:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.id}
                  className={`flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-neutral-300 font-mono ${
                    stat.fullWidth ? 'col-span-2' : 'col-span-1'
                  }`}
                >
                  <Icon className={`h-3 w-3 shrink-0 ${stat.iconColor}`} />
                  <span className="truncate text-[11px]">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Career Impact (No paragraphs - icons & short tags) */}
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            Career Impact:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {careerTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] sm:text-[11px] text-neutral-300"
              >
                <TrendingUp className="h-2.5 w-2.5 text-sky-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 5. Next Step (Small CTA) */}
        <div className="pt-2 border-t border-white/[0.08] space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-400">
            <span>Next Step:</span>
            <span className="text-emerald-400 font-medium">Ready</span>
          </div>

          <button
            type="button"
            onClick={onContinueLearning}
            className="group w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <span>Continue Learning</span>
            <ArrowRight className="h-3.5 w-3.5 text-black transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
