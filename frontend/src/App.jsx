import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AuthProvider from './context/AuthContext'

gsap.registerPlugin(ScrollTrigger)
import { useAuth } from './context/useAuth'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import Footer from './components/layout/Footer'
import PWAInstallBanner from './components/pwa/PWAInstallBanner'

// Lazy-loaded route pages and heavy modals for maximum performance & bundle code splitting
const AuthModal = lazy(() => import('./components/auth/AuthModal'))
const LearningDashboardModal = lazy(() => import('./components/dashboard/LearningDashboardModal'))
const SkillExplorerModal = lazy(() => import('./components/explorer/SkillExplorerModal'))
const RoadmapBuilderModal = lazy(() => import('./components/roadmap/RoadmapBuilderModal'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'))
const CoursePlayerPage = lazy(() => import('./pages/CoursePlayerPage'))
const LearningPathDetailPage = lazy(() => import('./pages/LearningPathDetailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const AuthCallbackPage = lazy(() => import('./pages/auth/AuthCallbackPage'))
import ErrorBoundary from './components/common/ErrorBoundary'

function SleekRouteLoadingFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
          <div className="h-12 w-12 rounded-full border-2 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-neutral-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Loading experience
        </div>
      </div>
    </div>
  )
}

function SleekModalLoadingFallback() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Loading dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0c10]/95 px-8 py-6 shadow-2xl backdrop-blur-xl">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
          <div className="h-10 w-10 rounded-full border-2 border-t-blue-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
        </div>
        <span className="text-xs font-medium text-neutral-400 tracking-wider">Loading...</span>
      </div>
    </div>
  )
}

