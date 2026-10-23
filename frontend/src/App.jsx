import { useState, useEffect, useRef } from 'react'
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
import AuthModal from './components/auth/AuthModal'
import LearningDashboardModal from './components/dashboard/LearningDashboardModal'
import SkillExplorerModal from './components/explorer/SkillExplorerModal'
import RoadmapBuilderModal from './components/roadmap/RoadmapBuilderModal'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'

function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useLenis(({ progress }) => {
    setProgress(progress)
  })

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-[#FF0055] z-[60] origin-left pointer-events-none transition-transform duration-75"
      style={{
        transform: `scaleX(${progress})`,
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
    closeDashboard,
    isRoadmapBuilderOpen,
    closeRoadmapBuilder,
    roadmapBuilderInitialGoal,
  } = useAuth()
  const [selectedDashboardPath, setSelectedDashboardPath] = useState(null)
  const [isDirectExplorerOpen, setIsDirectExplorerOpen] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
      setCurrentSearch(window.location.search)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

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

  // Reset scroll to top immediately on route changes
  useEffect(() => {
    if (lenis) {
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

  const isProfileRoute = currentPath.startsWith('/profile')
  const searchParams = new URLSearchParams(currentSearch)
  const isEditRequested = searchParams.get('edit') === 'true'

  let profileUsername = null
  if (currentPath.startsWith('/profile/')) {
    profileUsername = currentPath.slice('/profile/'.length).split('/')[0].split('?')[0]
  } else if (currentPath === '/profile') {
    profileUsername = user?.username || ''
  }

  return (
    <div className={`flex min-h-screen flex-col antialiased ${
      isProfileRoute
        ? 'bg-[#050505] text-[#EDEDED] selection:bg-[#333333] selection:text-white'
        : 'bg-[#f8fafc] text-neutral-900 selection:bg-neutral-900 selection:text-white'
    }`}>
      <ScrollProgressBar />
      {isProfileRoute ? (
        currentPath.startsWith('/profile/') && profileUsername ? (
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
        )
      ) : (
        <>
          <Navbar />
          <LandingPage />
          <Footer />
        </>
      )}


      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Global Learning Dashboard Modal */}
      <LearningDashboardModal
        isOpen={isDashboardOpen}
        onClose={closeDashboard}
        onSelectPath={handleSelectPathFromDashboard}
        onOpenExplorer={handleOpenExplorerFromDashboard}
      />

      {/* Direct Explorer / Path Modal launched from Dashboard */}
      {isDirectExplorerOpen && (
        <SkillExplorerModal
          isOpen={isDirectExplorerOpen}
          initialPath={selectedDashboardPath}
          onClose={() => {
            setIsDirectExplorerOpen(false)
            setSelectedDashboardPath(null)
          }}
        />
      )}

      {/* Global AI Roadmap Builder Modal */}
      <RoadmapBuilderModal
        isOpen={isRoadmapBuilderOpen}
        onClose={closeRoadmapBuilder}
        initialGoal={roadmapBuilderInitialGoal}
        onSelectPath={handleSelectPathFromDashboard}
      />
    </div>
  )
}

export default function App() {
  const lenisRef = useRef(null)

  useEffect(() => {
    function update(time) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }

    // Drive Lenis directly off the master GSAP ticker on every animation frame
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false,
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
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
