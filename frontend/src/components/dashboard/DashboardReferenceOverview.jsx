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
 * Implements the exact center command deck from `techneadashboardfinal1.png`:
 * - Crisp, clean, calm futuristic workspace colors
 * - Pure white cards #ffffff with subtle borders #e2e8f0 and soft ambient shadow
 * - Bold dark typography #0f172a
 * - Solid black CTA "Resume Learning →"
 * - 4-node circuit track with glowing violet Active node "04"
 * - Soft lavender active milestone preview card #ede9fe
 * - Portfolio card with exact pastel tech tags (HTML, CSS, JS, React) and verified achievements
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
    <div className="space-y-6 sm:space-y-7 pb-2">
      {/* ──────────────── Top Greeting & Quick Telemetry Header ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0f172a]">
            Good {greetingTime}, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1 font-normal tracking-wide">
            Continue building your future.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Streak Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white px-3.5 py-1.5 text-xs font-mono font-medium text-[#1e293b] shadow-xs">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span>{streakCount}-day streak</span>
          </div>

          {/* Share Button */}
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-white hover:bg-neutral-50 px-3.5 py-1.5 text-xs font-mono text-[#1e293b] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Share your learning progression"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ──────────────── SECTION 1: TODAY'S LEARNING MISSION ──────────────── */}
      <section aria-labelledby="section-mission-title" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#64748b] font-semibold px-0.5">
          <span id="section-mission-title" className="uppercase">
            TODAY&apos;S LEARNING MISSION
          </span>
          <span className="text-[#64748b] font-medium normal-case sm:uppercase">
            Learning operating system
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-[#cbd5e1] transition-all duration-300 group">
          {/* Sequence & Progress Row */}
          <div className="flex items-center justify-between text-xs font-mono text-[#475569] mb-2.5">
            <span className="text-[#475569] font-medium">04 / Styling and Flexbox</span>
            <span className="text-[#0f172a] font-semibold">{displayProgress}% Progress</span>
          </div>

          {/* Massive Headline */}
          <div className="mb-6">
            <button
              type="button"
              onClick={onResumeMilestone}
              className="text-left group/btn inline-flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight hover:text-black transition-colors cursor-pointer"
            >
              <span>{activeMilestoneTitle}</span>
              <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-[#64748b] group-hover/btn:text-[#0f172a] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Actions on Left, Progress Bar on Right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-1 border-t border-[#f1f5f9]">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onResumeMilestone}
                className="inline-flex items-center gap-2 rounded-xl bg-[#18181b] hover:bg-black text-white font-semibold px-5 py-2.5 text-xs transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Resume Learning</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onLaunchWorkspace}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white hover:bg-neutral-50 text-[#1e293b] px-4 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              >
                <span>Launch</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#64748b]" />
              </button>
            </div>

            {/* Progress Bar & Est. Time */}
            <div className="flex flex-col items-start md:items-end gap-1.5 min-w-[200px] sm:min-w-[240px]">
              <div className="w-full bg-[#e2e8f0] h-2 sm:h-2.5 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-[#312e81]"
                />
              </div>
              <span className="text-[11px] font-mono text-[#64748b] tracking-wide">
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
          className="text-[11px] font-mono tracking-wider text-[#64748b] font-semibold px-0.5 uppercase"
        >
          CONTINUE LEARNING &amp; CURRENT ROADMAP
        </h2>

        <div className="py-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: 4-Node Circuit Track */}
            <div className="flex-1 overflow-x-auto pb-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="min-w-[340px] flex items-center justify-between relative py-2">
                {/* Node 1: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-xs">
                    <Check className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-sans text-[#475569] font-medium">Completed</span>
                </div>

                {/* Connector Line 1-2 */}
                <div className="flex-1 h-[2px] bg-[#18181b] mx-2 -mt-5" />

                {/* Node 2: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-xs">
                    <Check className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-sans text-[#475569] font-medium">Node 2</span>
                </div>

                {/* Connector Line 2-3 */}
                <div className="flex-1 h-[2px] bg-[#18181b] mx-2 -mt-5" />

                {/* Node 3: Completed */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-full bg-[#18181b] text-white flex items-center justify-center shadow-xs">
                    <Check className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                  <span className="text-[11px] font-sans text-[#475569] font-medium">Node 3</span>
                </div>

                {/* Connector Line 3-4 */}
                <div className="flex-1 h-[2px] bg-[#18181b] mx-2 -mt-5" />

                {/* Node 4: Active Beacon with Radiant Violet Aura */}
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer radiant aura matching reference */}
                    <span className="absolute -inset-2 rounded-full bg-violet-600/35 blur-md animate-pulse" />
                    <div className="relative h-9 w-9 rounded-full bg-[#1e1b4b] text-white font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.7)] ring-2 ring-[#7c3aed]">
                      04
                    </div>
                  </div>
                  <span className="text-[11px] font-sans font-bold text-[#0f172a] tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Dotted Link to Active Milestone Card */}
            <div className="hidden lg:flex items-center justify-center px-1">
              <div className="w-8 border-t-2 border-dotted border-[#cbd5e1]" />
            </div>

            {/* Right: Connected Active Milestone Card in soft lavender #ede9fe */}
            <div
              onClick={onResumeMilestone}
              className="w-full lg:w-72 rounded-2xl border border-[#ddd6fe] bg-[#ede9fe] p-4 hover:bg-[#e0e7ff] transition-all duration-300 cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-[#1e1b4b] group-hover:text-black transition-colors">
                  {activeRoadmapTitle}
                </span>
                {/* React Atom / Engineering Icon */}
                <div className="h-6 w-6 rounded-lg text-[#7c3aed] flex items-center justify-center shrink-0">
                  <Code2 className="h-4 w-4" />
                </div>
              </div>

              <p className="text-xs font-mono text-[#4338ca] mb-2.5">75% complete</p>

              <div className="w-full bg-[#ddd6fe] h-1.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#7c3aed] w-3/4 shadow-xs" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 3: PORTFOLIO PROJECTS & ACHIEVEMENTS ──────────────── */}
      <section aria-labelledby="section-portfolio-title" className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#64748b] font-semibold px-0.5">
          <span id="section-portfolio-title" className="uppercase">
            PORTFOLIO PROJECTS &amp; ACHIEVEMENTS
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('portfolio')}
            className="inline-flex items-center gap-1 text-[#475569] hover:text-[#0f172a] transition-colors cursor-pointer"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Share Portfolio</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Featured Portfolio Project */}
          <div
            onClick={() => onNavigateTab('projects')}
            className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-[#cbd5e1] transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-[#0f172a] group-hover:text-black transition-colors">
                Personal Portfolio Website
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/80 px-2.5 py-0.5 text-[10px] font-mono text-neutral-600">
                <span>Public</span>
                <ExternalLink className="h-2.5 w-2.5 text-neutral-500" />
              </span>
            </div>

            {/* Exact Pastel Tech Tags matching reference image */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="rounded-md border border-[#fed7aa] bg-[#ffedd5] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#c2410c]">
                HTML
              </span>
              <span className="rounded-md border border-[#bfdbfe] bg-[#dbeafe] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#1d4ed8]">
                CSS
              </span>
              <span className="rounded-md border border-[#fef08a] bg-[#fef9c3] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#854d0e]">
                JS
              </span>
              <span className="rounded-md border border-[#a5f3fc] bg-[#cffafe] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#0e7490]">
                React
              </span>
            </div>
          </div>

          {/* Card B: Achievements Summary */}
          <div
            onClick={() => onNavigateTab('achievements')}
            className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-[#cbd5e1] transition-all duration-300 cursor-pointer flex items-center justify-around gap-4"
          >
            {/* Achievement 1: Fast Learner */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 shadow-xs">
                <Rocket className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0f172a] tracking-tight">Fast Learner</p>
                <p className="text-[11px] font-mono text-[#64748b]">Artwork</p>
              </div>
            </div>

            <div className="h-8 w-px bg-[#e2e8f0]" />

            {/* Achievement 2: Milestone 4 */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#0f172a] tracking-tight">Milestone 4</p>
                <p className="text-[11px] font-mono text-[#64748b]">Artwork</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default memo(DashboardReferenceOverview)
