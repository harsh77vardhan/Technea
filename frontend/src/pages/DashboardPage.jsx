import { useState, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass,
  Award,
  Sparkles,
  Play,
  ArrowRight,
  Search,
  User,
  Shield,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useDashboard } from '../context/useDashboard'
import DashboardLeftSidebar from '../components/dashboard/DashboardLeftSidebar'
import DashboardReferenceOverview from '../components/dashboard/DashboardReferenceOverview'
import DockedAIMentorCompanion from '../components/dashboard/DockedAIMentorCompanion'
import MemphisCornerDecorations from '../components/dashboard/MemphisCornerDecorations'

const FloatingAIMentorCompanion = lazy(() =>
  import('../components/dashboard/FloatingAIMentorCompanion')
)

function FloatingAIMentorFallback() {
  return null
}

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
    achievements,
    catalogRoadmaps,
    showToast,
  } = useDashboard()

  const [roadmapSearch, setRoadmapSearch] = useState('')
  const [isMentorDocked, setIsMentorDocked] = useState(true)
  const [isMentorFullscreen, setIsMentorFullscreen] = useState(false)

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
    <div className="relative w-full h-screen min-h-screen flex flex-col lg:flex-row bg-[#0e0d0c] text-[#faf6ee] overflow-hidden select-none">
      {/* Technea Cybernetic Memphis Corner Technical Anchors in Warm Burnt Orange Palette */}
      <MemphisCornerDecorations />

      {/* Subtle background warm burnt orange nebulae */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#c25e2e]/8 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#d97b48]/6 blur-[140px]" />

      {/* ──────────────── 1. DESKTOP NAVIGATION SIDEBAR ──────────────── */}
      <aside aria-label="Dashboard Sidebar" className="hidden lg:block w-56 shrink-0 h-full z-20">
        <DashboardLeftSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          user={user}
          onLogout={logout}
        />
      </aside>

      {/* ──────────────── 2. MOBILE TOP NAVIGATION BAR ──────────────── */}
      <header
        aria-label="Mobile Navigation"
        className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-[#141312] border-b border-[#262320] z-30"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full border border-[#c25e2e]/50 bg-[#c25e2e]/10 flex items-center justify-center text-xs font-semibold text-[#faf6ee]">
            T
          </div>
          <span className="text-sm font-medium text-[#faf6ee]">Technea</span>
        </div>

        {/* Horizontal mobile tab scroller */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['overview', 'roadmaps', 'courses', 'projects', 'portfolio', 'settings'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#c25e2e]/15 text-[#e87a48] font-medium border border-[#c25e2e]/30'
                  : 'text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ──────────────── 3. MAIN OPERATING DECK (CENTER COLUMN) ──────────────── */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-6 z-10 relative">
        <AnimatePresence mode="wait">
          {/* ══════════════ TAB 1: OVERVIEW (SOURCE OF TRUTH DECK) ══════════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <DashboardReferenceOverview
                onContinueLesson={handleContinueLesson}
                onExploreCatalog={onOpenExplorer}
                onNavigateTab={setActiveTab}
              />
            </motion.div>
          )}

          {/* ══════════════ TAB 2: ROADMAPS ══════════════ */}
          {activeTab === 'roadmaps' && (
            <motion.div
              key="roadmaps"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262320] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-normal text-[#faf6ee] tracking-tight">
                      Learning Roadmaps
                    </h1>
                    <span className="rounded-full border border-[#c25e2e]/30 bg-[#c25e2e]/10 px-2.5 py-0.5 text-xs text-[#e87a48]">
                      {allRoadmaps?.length || 1} Active Focus
                    </span>
                  </div>
                  <p className="text-xs text-[#a8a199] mt-1 font-normal">
                    Manage your active engineering track or generate new tailored curriculum with the AI Roadmap Builder.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onOpenRoadmapBuilder()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c25e2e] text-[#faf6ee] font-medium px-5 py-2 text-xs transition-all cursor-pointer shadow-md hover:bg-[#ad4f22]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Build New Roadmap</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenExplorer}
                    className="inline-flex items-center gap-2 rounded-full border border-[#262320] hover:border-[#c25e2e]/40 bg-[#141312] px-4 py-2 text-xs text-[#faf6ee] transition-all cursor-pointer"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#e87a48]" />
                    <span>Explore 100+ Catalog</span>
                  </button>
                </div>
              </div>

              {/* Your Roadmaps List (Warm Ivory Cards) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#a8a199]">
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
                            ? 'border-[#c25e2e]/50 bg-[#faf6ee] text-[#181614] shadow-xl'
                            : 'border-[#e5decb] bg-[#faf6ee] text-[#181614] hover:shadow-lg'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ede5d5] border border-[#ded3bf] text-[#665e56]">
                              {rm.target_role || 'Engineering'}
                            </span>
                            {isFocus ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-[#c25e2e] bg-[#c25e2e]/15 px-2.5 py-0.5 rounded-full font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#c25e2e]" />
                                Main Active Focus
                              </span>
                            ) : (
                              <span className="text-xs text-[#8c8278]">
                                {rm.estimated_duration || 'Self-paced'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-medium text-[#181614] tracking-tight">
                            {rm.title}
                          </h3>
                          <p className="text-xs text-[#665e56] line-clamp-2 leading-relaxed font-normal">
                            {rm.goal || rm.description || 'Targeted engineering curriculum.'}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#e5decb] flex items-center justify-between">
                          <div className="text-xs text-[#665e56]">
                            <span>{rm.progress_percent || 0}% complete</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isFocus && (
                              <button
                                type="button"
                                onClick={() => switchActiveRoadmap(rm)}
                                className="px-3 py-1.5 rounded-full border border-[#ded3bf] hover:border-[#c25e2e] text-xs text-[#181614] transition-all cursor-pointer"
                              >
                                Set as Active
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                switchActiveRoadmap(rm)
                                setActiveTab('overview')
                              }}
                              className="px-3 py-1.5 rounded-full bg-[#c25e2e] text-[#faf6ee] font-medium text-xs hover:bg-[#ad4f22] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <span>Open Workspace</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Catalog Search & Preview */}
              <div className="pt-6 border-t border-[#262320] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-[#faf6ee]">Explore 100+ Engineering Paths</h2>
                    <p className="text-xs text-[#a8a199] mt-0.5 font-normal">
                      Select any specialized roadmap to instantly switch your active curriculum.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#a8a199]" />
                    <input
                      type="text"
                      placeholder="Search AI, Backend, Cloud..."
                      value={roadmapSearch}
                      onChange={(e) => setRoadmapSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#141312] border border-[#262320] text-xs text-[#faf6ee] placeholder-[#8c8378] outline-none focus:border-[#c25e2e]/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCatalog.slice(0, 6).map((catRm) => (
                    <div
                      key={catRm.id}
                      className="p-4 rounded-2xl border border-[#e5decb] bg-[#faf6ee] text-[#181614] hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#8c8278] mb-1.5">
                          <span>{catRm.category || 'Specialization'}</span>
                          <span>{catRm.difficulty || 'Intermediate'}</span>
                        </div>
                        <h3 className="text-sm font-medium text-[#181614] mb-1">{catRm.title}</h3>
                        <p className="text-xs text-[#665e56] line-clamp-2 leading-relaxed">
                          {catRm.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#e5decb] flex items-center justify-between">
                        <span className="text-xs text-[#8c8278]">
                          {catRm.duration || '6 Weeks'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            switchActiveRoadmap(catRm)
                            if (onSelectPath) onSelectPath(catRm)
                          }}
                          className="text-xs text-[#c25e2e] hover:text-[#ad4f22] font-medium transition-colors cursor-pointer flex items-center gap-1"
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

          {/* ══════════════ TAB 3: COURSES (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="border-b border-[#262320] pb-4">
                <h1 className="text-2xl font-normal text-[#faf6ee]">Video &amp; Interactive Courses</h1>
                <p className="text-xs text-[#a8a199] mt-1 font-normal">
                  Step-by-step curriculum units mapped to your active roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 1, title: 'Node.js & Express Architecture', lessons: 18, duration: '4h 20m', level: 'Intermediate' },
                  { id: 2, title: 'React Foundations & State Systems', lessons: 12, duration: '2h 45m', level: 'Beginner' },
                  { id: 3, title: 'Applied Machine Learning & Neural Nets', lessons: 24, duration: '6h 10m', level: 'Advanced' },
                  { id: 4, title: 'Full-Stack REST & GraphQL APIs', lessons: 16, duration: '3h 50m', level: 'Intermediate' },
                  { id: 5, title: 'TypeScript Production Engineering', lessons: 14, duration: '3h 15m', level: 'Intermediate' },
                  { id: 6, title: 'Docker, CI/CD & Cloud Deployment', lessons: 10, duration: '2h 30m', level: 'Beginner' },
                ].map((course) => (
                  <div
                    key={course.id}
                    className="p-5 rounded-2xl border border-[#e5decb] bg-[#faf6ee] text-[#181614] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#8c8278] mb-2">
                        <span>{course.level}</span>
                        <span>{course.duration}</span>
                      </div>
                      <h3 className="text-sm font-medium text-[#181614] mb-1.5">{course.title}</h3>
                      <p className="text-xs text-[#665e56] font-normal">{course.lessons} video lessons</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleContinueLesson({ course_id: course.id, lesson_id: 1 })}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 rounded-full bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] font-medium text-xs transition-all cursor-pointer shadow-sm"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Start Course</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 4: PROJECTS (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="border-b border-[#262320] pb-4">
                <h1 className="text-2xl font-normal text-[#faf6ee]">Milestone Capstone Projects</h1>
                <p className="text-xs text-[#a8a199] mt-1 font-normal">
                  Production deliverables that unlock as you complete roadmap milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    title: 'Task API with JWT Authentication',
                    status: 'in_progress',
                    difficulty: 'Intermediate',
                    tech: ['Node.js', 'Express', 'PostgreSQL'],
                    desc: 'Build a production-ready REST API with secure authentication, token refresh, and Postgres migrations.',
                  },
                  {
                    id: 2,
                    title: 'Real-Time Chat Client with WebSockets',
                    status: 'unlocked',
                    difficulty: 'Intermediate',
                    tech: ['React', 'WebSockets', 'Tailwind'],
                    desc: 'A high-performance chat interface featuring WebSocket duplex channels, optimistic message rendering, and presence.',
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
                    title: 'Distributed Telemetry & Analytics Dashboard',
                    status: 'locked',
                    difficulty: 'Advanced',
                    tech: ['Next.js', 'PostgreSQL', 'Redis'],
                    desc: 'Real-time telemetry ingestion and streaming metrics dashboard with sub-second queries.',
                  },
                ].map((proj) => (
                  <div
                    key={proj.id}
                    className="p-6 rounded-3xl border border-[#e5decb] bg-[#faf6ee] text-[#181614] backdrop-blur-xl flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border ${
                            proj.status === 'in_progress'
                              ? 'bg-[#c25e2e]/15 text-[#c25e2e] border-[#c25e2e]/30 font-medium'
                              : proj.status === 'unlocked'
                              ? 'bg-[#ede5d5] text-[#544d45] border-[#ded3bf]'
                              : 'bg-[#ede5d5]/60 text-[#8c8278] border-[#ded3bf]/60'
                          }`}
                        >
                          {proj.status === 'in_progress'
                            ? '● In Progress'
                            : proj.status === 'unlocked'
                            ? '✓ Unlocked'
                            : '○ Locked (Complete Milestone 4)'}
                        </span>
                        <span className="text-xs text-[#8c8278]">{proj.difficulty}</span>
                      </div>

                      <h3 className="text-base font-medium text-[#181614] mb-2">{proj.title}</h3>
                      <p className="text-xs text-[#665e56] leading-relaxed mb-4 font-normal">{proj.desc}</p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-[#ede5d5] border border-[#ded3bf] text-xs text-[#544d45]"
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
                      className={`w-full py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        proj.status === 'locked'
                          ? 'bg-[#ede5d5]/40 text-[#a8a199] cursor-not-allowed'
                          : 'bg-[#c25e2e] hover:bg-[#ad4f22] text-[#faf6ee] shadow-sm'
                      }`}
                    >
                      {proj.status === 'locked' ? 'Locked Milestone' : 'Start Deliverable →'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 5: PORTFOLIO & ACHIEVEMENTS (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <div className="border-b border-[#262320] pb-4">
                <h1 className="text-2xl font-normal text-[#faf6ee]">Developer Portfolio &amp; Proof of Work</h1>
                <p className="text-xs text-[#a8a199] mt-1 font-normal">
                  Verified platform achievements, milestone credentials, and earned developer badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(achievements && achievements.length > 0 ? achievements : [
                  { id: '1', title: '7-day streak', description: 'Maintained 7+ consecutive days of daily learning.', unlocked: true },
                  { id: '2', title: 'First API shipped', description: 'Built and verified REST endpoint authentication.', unlocked: true },
                  { id: '3', title: 'Quiz score 90% +', description: 'Scored 90%+ in React Foundations technical evaluation.', unlocked: true },
                  { id: '4', title: 'Roadmap Architect', description: 'Synthesized an AI career roadmap.', unlocked: true },
                  { id: '5', title: 'Hands-on Builder', description: 'Started an active software capstone project.', unlocked: false },
                ]).map((ach) => (
                  <div
                    key={ach.id || ach.achievement_id}
                    className={`p-5 rounded-2xl border backdrop-blur-xl transition-all ${
                      ach.unlocked
                        ? 'border-[#e5decb] bg-[#faf6ee] text-[#181614] shadow-sm'
                        : 'border-[#262320] bg-[#141312] text-[#a8a199] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Award className={`h-5 w-5 ${ach.unlocked ? 'text-[#c25e2e]' : 'text-[#8c8278]'}`} />
                      <span className="text-xs text-[#8c8278]">
                        {ach.unlocked ? '✓ Unlocked' : '○ In Progress'}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[#181614] mb-1">{ach.title}</h3>
                    <p className="text-xs text-[#665e56] leading-relaxed font-normal">{ach.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB 6: SETTINGS (WARM IVORY CARDS) ══════════════ */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 max-w-3xl"
            >
              <div className="border-b border-[#262320] pb-4">
                <h1 className="text-2xl font-normal text-[#faf6ee]">Account &amp; Workspace Settings</h1>
                <p className="text-xs text-[#a8a199] mt-1 font-normal">
                  Manage your platform credentials, learning preferences, and active session.
                </p>
              </div>

              <div className="space-y-4">
                {/* Profile Information */}
                <div className="p-6 rounded-3xl border border-[#e5decb] bg-[#faf6ee] text-[#181614] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#181614]">
                    <User className="h-4 w-4 text-[#c25e2e]" />
                    <span>User Identity</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#665e56] block mb-1">Full Name</span>
                      <div className="p-3 rounded-xl bg-[#ede5d5] border border-[#ded3bf] text-[#181614] font-normal">
                        {user?.full_name || 'Harsh'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#665e56] block mb-1">Email Address</span>
                      <div className="p-3 rounded-xl bg-[#ede5d5] border border-[#ded3bf] text-[#181614] font-normal">
                        {user?.email || 'user@technea.dev'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="p-6 rounded-3xl border border-[#e5decb] bg-[#faf6ee] text-[#181614] space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#181614]">
                    <Shield className="h-4 w-4 text-[#c25e2e]" />
                    <span>Learning Configuration</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#ede5d5] border border-[#ded3bf]">
                      <div>
                        <div className="text-[#181614] font-medium">Active Engineering Focus</div>
                        <div className="text-[#665e56] text-[11px]">
                          {activeRoadmap?.title || 'Full-Stack AI Engineer'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('roadmaps')}
                        className="text-xs text-[#c25e2e] hover:text-[#ad4f22] font-medium cursor-pointer"
                      >
                        Change Focus →
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#ede5d5] border border-[#ded3bf]">
                      <div>
                        <div className="text-[#181614] font-medium">AI Mentor Telemetry</div>
                        <div className="text-[#665e56] text-[11px]">
                          Real-time lesson context synchronization enabled
                        </div>
                      </div>
                      <span className="text-xs text-[#c25e2e] font-medium">Active</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c25e2e]/40 text-[#c25e2e] hover:bg-[#c25e2e]/10 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out of Technea</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ──────────────── 4. DOCKED AI MENTOR 2.0 PANEL (RIGHT COLUMN) ──────────────── */}
      {isMentorDocked && activeTab === 'overview' && (
        <aside
          aria-label="AI Technical Mentor Column"
          className="hidden xl:block w-80 shrink-0 h-full border-l border-[#262320] z-20"
        >
          <DockedAIMentorCompanion
            onMinimize={() => setIsMentorDocked(false)}
            onExpand={() => setIsMentorFullscreen(true)}
          />
        </aside>
      )}

      {/* ──────────────── 5. FLOATING AI MENTOR PILL & FULLSCREEN STUDIO ──────────────── */}
      <Suspense fallback={<FloatingAIMentorFallback />}>
        <FloatingAIMentorCompanion
          isDocked={isMentorDocked && activeTab === 'overview'}
          onRestoreDock={() => setIsMentorDocked(true)}
          isFullscreen={isMentorFullscreen}
          onCloseFullscreen={() => setIsMentorFullscreen(false)}
        />
      </Suspense>
    </div>
  )
}
