import { memo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ExternalLink,
  Flame,
  Share2,
  Check,
  Code2,
  Rocket,
  Trophy,
} from 'lucide-react'

/**
 * DashboardReferenceOverview
 *
 * Implements the exact layout structure, typography hierarchy, visual flow,
 * and card placement from reference image `techneadashboardfinal1.png`
 * styled in Technea's signature luxury dark monochrome and ambient violet/blue glass language.
 */
function DashboardReferenceOverview({
  user,
  currentPath,
  overallPercent = 68,
  streakCount = 7,
  onResumeMilestone = () => {},
  onLaunchWorkspace = () => {},
  onShare = () => {},
  onNavigateTab = () => {},
}) {
  const fullName = user?.full_name || user?.email?.split('@')[0] || 'Harsh'
  const firstName = fullName.split(' ')[0]

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours()
  let greetingTime = 'evening'
  if (currentHour >= 5 && currentHour < 12) {
    greetingTime = 'morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    greetingTime = 'afternoon'
  }

  // Active milestone details
  const activeMilestoneTitle = currentPath?.next_step_title || 'Build a Responsive AI Chat UI'
  const activeRoadmapTitle = currentPath?.title || 'React Fundamentals'
  const displayProgress = overallPercent > 0 ? overallPercent : 68

  return (
    <div className="space-y-6 sm:space-y-7 pb-4">
      {/* ──────────────── Top Greeting & Quick Telemetry Header ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 font-normal tracking-wide">
            Continue building your future.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Streak Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0c101a]/80 backdrop-blur-xl px-3.5 py-1.5 text-xs font-mono font-medium text-neutral-200 shadow-sm">
            <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>{streakCount}-day streak</span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0c101a]/80 backdrop-blur-xl px-3.5 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/25 hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm active:scale-95"
            title="Share your learning progression"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ──────────────── SECTION 1: TODAY'S LEARNING MISSION ──────────────── */}
      <section aria-labelledby="section-mission-title" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-neutral-400 font-semibold px-0.5">
          <span id="section-mission-title" className="uppercase">
            TODAY&apos;S LEARNING MISSION
          </span>
          <span className="text-neutral-400 font-medium normal-case sm:uppercase">
            Learning operating system
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0e18]/85 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.6)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent hover:border-white/20 transition-all duration-300 group">
          {/* Sequence & Progress Row */}
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2.5">
            <span className="text-neutral-300 font-medium">04 / Styling and Flexbox</span>
            <span className="text-neutral-200 font-semibold">{displayProgress}% Progress</span>
          </div>

          {/* Massive Headline */}
          <div className="mb-6">
            <button
              type="button"
              onClick={onResumeMilestone}
              className="text-left group/btn inline-flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <span>{activeMilestoneTitle}</span>
              <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400 group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Actions on Left, Progress Bar on Right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-1 border-t border-white/[0.06]">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onResumeMilestone}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-black font-bold px-5 py-2.5 text-xs hover:bg-neutral-200 transition-all duration-200 cursor-pointer shadow-[0_2px_16px_rgba(255,255,255,0.25)] hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <span>Resume Learning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onLaunchWorkspace}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.14] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 text-white px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer shadow-inner active:scale-95"
              >
                <span>Launch</span>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            </div>

            {/* Progress Bar & Est. Time */}
            <div className="flex flex-col items-start md:items-end gap-1.5 min-w-[200px] sm:min-w-[240px]">
              <div className="w-full bg-white/[0.08] h-2 sm:h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                />
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tracking-wide">
                Est. Time: 45m
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 2: CONTINUE LEARNING & CURRENT ROADMAP ──────────────── */}
      <section aria-labelledby="section-roadmap-title" className="space-y-2">
        <h2
          id="section-roadmap-title"
          className="text-[11px] font-mono tracking-widest text-neutral-400 font-semibold px-0.5 uppercase"
        >
          CONTINUE LEARNING &amp; CURRENT ROADMAP
        </h2>

        <div className="rounded-2xl border border-white/[0.1] bg-[#0a0e18]/85 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: 4-Node Circuit Track */}
            <div className="flex-1 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-[340px] flex items-center justify-between relative py-2">
                {/* Node 1: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full border border-white/20 bg-[#121724] text-neutral-200 flex items-center justify-center shadow-inner">
                    <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 font-medium">Completed</span>
                </div>

                {/* Connector Line 1-2 */}
                <div className="flex-1 h-[2px] bg-white/20 mx-2 -mt-5" />

                {/* Node 2: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full border border-white/20 bg-[#121724] text-neutral-200 flex items-center justify-center shadow-inner">
                    <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 font-medium">Node 2</span>
                </div>

                {/* Connector Line 2-3 */}
                <div className="flex-1 h-[2px] bg-white/20 mx-2 -mt-5" />

                {/* Node 3: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full border border-white/20 bg-[#121724] text-neutral-200 flex items-center justify-center shadow-inner">
                    <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 font-medium">Node 3</span>
                </div>

                {/* Connector Line 3-4 */}
                <div className="flex-1 h-[2px] bg-white/20 mx-2 -mt-5" />

                {/* Node 4: Active Beacon with Radiant Violet Aura */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer radiant aura */}
                    <span className="absolute -inset-1.5 rounded-full bg-violet-600/40 blur-md animate-pulse" />
                    <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.85)] ring-2 ring-violet-400/60">
                      04
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-violet-400 tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Dotted Link to Active Milestone Card */}
            <div className="hidden lg:flex items-center justify-center px-1">
              <div className="w-8 border-t-2 border-dotted border-violet-400/50" />
            </div>

            {/* Right: Connected Active Milestone Card */}
            <div
              onClick={onResumeMilestone}
              className="w-full lg:w-72 rounded-xl border border-violet-500/30 bg-violet-950/20 backdrop-blur-xl p-4 hover:border-violet-400/50 hover:bg-violet-950/30 transition-all duration-300 cursor-pointer shadow-lg group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">
                  {activeRoadmapTitle}
                </span>
                {/* React Atom / Engineering Icon */}
                <div className="h-6 w-6 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
                  <Code2 className="h-3.5 w-3.5" />
                </div>
              </div>

              <p className="text-xs font-mono text-neutral-300 mb-2.5">75% complete</p>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 w-3/4 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 3: PORTFOLIO PROJECTS & ACHIEVEMENTS ──────────────── */}
      <section aria-labelledby="section-portfolio-title" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-neutral-400 font-semibold px-0.5">
          <span id="section-portfolio-title" className="uppercase">
            PORTFOLIO PROJECTS &amp; ACHIEVEMENTS
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('portfolio')}
            className="inline-flex items-center gap-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Share Portfolio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Featured Portfolio Project */}
          <div
            onClick={() => onNavigateTab('projects')}
            className="rounded-2xl border border-white/[0.1] bg-[#0a0e18]/85 backdrop-blur-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-neutral-200 transition-colors">
                Personal Portfolio Website
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-mono text-neutral-300">
                <span>Public</span>
                <ExternalLink className="h-2.5 w-2.5 text-neutral-400" />
              </span>
            </div>

            {/* Tech Tags matching the screenshot pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="rounded-md border border-orange-500/40 bg-orange-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-orange-300">
                HTML
              </span>
              <span className="rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-300">
                CSS
              </span>
              <span className="rounded-md border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-300">
                JS
              </span>
              <span className="rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-mono font-medium text-cyan-300">
                React
              </span>
            </div>
          </div>

          {/* Card B: Achievements Summary */}
          <div
            onClick={() => onNavigateTab('achievements')}
            className="rounded-2xl border border-white/[0.1] bg-[#0a0e18]/85 backdrop-blur-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-white/20 transition-all duration-300 cursor-pointer flex items-center justify-around gap-4"
          >
            {/* Achievement 1: Fast Learner */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 flex items-center justify-center shrink-0 shadow-inner">
                <Rocket className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight">Fast Learner</p>
                <p className="text-[11px] font-mono text-neutral-400">Artwork</p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/[0.08]" />

            {/* Achievement 2: Milestone 4 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white tracking-tight">Milestone 4</p>
                <p className="text-[11px] font-mono text-neutral-400">Artwork</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(DashboardReferenceOverview)
