import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Bot,
  Award,
  Sparkles,
  Play,
  ArrowRight,
  Search,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDashboard } from '../context/useDashboard'
import DashboardLeftSidebar from '../components/dashboard/DashboardLeftSidebar'
import DashboardReferenceOverview from '../components/dashboard/DashboardReferenceOverview'
import FloatingAIMentorCompanion from '../components/dashboard/FloatingAIMentorCompanion'
import MemphisCornerDecorations from '../components/dashboard/MemphisCornerDecorations'

export default function DashboardPage({
  onSelectPath = () => {},
  onOpenExplorer = () => {},
  onOpenRoadmapBuilder = () => {},
}) {
  const { user, logout } = useAuth()
  const {
    activeTab,
    setActiveTab,
    activeRoadmap,
    allRoadmaps,
    switchActiveRoadmap,
    dailyActivity,
    achievements,
    catalogRoadmaps,
    showToast,
  } = useDashboard()

  const [roadmapSearch, setRoadmapSearch] = useState('')

  // Direct lesson navigation
  const handleContinueLesson = useCallback((mission) => {
    const courseId = mission?.course_id || 1
    const lessonId = mission?.lesson_id || 1
    const targetUrl = `/courses/${courseId}?lesson=${lessonId}`
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', targetUrl)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [])

  // Filter catalog roadmaps
  const filteredCatalog = (catalogRoadmaps || []).filter((rm) => {
    return (
      !roadmapSearch ||
      rm.title?.toLowerCase().includes(roadmapSearch.toLowerCase()) ||
      rm.description?.toLowerCase().includes(roadmapSearch.toLowerCase())
    )
  })

  return (
    <div className="relative w-full h-screen min-h-screen flex flex-col lg:flex-row bg-[#050508] text-[#f8fafc] overflow-hidden select-none">
      {/* Technea Cybernetic Memphis Corner Technical Anchors */}
      <MemphisCornerDecorations />

      {/* Subtle background radial violet nebulae */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

      {/* ──────────────── 1. DESKTOP NAVIGATION SIDEBAR ──────────────── */}
      <aside aria-label="Dashboard Sidebar" className="hidden lg:block w-60 shrink-0 h-full z-20">
        <DashboardLeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          xpPoints={user?.total_xp || 250}
          streakCount={dailyActivity?.streak_count || 1}
          onLogout={logout}
        />
      </aside>

      {/* ──────────────── 2. MOBILE TOP NAVIGATION BAR ──────────────── */}
      <header aria-label="Mobile Navigation" className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-[#07090e] border-b border-white/[0.08] z-30">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white text-black font-extrabold text-xs flex items-center justify-center font-sans">
            T
          </div>
          <span className="text-sm font-bold text-white font-sans">Technea OS</span>
        </div>

        {/* Horizontal mobile tab scroller */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['overview', 'roadmaps', 'courses', 'projects', 'portfolio'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-violet-600/30 text-white font-bold border border-violet-500/40'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ──────────────── 3. MAIN OPERATING DECK (100% REMAINING WIDTH) ──────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 z-10 relative">
        <AnimatePresence mode="wait">
          {/* ══════════════ TAB 1: OVERVIEW (TODAY'S AI WORKSPACE) ══════════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardReferenceOverview
                onContinueLesson={handleContinueLesson}
                onExploreCatalog={onOpenExplorer}
                onNavigateTab={setActiveTab}
                onShare={() => showToast('Progress shared to clipboard!', 'success')}
              />
            </motion.div>
          )}

          {/* ══════════════ TAB 2: ROADMAPS (BLUEPRINTS & 100+ CATALOG) ══════════════ */}
          {activeTab === 'roadmaps' && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                      Learning Roadmaps
                    </h1>
                    <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-mono text-violet-300">
                      {allRoadmaps?.length || 1} Active Focus
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage your active engineering track or generate new tailored curriculum with the AI Roadmap Builder.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenRoadmapBuilder()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-100 text-black font-semibold px-4 py-2 text-xs font-sans transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                    <span>Build New Roadmap</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenExplorer}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.04] px-3.5 py-2 text-xs font-mono text-neutral-200 transition-all cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Explore 100+</span>
                  </button>
                </div>
              </div>

              {/* Your Roadmaps List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-neutral-400">
                  <span>Your Roadmaps</span>
                  <span>Click to switch main active focus</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(allRoadmaps || []).map((rm) => {
                    const isFocus = rm.id === activeRoadmap?.id
                    return (
                      <div
                        key={rm.id}
                        className={`relative rounded-3xl border p-6 backdrop-blur-xl transition-all duration-200 flex flex-col justify-between ${
                          isFocus
                            ? 'border-violet-500/60 bg-gradient-to-br from-violet-950/20 via-white/[0.02] to-transparent shadow-[0_0_30px_rgba(124,58,237,0.2)]'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 uppercase tracking-wider">
                              {rm.target_role || 'Engineering'}
                            </span>
                            {isFocus ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Main Active Focus
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-neutral-500">
                                {rm.estimated_duration || 'Self-paced'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-white tracking-tight">
                            {rm.title}
                          </h3>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                            {rm.goal || rm.description || 'Targeted engineering curriculum.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="text-xs font-mono text-neutral-400">
                            <span>{rm.progress_percent || 0}% complete</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isFocus && (
                              <button
                                type="button"
                                onClick={() => switchActiveRoadmap(rm)}
                                className="px-3 py-1.5 rounded-xl border border-white/10 hover:border-violet-500/50 hover:bg-violet-600/10 text-xs font-mono text-neutral-200 hover:text-white transition-all cursor-pointer"
                              >
                                Set as Active
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleContinueLesson({ course_id: rm.id, lesson_id: 1 })}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold font-sans transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Continue</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Curated 100+ Catalog Showcase Preview */}
              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">Explore Technea Catalog</h2>
                    <p className="text-xs text-neutral-400 font-mono">100+ vetted community and career paths</p>
                  </div>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={roadmapSearch}
                      onChange={(e) => setRoadmapSearch(e.target.value)}
                      placeholder="Search paths (Python, React, AI...)"
                      className="rounded-xl bg-white/[0.04] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-violet-500/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCatalog.slice(0, 6).map((catRm) => (
                    <div
                      key={catRm.id}
                      className="p-5 rounded-2xl border border-white/5 bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.03] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-violet-400 uppercase">
                          {catRm.category || 'Specialization'}
                        </span>
                        <h4 className="text-sm font-bold text-white">{catRm.title}</h4>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {catRm.description || 'Comprehensive step-by-step curriculum.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-500">
                          {catRm.duration || '6 Weeks'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            switchActiveRoadmap(catRm)
                            if (onSelectPath) onSelectPath(catRm)
                          }}
                          className="text-xs font-mono text-violet-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Enroll Path</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 3: COURSES (CURRICULUM & VIDEO UNITS) ══════════════ */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Video & Interactive Courses</h1>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Step-by-step curriculum units mapped to your active roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 1, title: 'Modern React Architecture', lessons: 18, duration: '4h 20m', level: 'Intermediate' },
                  { id: 2, title: 'Advanced CSS Flexbox & Grid Systems', lessons: 12, duration: '2h 45m', level: 'Beginner' },
                  { id: 3, title: 'Python for AI & LLM Systems', lessons: 24, duration: '6h 10m', level: 'Advanced' },
                  { id: 4, title: 'Full Stack REST & GraphQL APIs', lessons: 16, duration: '3h 50m', level: 'Intermediate' },
                  { id: 5, title: 'TypeScript Production Patterns', lessons: 14, duration: '3h 15m', level: 'Intermediate' },
                  { id: 6, title: 'Docker, CI/CD & Cloud Deployment', lessons: 10, duration: '2h 30m', level: 'Beginner' },
                ].map((course) => (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-2">
                        <span>{course.level}</span>
                        <span>{course.duration}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5">{course.title}</h3>
                      <p className="text-xs text-neutral-400 font-mono">{course.lessons} video lessons</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleContinueLesson({ course_id: course.id, lesson_id: 1 })}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.06] hover:bg-white text-neutral-200 hover:text-black font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Course</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 4: PROJECTS (CONNECTED PORTFOLIO LABS) ══════════════ */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Milestone Capstone Projects</h1>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Real production deliverables that unlock as you complete roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: 'Interactive AI Chat UI with Flexbox',
                    status: 'in_progress',
                    difficulty: 'Beginner',
                    tech: ['React', 'CSS Flexbox', 'Vite'],
                    desc: 'Build an ultra-responsive cybernetic chat interface with collapsible sidebars and ambient glowing indicators.',
                  },
                  {
                    id: 2,
                    title: 'Full-Stack Developer Portfolio Clone',
                    status: 'unlocked',
                    difficulty: 'Intermediate',
                    tech: ['React', 'TypeScript', 'Tailwind'],
                    desc: 'A high-performance portfolio featuring animated case studies, proof-of-work badges, and GitHub synchronization.',
                  },
                  {
                    id: 3,
                    title: 'Autonomous AI Workflow Orchestrator',
                    status: 'locked',
                    difficulty: 'Advanced',
                    tech: ['Python', 'FastAPI', 'LangChain'],
                    desc: 'Design a multi-agent system executing coordinated code audits and automated test execution.',
                  },
                  {
                    id: 4,
                    title: 'Distributed Analytics Dashboard',
                    status: 'locked',
                    difficulty: 'Advanced',
                    tech: ['Next.js', 'PostgreSQL', 'Redis'],
                    desc: 'Real-time telemetry ingestion and streaming metrics dashboard with sub-second queries.',
                  },
                ].map((proj) => (
                  <div
                    key={proj.id}
                    className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                            proj.status === 'in_progress'
                              ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                              : proj.status === 'unlocked'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/5 text-neutral-500 border-white/10'
                          }`}
                        >
                          {proj.status === 'in_progress'
                            ? '● In Progress'
                            : proj.status === 'unlocked'
                            ? '✓ Unlocked'
                            : '○ Locked (Complete Milestone 4)'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">{proj.difficulty}</span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-2">{proj.title}</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-4">{proj.desc}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={proj.status === 'locked'}
                      onClick={() => showToast(`Project '${proj.title}' started!`, 'success')}
                      className={`w-full py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                        proj.status === 'locked'
                          ? 'bg-white/5 text-neutral-600 cursor-not-allowed'
                          : 'bg-white hover:bg-neutral-200 text-black font-semibold'
                      }`}
                    >
                      {proj.status === 'locked' ? 'Locked Milestone' : 'Start Deliverable →'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 5: AI MENTOR 2.0 (DEEP FOCUS STUDIO) ══════════════ */}
          {activeTab === 'mentor' && (
            <motion.div
              key="mentor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <Bot className="h-6 w-6 text-violet-400" />
                  <span>AI Mentor 2.0 Studio</span>
                </h1>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Synchronized with active roadmap: <strong className="text-white">{activeRoadmap?.title}</strong>
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center space-y-4">
                <Sparkles className="h-10 w-10 text-violet-400 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-white">Full-Screen Learning Studio Available</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Your AI Mentor operates dynamically as a non-intrusive floating assistant or immersive deep-focus studio.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const button = document.querySelector('[title="Open AI Technical Mentor 2.0"]')
                      if (button) button.click()
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-semibold shadow-lg hover:shadow-violet-600/30 transition-all cursor-pointer"
                  >
                    <span>Launch AI Studio Drawer</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 6: PORTFOLIO & ACHIEVEMENTS ══════════════ */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/[0.08] pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Developer Portfolio &amp; Proof of Work</h1>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Verified platform achievements, milestone credentials, and earned developer badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(achievements && achievements.length > 0 ? achievements : [
                  { id: '1', title: 'Early Adopter', description: 'Joined Technea early platform release.', unlocked: true },
                  { id: '2', title: 'Consistent Coder', description: 'Maintained 3+ days of active learning.', unlocked: true },
                  { id: '3', title: 'Milestone Conqueror', description: 'Mastered 5 core curriculum milestones.', unlocked: false },
                  { id: '4', title: 'Roadmap Architect', description: 'Synthesized an AI career roadmap.', unlocked: true },
                  { id: '5', title: 'Hands-on Builder', description: 'Started an active software project.', unlocked: false },
                ]).map((ach) => (
                  <div
                    key={ach.id || ach.achievement_id}
                    className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                      ach.unlocked
                        ? 'border-violet-500/30 bg-violet-950/10'
                        : 'border-white/5 bg-white/[0.01] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Award className={`h-5 w-5 ${ach.unlocked ? 'text-violet-400' : 'text-neutral-500'}`} />
                      <span className="text-[10px] font-mono text-neutral-400">
                        {ach.unlocked ? '✓ Unlocked' : '○ In Progress'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{ach.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">{ach.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ──────────────── 4. FLOATING AI MENTOR 2.0 COMPANION ──────────────── */}
      <FloatingAIMentorCompanion />
    </div>
  )
}