function ScrollProgressBar() {
  const barRef = useRef(null)

  useLenis(({ progress }) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`
    }
  })

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-[#FF0055] z-[60] origin-left pointer-events-none"
      style={{
        transform: 'scaleX(0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}

function AppContent() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    isDashboardOpen,
    openDashboard,
    closeDashboard,
    isRoadmapBuilderOpen,
    openRoadmapBuilder,
    closeRoadmapBuilder,
    roadmapBuilderInitialGoal,
  } = useAuth()
  const [selectedDashboardPath, setSelectedDashboardPath] = useState(null)
  const [isDirectExplorerOpen, setIsDirectExplorerOpen] = useState(
    () => typeof window !== 'undefined' && window.location.pathname === '/explore'
  )
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      setCurrentPath(path)
      setCurrentSearch(window.location.search)
      if (path === '/explore') {
        setIsDirectExplorerOpen(true)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-open context modals if direct route is navigated to
  useEffect(() => {
    if (currentPath === '/dashboard') {
      openDashboard()
    } else if (currentPath === '/roadmap') {
      openRoadmapBuilder()
    }
  }, [currentPath, openDashboard, openRoadmapBuilder])

  const isAnyModalOpen = Boolean(
    isAuthModalOpen ||
    isDashboardOpen ||
    isDirectExplorerOpen ||
    isRoadmapBuilderOpen
  )

  const lenis = useLenis()

  // Synchronize Lenis scroll updates directly with GSAP's ScrollTrigger
  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', ScrollTrigger.update)
    return () => {
      lenis.off('scroll', ScrollTrigger.update)
    }
  }, [lenis])

  // Pause smooth scroll when any modal is open to prevent background scroll bleed
  useEffect(() => {
    if (!lenis) return
    if (isAnyModalOpen) {
      lenis.stop()
    } else {
      lenis.start()
      ScrollTrigger.refresh()
    }
  }, [isAnyModalOpen, lenis])

  // Reset scroll to top immediately on route changes and ensure Lenis is started
  useEffect(() => {
    if (lenis) {
      lenis.start()
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    ScrollTrigger.refresh()
  }, [currentPath, lenis])

  const handleSelectPathFromDashboard = (path) => {
    setSelectedDashboardPath(path)
    setIsDirectExplorerOpen(true)
  }

  const handleOpenExplorerFromDashboard = () => {
    setSelectedDashboardPath(null)
    setIsDirectExplorerOpen(true)
  }

  const isVerifyEmailRoute = currentPath === '/verify-email'
  const isResetPasswordRoute = currentPath === '/reset-password'
  const isAuthCallbackRoute = currentPath === '/auth/callback'

  const isProfileRoute = currentPath.startsWith('/profile')
  const isCourseRoute = currentPath.startsWith('/course/') || currentPath.startsWith('/courses/')
  const isPathRoute =
    currentPath.startsWith('/path/') ||
    currentPath.startsWith('/paths/') ||
    currentPath.startsWith('/learning-path/') ||
    currentPath.startsWith('/learning-paths/')

  const searchParams = new URLSearchParams(currentSearch)
  const isEditRequested = searchParams.get('edit') === 'true'

  let profileUsername = null
  if (currentPath.startsWith('/profile/')) {
    profileUsername = currentPath.slice('/profile/'.length).split('/')[0].split('?')[0]
  } else if (currentPath === '/profile') {
    profileUsername = user?.username || ''
  }

  let courseRouteId = null
  if (isCourseRoute) {
    const parts = currentPath.split('/').filter(Boolean)
    courseRouteId = parts[1] || null
  }

  let pathRouteId = null
  if (isPathRoute) {
    const parts = currentPath.split('/').filter(Boolean)
    pathRouteId = parts[1] || null
  }

  const isHomeRoute = currentPath === '/' || currentPath === '' || currentPath === '/home'
  const isDirectModalRoute =
    currentPath === '/dashboard' ||
    currentPath === '/explore' ||
    currentPath === '/roadmap'

  const isKnownRoute =
    isHomeRoute ||
    isDirectModalRoute ||
    isProfileRoute ||
    isCourseRoute ||
    isPathRoute ||
    isVerifyEmailRoute ||
    isResetPasswordRoute ||
    isAuthCallbackRoute
  const isSpecialRoute =
    isProfileRoute ||
    isCourseRoute ||
    isPathRoute ||
    isVerifyEmailRoute ||
    isResetPasswordRoute ||
    isAuthCallbackRoute ||
    !isKnownRoute

  return (
    <div className={`flex min-h-screen flex-col antialiased w-full max-w-full overflow-x-clip ${
      isSpecialRoute
        ? 'bg-[#050505] text-[#EDEDED] selection:bg-[#333333] selection:text-white'
        : 'bg-[#f8fafc] text-neutral-900 selection:bg-neutral-900 selection:text-white'
    }`}>
      <ScrollProgressBar />
      {isVerifyEmailRoute ? (
        <ErrorBoundary title="Verification encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <VerifyEmailPage />
          </Suspense>
        </ErrorBoundary>
      ) : isResetPasswordRoute ? (
        <ErrorBoundary title="Password reset encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        </ErrorBoundary>
      ) : isAuthCallbackRoute ? (
        <ErrorBoundary title="Authentication callback encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <AuthCallbackPage />
          </Suspense>
        </ErrorBoundary>
      ) : isProfileRoute ? (
        <ErrorBoundary title="Profile page encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            {currentPath.startsWith('/profile/') && profileUsername ? (
              <PublicProfilePage
                username={profileUsername}
                initialEditOpen={isEditRequested}
                onBackToHome={() => {
                  window.history.pushState({}, '', '/')
                  setCurrentPath('/')
                  setCurrentSearch('')
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
              />
            ) : (
              <ProfilePage
                username={profileUsername || user?.username}
                initialEditOpen={isEditRequested}
                onBackToHome={() => {
                  window.history.pushState({}, '', '/')
                  setCurrentPath('/')
                  setCurrentSearch('')
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      ) : isCourseRoute ? (
        <ErrorBoundary title="Course player encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <CoursePlayerPage
              course={courseRouteId ? { id: courseRouteId } : null}
              onBack={() => {
                window.history.pushState({}, '', '/')
                setCurrentPath('/')
                setCurrentSearch('')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            />
          </Suspense>
        </ErrorBoundary>
      ) : isPathRoute ? (
        <ErrorBoundary title="Learning path encountered an error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <LearningPathDetailPage
              path={pathRouteId ? { id: pathRouteId } : null}
              onBack={() => {
                window.history.pushState({}, '', '/')
                setCurrentPath('/')
                setCurrentSearch('')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
              onStartLearning={(course) => {
                if (course?.id) {
                  window.history.pushState({}, '', `/courses/${course.id}`)
                  setCurrentPath(`/courses/${course.id}`)
                  window.dispatchEvent(new PopStateEvent('popstate'))
                }
              }}
            />
          </Suspense>
        </ErrorBoundary>
      ) : isHomeRoute || isDirectModalRoute ? (
        <ErrorBoundary title="Homepage encountered an error">
          <Navbar />
          <LandingPage />
          <Footer />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary title="Route navigation error">
          <Suspense fallback={<SleekRouteLoadingFallback />}>
            <NotFoundPage
              onBackToHome={() => {
                window.history.pushState({}, '', '/')
                setCurrentPath('/')
                setCurrentSearch('')
                window.dispatchEvent(new PopStateEvent('popstate'))
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}


      {/* Global Authentication Modal */}
      {isAuthModalOpen && (
        <ErrorBoundary compact title="Authentication temporarily unavailable">
          <Suspense fallback={<SleekModalLoadingFallback />}>
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={closeAuthModal}
              initialMode={authModalMode}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Global Learning Dashboard Modal */}
      {isDashboardOpen && (
        <ErrorBoundary compact title="Dashboard temporarily unavailable">
          <Suspense fallback={<SleekModalLoadingFallback />}>
            <LearningDashboardModal
              isOpen={isDashboardOpen}
              onClose={closeDashboard}
              onSelectPath={handleSelectPathFromDashboard}
              onOpenExplorer={handleOpenExplorerFromDashboard}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Direct Explorer / Path Modal launched from Dashboard */}
      {isDirectExplorerOpen && (
        <ErrorBoundary compact title="Explorer temporarily unavailable">
          <Suspense fallback={<SleekModalLoadingFallback />}>
            <SkillExplorerModal
              isOpen={isDirectExplorerOpen}
              initialPath={selectedDashboardPath}
              onClose={() => {
                setIsDirectExplorerOpen(false)
                setSelectedDashboardPath(null)
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Global AI Roadmap Builder Modal */}
      {isRoadmapBuilderOpen && (
        <ErrorBoundary compact title="Roadmap Builder temporarily unavailable">
          <Suspense fallback={<SleekModalLoadingFallback />}>
            <RoadmapBuilderModal
              isOpen={isRoadmapBuilderOpen}
              onClose={closeRoadmapBuilder}
              initialGoal={roadmapBuilderInitialGoal}
              onSelectPath={handleSelectPathFromDashboard}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* PWA Home Screen Installation Prompt */}
      <PWAInstallBanner />
    </div>
  )
}

export default function App() {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        syncTouch: false,
        anchors: { offset: -70 },
        respectReducedMotion: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ReactLenis>
  )
}
