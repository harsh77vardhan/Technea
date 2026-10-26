import { useState } from 'react'
import { motion } from 'framer-motion'

const EXPERIENCE_OPTIONS = [
  { id: 'no_knowledge', level: 'Beginner', label: 'Complete Beginner', desc: 'Zero coding background.' },
  { id: 'basic_knowledge', level: 'Beginner', label: 'Some Basics', desc: 'Know syntax and core concepts.' },
  { id: 'some_projects', level: 'Intermediate', label: 'Built Projects', desc: 'Made apps, want production depth.' },
  { id: 'job_ready', level: 'Advanced', label: 'Working Engineer', desc: 'Transitioning or leveling up.' },
]

const TIME_OPTIONS = [
  { id: '30_mins', label: '5h / wk' },
  { id: '1_hour', label: '10h / wk' },
  { id: '2_hours', label: '15h / wk' },
  { id: '4_hours', label: '25h+' },
]

const STYLE_OPTIONS = [
  { id: 'projects', label: 'Build projects' },
  { id: 'videos', label: 'Watch videos' },
  { id: 'reading', label: 'Read docs' },
]

const GOAL_OPTIONS = [
  { id: 'get_job', label: 'Get a job' },
  { id: 'get_internship', label: 'Internship' },
  { id: 'startup', label: 'Build startup' },
  { id: 'college', label: 'CS mastery' },
]

const TRAJECTORY_TAGS = [
  'Full Stack Developer',
  'AI Engineer',
  'Cloud & DevOps',
  'Cybersecurity',
  'Data Science',
  'Systems Engineering',
]

export default function AIArchitectConversation({
  initialGoal,
  onStartSynthesis,
  onResetGoal,
  onUserInteracting,
}) {
  const [goal, setGoal] = useState(initialGoal || '')
  const [experience, setExperience] = useState('basic_knowledge')
  const [time, setTime] = useState('1_hour')
  const [style, setStyle] = useState('projects')
  const [mainGoal, setMainGoal] = useState('get_job')

  const [prevInitialGoal, setPrevInitialGoal] = useState(initialGoal)

  if (initialGoal !== prevInitialGoal) {
    setPrevInitialGoal(initialGoal)
    if (initialGoal) {
      setGoal(initialGoal)
    }
  }

  const handleSubmit = () => {
    const activeGoal = goal.trim() || 'Full Stack Developer'
    const expObj = EXPERIENCE_OPTIONS.find((e) => e.id === experience) || EXPERIENCE_OPTIONS[1]
    onStartSynthesis?.({
      goal: activeGoal,
      experience_level: expObj.level,
      current_level: experience,
      available_time: time,
      main_goal: mainGoal,
      preferred_style: style,
    })
  }

  const handleGoalChange = (newGoal) => {
    setGoal(newGoal)
    if (!newGoal) {
      onResetGoal?.()
    }
    onUserInteracting?.('typing')
  }

  return (
    <div className="w-full">
      {/* 1. HERO TEXT */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-center mb-8 sm:mb-10"
      >
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-[#555] mb-3">
          Roadmap Builder
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
          What do you want to build?
        </h1>
        <p className="text-sm text-[#666] mt-2">
          Describe your goal and get a structured learning path.
        </p>
      </motion.div>

      {/* 2. SEARCH INPUT + TRAJECTORY CHIPS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-2">Your goal</p>
        <div className="relative">
          <input
            type="text"
            value={goal}
            onChange={(e) => handleGoalChange(e.target.value)}
            placeholder="e.g. Full Stack Developer, Machine Learning..."
            className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-white placeholder-[#3a3a3a] focus:border-[#444] focus:outline-none transition-colors"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRAJECTORY_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleGoalChange(tag)}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                goal === tag
                  ? 'border-white text-white bg-white/5'
                  : 'border-[#222] text-[#555] hover:border-[#333] hover:text-[#888]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 3. EXPERIENCE LEVEL */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mb-6"
      >
        <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-2">
          Experience level
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXPERIENCE_OPTIONS.map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setExperience(opt.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                experience === opt.id
                  ? 'border-white bg-white/[0.03]'
                  : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
              }`}
            >
              <p className="text-xs font-mono text-[#555] mb-1">
                {idx === 0 ? 'Tier 0' : idx === 1 ? 'Tier 1' : idx === 2 ? 'Tier 2' : 'Tier 3'}
              </p>
              <p className="text-sm font-medium text-white">{opt.label}</p>
              <p className="text-xs text-[#555] mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 4. TWO-COLUMN ROW: Weekly Time + Primary Goal */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* LEFT - Time */}
        <div>
          <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-2">Weekly time</p>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTime(opt.id)}
                className={`py-2 text-center text-sm rounded-lg border cursor-pointer transition-all ${
                  time === opt.id
                    ? 'border-white text-white bg-white/[0.03]'
                    : 'border-[#1a1a1a] text-[#666] hover:border-[#2a2a2a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT - Goal */}
        <div>
          <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-2">Primary goal</p>
          <div className="grid grid-cols-2 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMainGoal(opt.id)}
                className={`py-2 text-center text-sm rounded-lg border cursor-pointer transition-all ${
                  mainGoal === opt.id
                    ? 'border-white text-white bg-white/[0.03]'
                    : 'border-[#1a1a1a] text-[#666] hover:border-[#2a2a2a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. LEARNING STYLE */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="mb-8"
      >
        <p className="text-xs font-mono text-[#555] uppercase tracking-widest mb-2">
          How you learn best
        </p>
        <div className="grid grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStyle(opt.id)}
              className={`py-3 text-center text-xs rounded-xl border cursor-pointer transition-all ${
                style === opt.id
                  ? 'border-white text-white bg-white/[0.03]'
                  : 'border-[#1a1a1a] text-[#666] hover:border-[#2a2a2a]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 6. SUBMIT BUTTON */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-[#f0f0f0] active:scale-[0.99] transition-all cursor-pointer"
        >
          Generate My Roadmap
        </button>
        <p className="text-center text-xs text-[#444] mt-3">Takes about 10-15 seconds</p>
      </motion.div>
    </div>
  )
}
