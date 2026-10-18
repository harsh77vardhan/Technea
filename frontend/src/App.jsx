import { useState } from 'react'
import AuthProvider from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/layout/Navbar'
import LandingPage from './pages/LandingPage'
import Footer from './components/layout/Footer'
import AuthModal from './components/auth/AuthModal'
import LearningDashboardModal from './components/dashboard/LearningDashboardModal'
import SkillExplorerModal from './components/explorer/SkillExplorerModal'
import RoadmapBuilderModal from './components/roadmap/RoadmapBuilderModal'

function AppContent() {
  const {
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

  const handleSelectPathFromDashboard = (path) => {
    setSelectedDashboardPath(path)
    setIsDirectExplorerOpen(true)
  }

  const handleOpenExplorerFromDashboard = () => {
    setSelectedDashboardPath(null)
    setIsDirectExplorerOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">
      <Navbar />
      <LandingPage />
      <Footer />

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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
