import { useMemo } from 'react'

const FILTER_GROUPS = [
  {
    id: 'level',
    label: 'Level',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    id: 'time',
    label: 'Time',
    options: ['15 min/day', '30 min/day', '1 hour/day'],
  },
  {
    id: 'goal',
    label: 'Goal',
    options: ['College', 'Job', 'Projects', 'Freelancing'],
  },
  {
    id: 'learningStyle',
    label: 'Learning Style',
    options: ['Videos', 'Reading', 'Projects'],
  },
  {
    id: 'language',
    label: 'Language',
    options: ['English', 'Hindi', 'Hinglish'],
  },
]

function getJourneySteps(skillTitle) {
  const lower = (skillTitle || '').toLowerCase()

  if (lower.includes('python')) {
    return [
      { num: '01', title: 'Fundamentals', desc: 'Syntax, logic, data types & working with variables.' },
      { num: '02', title: 'Core Concepts', desc: 'Data structures, loops, functions & modular code.' },
      { num: '03', title: 'Practice', desc: 'Algorithmic challenges, debugging & writing clean scripts.' },
      { num: '04', title: 'Real Projects', desc: 'Build working applications and automation scripts.' },
    ]
  }

  if (lower.includes('react') || lower.includes('next') || lower.includes('web')) {
    return [
      { num: '01', title: 'Fundamentals', desc: 'JSX syntax, component hierarchy, props & styling architecture.' },
      { num: '02', title: 'Core Concepts', desc: 'State hooks, effect lifecycles & clean reactive data flow.' },
      { num: '03', title: 'Practice', desc: 'Custom hooks, responsive interfaces & REST API integrations.' },
      { num: '04', title: 'Real Projects', desc: 'Deploy production full-stack web applications to edge clouds.' },
    ]
  }

  if (lower.includes('machine learning') || lower.includes('deep learning') || lower.includes('ai')) {
    return [
      { num: '01', title: 'Fundamentals', desc: 'Mathematical intuition, dataset exploration & preparation.' },
      { num: '02', title: 'Core Concepts', desc: 'Supervised algorithms, regression, neural layers & metrics.' },
      { num: '03', title: 'Practice', desc: 'Evaluating predictions, hyperparameter tuning & loss optimization.' },
      { num: '04', title: 'Real Projects', desc: 'Deploy lightweight predictive models and generative workflows.' },
    ]
  }

  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux') || lower.includes('figma')) {
    return [
      { num: '01', title: 'Fundamentals', desc: 'Visual hierarchy, typography systems, color theory & layout grids.' },
      { num: '02', title: 'Core Concepts', desc: 'Design systems, auto-layout tokens, wireframes & component kits.' },
      { num: '03', title: 'Practice', desc: 'Interactive prototyping, micro-interactions & usability testing.' },
      { num: '04', title: 'Real Projects', desc: 'Design end-to-end product interfaces with complete design systems.' },
    ]
  }

  if (lower.includes('video') || lower.includes('edit')) {
    return [
      { num: '01', title: 'Fundamentals', desc: 'Timeline navigation, cut selection, narrative pacing & audio balancing.' },
      { num: '02', title: 'Core Concepts', desc: 'Multi-cam workflows, node color grading & dynamic soundscapes.' },
      { num: '03', title: 'Practice', desc: 'Keyframing, motion graphics, speed ramps & viral storytelling.' },
      { num: '04', title: 'Real Projects', desc: 'Produce cinematic portfolio edits and generative AI content.' },
    ]
  }

  return [
    { num: '01', title: 'Fundamentals', desc: `Core syntax, setup logic & foundational mental models.` },
    { num: '02', title: 'Core Concepts', desc: `Essential patterns, best practices & standard development tooling.` },
    { num: '03', title: 'Practice', desc: `Hands-on problem solving, refactoring & structured execution.` },
    { num: '04', title: 'Real Projects', desc: `Build and publish production-grade portfolio capstones.` },
  ]
}

function getRelatedExplorations(skillTitle) {
  const lower = (skillTitle || '').toLowerCase()

  if (lower.includes('python')) {
    return ['Python for AI', 'Data Science', 'Backend Development', 'Automation']
  }
  if (lower.includes('react') || lower.includes('web')) {
    return ['Next.js', 'TypeScript', 'UI Engineering', 'Full-Stack Development']
  }
  if (lower.includes('machine learning') || lower.includes('ai')) {
    return ['AI Agents', 'Deep Learning', 'Prompt Engineering', 'Data Science']
  }
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
    return ['Product Design', 'Figma Systems', 'Design Tokens', 'Frontend Foundations']
  }
  if (lower.includes('video') || lower.includes('edit')) {
    return ['Video Editing', 'CapCut', 'DaVinci Resolve', 'Generative AI']
  }

  return ['Python for AI', 'Data Science', 'Backend Development', 'Automation']
}

export default function PostSearchResults({
  searchedSkill,
  submittedQuery,
  preferences,
  onPreferenceChange,
  onSelectRelated,
}) {
  const skillTitle = searchedSkill ? searchedSkill.title : submittedQuery
  const category = searchedSkill?.category || 'Learning Path'
  const levelFriendly = searchedSkill?.level || preferences.level || 'Beginner'
  const duration = searchedSkill?.duration || '4 Weeks'

  const journeySteps = useMemo(() => getJourneySteps(skillTitle), [skillTitle])
  const relatedList = useMemo(() => getRelatedExplorations(skillTitle), [skillTitle])

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── TOP SECTION: Searched skill prominent + subtle metadata ─────── */}
      <div className="border-b border-white/[0.07] pb-5">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          {skillTitle}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-neutral-400 font-light">
          <span>{category}</span>
          <span className="text-neutral-600">·</span>
          <span>{levelFriendly} friendly</span>
          <span className="text-neutral-600">·</span>
          <span className="font-mono text-neutral-300">{duration}</span>
        </div>
      </div>

      {/* ── MAIN CONTENT: Two-column Structure ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Learning path preview */}
        <div className="lg:col-span-7">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-6">
            Your learning journey
          </h2>

          <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {journeySteps.map((step) => (
              <div key={step.num} className="relative">
                {/* Connecting hairline node */}
                <div className="absolute -left-6 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-white/20 bg-[#08090d] flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/70" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-neutral-400">
                    {step.num}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Personalization panel */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-5">
            Customize your path
          </h2>

          <div className="space-y-4">
            {FILTER_GROUPS.map((group) => {
              const activeVal = preferences[group.id]

              return (
                <div key={group.id} className="space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {group.label}
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((option) => {
                      const isSelected = activeVal === option

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            onPreferenceChange(
                              group.id,
                              isSelected ? null : option
                            )
                          }
                          className={`
                            rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer
                            ${
                              isSelected
                                ? 'bg-white text-black font-semibold border border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                                : 'border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white font-medium'
                            }
                          `}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── RELATED SKILLS: Below main section ───────────────────────────── */}
      <div className="pt-6 border-t border-white/[0.07]">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          You may also explore
        </h2>

        <div className="flex flex-wrap gap-2">
          {relatedList.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectRelated(item)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white transition-all cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
