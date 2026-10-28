import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  Trophy,
  Sparkles,
  Target,
  Users,
  Code2,
  ExternalLink,
  Layers,
  AlertCircle,
  Compass,
  Globe,
  Share2,
  Check,
  CircleDot,
  Pencil,
  Route,
} from 'lucide-react'
import {
  getPublicProfileApi,
  getMyRoadmapsApi,
} from '../services/api'
import { useAuth } from '../context/useAuth'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileEditor from '../components/profile/ProfileEditor'
import FollowersModal from '../components/profile/FollowersModal'
import { getTierConfig } from '../utils/tierConfig'

function GithubIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

function getBadgeIcon(iconName) {
  switch (iconName) {
    case 'flame':
      return <Flame className="h-4 w-4 text-neutral-200" />
    case 'target':
      return <Target className="h-4 w-4 text-neutral-200" />
    case 'folder_git':
      return <FolderGit2 className="h-4 w-4 text-neutral-200" />
    case 'users':
      return <Users className="h-4 w-4 text-neutral-200" />
    case 'layers':
      return <Layers className="h-4 w-4 text-neutral-200" />
    case 'sparkles':
    default:
      return <Sparkles className="h-4 w-4 text-neutral-200" />
  }
}

/**
 * Skeleton Loader matching command center card structure
 */
function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-[14px] border border-white/[0.06] bg-[#0C0C0C] p-6 space-y-4">
        <div className="h-28 w-full bg-[#141414] rounded-[10px]" />
        <div className="flex items-center gap-5 pt-2">
          <div className="h-24 w-24 rounded-full bg-[#1A1A1A] shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-[#1A1A1A] rounded-[4px]" />
            <div className="h-3 w-32 bg-[#161616] rounded-[4px]" />
            <div className="h-3 w-64 bg-[#141414] rounded-[4px]" />
          </div>
        </div>
      </div>

      {/* Progress bar strip skeleton */}
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0C0C0C] p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-40 bg-[#161616] rounded-[4px]" />
          <div className="h-4 w-12 bg-[#161616] rounded-[4px]" />
        </div>
        <div className="h-2 w-full bg-[#181818] rounded-full" />
      </div>

      {/* Quick stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-[10px] border border-white/[0.06] bg-[#0C0C0C] p-4 space-y-2"
          >
            <div className="h-3 w-16 bg-[#161616] rounded-[4px]" />
            <div className="h-6 w-12 bg-[#1E1E1E] rounded-[4px]" />
          </div>
        ))}
      </div>

      {/* Tabs content skeleton */}
      <div className="rounded-[10px] border border-white/[0.06] bg-[#0C0C0C] p-6 space-y-4">
        <div className="h-8 w-64 bg-[#161616] rounded-[6px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="h-28 bg-[#141414] rounded-[8px]" />
          <div className="h-28 bg-[#141414] rounded-[8px]" />
        </div>
      </div>
    </div>
  )
}

export default function PublicProfilePage({
  username: initialUsername,
  initialEditOpen = false,
  onBackToHome,
}) {
  const { user, openDashboard, openRoadmapBuilder } = useAuth()
  const [overrideUsername, setOverrideUsername] = useState(null)

  // Resolve current viewing username
  const currentUsername = useMemo(() => {
    if (overrideUsername) return overrideUsername
    if (initialUsername) return initialUsername
    const path = window.location.pathname
    if (path.startsWith('/profile/')) {
      return path.slice('/profile/'.length).split('/')[0].split('?')[0]
    }
    return user?.username || ''
  }, [overrideUsername, initialUsername, user?.username])

  const [profile, setProfile] = useState(null)
  const [roadmaps, setRoadmaps] = useState([])
  const [isLoading, setIsLoading] = useState(Boolean(currentUsername))
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('skills') // 'skills' | 'roadmaps' | 'projects' | 'links' | 'achievements'
  const [copiedLink, setCopiedLink] = useState(false)

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(() => {
    if (initialEditOpen) return true
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('edit') === 'true'
    }
    return false
  })
  const [prevInitialEditOpen, setPrevInitialEditOpen] = useState(initialEditOpen)
  if (initialEditOpen !== prevInitialEditOpen) {
    setPrevInitialEditOpen(initialEditOpen)
    if (initialEditOpen) {
      setIsEditorOpen(true)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    if (typeof window !== 'undefined' && window.location.search.includes('edit=')) {
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
  }

  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false)
  const [followersModalTab, setFollowersModalTab] = useState('followers')
  const [reloadTrigger, setReloadTrigger] = useState(0)


  // Fetch Public Profile and Roadmaps
  useEffect(() => {
    if (!currentUsername) return

    let isMounted = true

    const loadProfileData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPublicProfileApi(currentUsername)
        if (!isMounted) return
        setProfile(data)

        // If this is the authenticated user's own profile, also load saved roadmaps
        if (data.is_own_profile || (user && user.username === currentUsername)) {
          try {
            const saved = await getMyRoadmapsApi()
            if (isMounted && Array.isArray(saved)) {
              setRoadmaps(saved)
            }
          } catch (e) {
            console.debug('No custom user roadmaps found:', e)
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load public profile:', err)
          setError(err.message || `Developer '@${currentUsername}' could not be found.`)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfileData()

    return () => {
      isMounted = false
    }
  }, [currentUsername, user, reloadTrigger])

  const handleNavigateUser = useCallback((newUsername) => {
    setOverrideUsername(newUsername)
    window.history.pushState({}, '', `/profile/${newUsername}`)
  }, [])

  const handleOpenFollowers = useCallback(() => {
    setFollowersModalTab('followers')
    setIsFollowersModalOpen(true)
  }, [])

  const handleOpenFollowing = useCallback(() => {
    setFollowersModalTab('following')
    setIsFollowersModalOpen(true)
  }, [])

  const handleFollowChange = useCallback((isFollowing, followersCount) => {
    setProfile((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        is_following: isFollowing,
        followers_count:
          followersCount !== undefined
            ? followersCount
            : isFollowing
            ? prev.followers_count + 1
            : Math.max(0, prev.followers_count - 1),
      }
    })
  }, [])

  const handleProfileUpdated = useCallback((updated) => {
    if (updated) {
      setProfile((prev) => ({
        ...prev,
        ...updated,
      }))
      if (updated.username && updated.username !== currentUsername) {
        setOverrideUsername(updated.username)
        window.history.replaceState({}, '', `/profile/${updated.username}`)
      }
    } else {
      setReloadTrigger((n) => n + 1)
    }
  }, [currentUsername])

  const handleBack = useCallback(() => {
    if (onBackToHome) {
      onBackToHome()
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [onBackToHome])

  const handleShareProfile = useCallback(async () => {
    const url = window.location.href
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    } catch (e) {
      console.error('Failed to copy link:', e)
    }
  }, [])

  // Tier info for styling
  const tierConfig = useMemo(() => {
    return getTierConfig(profile?.developer_level)
  }, [profile])

  // Count active / completed roadmaps
  const completedRoadmapsCount = useMemo(() => {
    if (roadmaps.length > 0) {
      return roadmaps.filter((r) => r.progress_percent === 100 || !r.is_active).length
    }
    if (profile?.completed_milestones_count) {
      return Math.floor(profile.completed_milestones_count / 5)
    }
    return 0
  }, [roadmaps, profile])

  const unlockedAchievementsCount = useMemo(() => {
    return profile?.achievements?.filter((a) => a.unlocked).length || 0
  }, [profile])

  // Handle case where no username is available
  const displayError = !currentUsername ? 'No developer username specified.' : error

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] antialiased selection:bg-[#333333] selection:text-white relative overflow-x-clip">
      {/* Background radial glow & dark command grid */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header Command Bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#222] bg-[#0d0d0d] px-3.5 py-2 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Technea</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs font-mono text-[#555555]">
              TECHNEA //
            </span>
            <span className="text-xs font-mono font-medium text-[#A1A1A1]">
              DEVELOPER IDENTITY
            </span>
            {currentUsername && (
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-neutral-300">
                @{currentUsername}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {profile?.is_own_profile && (
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#222] bg-[#0d0d0d] px-3.5 py-1.5 text-xs font-mono font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3 text-neutral-400" />
                <span>Edit</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#222] bg-[#0d0d0d] px-3 py-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
              title="Copy public profile URL"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-white" />
                  <span className="text-white text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Command Center Container */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {isLoading ? (
          <ProfileLoadingSkeleton />
        ) : displayError ? (
          /* 404 / Error State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]/95 p-8 text-center space-y-5 my-20 shadow-2xl backdrop-blur-md"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-neutral-300 shadow-sm">
              <AlertCircle className="h-7 w-7 text-neutral-300" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-mono font-bold text-white">
                Developer Profile Not Found
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The developer account you are looking for does not exist, has been renamed, or is currently private.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-xs font-mono font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
              >
                Return to Technea
              </button>
              {user?.username && (
                <button
                  type="button"
                  onClick={() => handleNavigateUser(user.username)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-2.5 text-xs font-mono font-medium text-neutral-300 hover:border-[#444] hover:text-white transition-all cursor-pointer"
                >
                  View My Profile
                </button>
              )}
            </div>
          </motion.div>
        ) : profile ? (
          <div className="space-y-8">
            {/* 1. Hero Section: Premium Command Center Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileHeader
                profile={profile}
                onEditProfile={() => setIsEditorOpen(true)}
                onOpenFollowers={handleOpenFollowers}
                onOpenFollowing={handleOpenFollowing}
                onFollowChange={handleFollowChange}
                onOpenDashboard={openDashboard}
              />
            </motion.div>

            {/* 2. Stats Matrix: Developer Progression, XP Bar & Metric Cards */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-neutral-300" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                    Developer Progression Matrix
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  Tier: <span className={tierConfig.accentText}>{profile.developer_level}</span>
                </span>
              </div>

              {/* XP Level Progress Bar Banner */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-5 sm:p-6 space-y-3.5 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Trophy className="h-4 w-4 text-neutral-300 shrink-0" />
                    <span className="font-extrabold text-xl text-white">
                      {profile.xp_points?.toLocaleString() || 0} XP
                    </span>
                    <span className="text-neutral-400">
                      / {profile.next_level_xp?.toLocaleString() || 500} XP to next tier
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-400">Progression</span>
                    <span className="text-xs font-bold font-mono text-white bg-white/[0.08] px-2.5 py-0.5 rounded-md border border-white/15">
                      {profile.level_progress_percent}%
                    </span>
                  </div>
                </div>

                {/* Animated Dynamic Gradient Bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#181818] ring-1 ring-white/[0.06]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${tierConfig.gradient} transition-all duration-700 shadow-[0_0_12px_rgba(255,255,255,0.15)]`}
                    style={{ width: `${Math.min(100, Math.max(5, profile.level_progress_percent))}%` }}
                  />
                </div>
              </div>

              {/* 6 High-Signal Command Center Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Learning Streak */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Active Streak
                    </span>
                    <Flame className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {profile.learning_streak}{' '}
                    <span className="text-xs font-normal text-neutral-400">days</span>
                  </p>
                </div>

                {/* 2. Completed Roadmaps */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Roadmaps
                    </span>
                    <Compass className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {completedRoadmapsCount}
                  </p>
                </div>

                {/* 3. Milestones Mastered */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Milestones
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {profile.completed_milestones_count || 0}
                  </p>
                </div>

                {/* 4. Lessons Completed */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Lessons
                    </span>
                    <BookOpen className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {profile.completed_courses_count || 0}
                  </p>
                </div>

                {/* 5. Projects Built */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Projects
                    </span>
                    <FolderGit2 className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {profile.completed_projects_count || profile.projects?.length || 0}
                  </p>
                </div>

                {/* 6. Total Platform XP */}
                <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 space-y-2 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                      Total XP
                    </span>
                    <Sparkles className="h-4 w-4 text-neutral-300" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">
                    {profile.xp_points || 0}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* 3. Command Center Content Tabs Navigation */}
            <div className="space-y-6 pt-2">
              <div className="flex items-center border-b border-white/[0.08] bg-[#0A0A0A]/90 backdrop-blur-md rounded-t-xl px-2 overflow-x-auto scrollbar-none relative">
                <button
                  type="button"
                  onClick={() => setActiveTab('skills')}
                  className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'skills'
                      ? 'text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Skills Mastery</span>
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 text-[10px] text-neutral-300">
                    {profile.skills?.length || 0}
                  </span>
                  {activeTab === 'skills' && (
                    <motion.div
                      layoutId="publicProfileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('roadmaps')}
                  className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'roadmaps'
                      ? 'text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Route className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Learning Journey & Roadmaps</span>
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 text-[10px] text-neutral-300">
                    {roadmaps.length || (profile.completed_milestones_count ? 1 : 0)}
                  </span>
                  {activeTab === 'roadmaps' && (
                    <motion.div
                      layoutId="publicProfileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('projects')}
                  className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'projects'
                      ? 'text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <FolderGit2 className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Portfolio Projects</span>
                  <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 text-[10px] text-neutral-300">
                    {profile.projects?.length || 0}
                  </span>
                  {activeTab === 'projects' && (
                    <motion.div
                      layoutId="publicProfileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'links'
                      ? 'text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5 text-neutral-300" />
                  <span>External Links</span>
                  {activeTab === 'links' && (
                    <motion.div
                      layoutId="publicProfileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('achievements')}
                  className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'achievements'
                      ? 'text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5 text-neutral-300" />
                  <span>Achievements</span>
                  <span className="rounded-full bg-white/[0.08] text-neutral-300 px-1.5 py-0.2 text-[10px]">
                    {unlockedAchievementsCount}/{profile.achievements?.length || 0}
                  </span>
                  {activeTab === 'achievements' && (
                    <motion.div
                      layoutId="publicProfileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {/* Tab 1: Skills Mastery */}
              {activeTab === 'skills' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-[#EDEDED]">
                        Mastered Engineering Skills & Progression
                      </h3>
                      <p className="text-xs text-[#8A8F98] font-mono mt-0.5">
                        Skills verified through hands-on roadmap milestones and code deliverables.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#8A8F98]">
                      {profile.skills?.length || 0} Tracked
                    </span>
                  </div>

                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {profile.skills.map((skill) => (
                        <div
                          key={skill.skill_id}
                          className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-4 sm:p-5 space-y-3.5 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 shadow-md group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold font-mono text-white group-hover:text-white transition-colors truncate">
                              {skill.skill_name}
                            </span>
                            <span className="text-xs font-mono font-bold text-white shrink-0">
                              {skill.mastery_percent}%
                            </span>
                          </div>

                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#181818] ring-1 ring-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-neutral-300 to-white transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                              style={{ width: `${skill.mastery_percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                            <span>{skill.completed_milestones} milestones verified</span>
                            <span className="rounded-md border border-white/10 bg-[#141414] px-2 py-0.5 text-[10px] text-neutral-300">
                              Level {Math.max(1, Math.ceil(skill.mastery_percent / 20))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Inspirational Skills Empty State */
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-10 sm:p-14 text-center space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141416] text-white shadow-sm">
                        <Code2 className="h-7 w-7 text-neutral-300" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-base font-bold font-mono text-white tracking-tight">
                          No Verified Skills Yet
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Master milestones across curated learning roadmaps and hands-on projects to verify and showcase engineering competencies on your public developer record.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-2 text-xs font-mono font-medium text-neutral-300 hover:text-white hover:border-[#444] transition-all cursor-pointer"
                        >
                          <Compass className="h-3.5 w-3.5 text-neutral-300" />
                          <span>Explore Skill Catalog</span>
                        </motion.button>
                        {profile.is_own_profile && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openRoadmapBuilder?.()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-mono font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Build AI Roadmap</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Learning Journey & Roadmaps */}
              {activeTab === 'roadmaps' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">
                        Active & Completed Learning Roadmaps
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Step-by-step career blueprints with milestone progress and practical deliverables.
                      </p>
                    </div>

                    {profile.is_own_profile && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openRoadmapBuilder?.()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-mono font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer self-start sm:self-auto shadow-md"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Build AI Roadmap</span>
                      </motion.button>
                    )}
                  </div>

                  {roadmaps.length > 0 ? (
                    <div className="space-y-4">
                      {roadmaps.map((r) => {
                        const phases = r.roadmap_data?.phases || []
                        const totalPhases = phases.length
                        const allMilestones = phases.flatMap((p) => p.milestones || [])

                        return (
                          <div
                            key={r.id}
                            className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 p-5 sm:p-6 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 transition-all space-y-4 shadow-xl"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="text-sm font-bold text-white">
                                    {r.title}
                                  </h4>
                                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                                    {r.target_role || 'Software Engineering'}
                                  </span>
                                  <span className="rounded-md border border-white/[0.08] bg-[#141414] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                                    {r.experience_level || 'All Levels'}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-400">
                                  {r.goal}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono font-semibold text-white">
                                  {r.progress_percent}% Complete
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                <span>{totalPhases} Curriculum Phases</span>
                                <span>{allMilestones.length} Milestones Tracked</span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-[#181818] ring-1 ring-white/[0.05]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-neutral-300 to-white transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                  style={{ width: `${Math.min(100, Math.max(4, r.progress_percent))}%` }}
                                />
                              </div>
                            </div>

                            {/* Milestones Overview Sample Strip */}
                            {allMilestones.length > 0 && (
                              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                                  Milestone Checkpoints Preview
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {allMilestones.slice(0, 6).map((m, idx) => {
                                    const isDone =
                                      r.completed_milestone_ids?.includes(m.id) ||
                                      idx < Math.ceil((r.progress_percent / 100) * allMilestones.length)
                                    return (
                                      <div
                                        key={m.id || idx}
                                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#0A0A0A] p-2 text-xs font-mono"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          {isDone ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-neutral-200 shrink-0" />
                                          ) : (
                                            <CircleDot className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
                                          )}
                                          <span className="text-[11px] text-white truncate">
                                            {m.title}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-[9px] px-2 py-0.5 rounded-full shrink-0 ml-1 font-mono ${
                                            isDone
                                              ? 'bg-white/[0.08] text-white border border-white/15'
                                              : 'bg-[#141414] text-neutral-400'
                                          }`}
                                        >
                                          {isDone ? 'Completed' : 'Up Next'}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Action to Continue / Open */}
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-[11px] font-mono text-neutral-400">
                                Duration: {r.estimated_duration || '6 Weeks'}
                              </span>
                              {profile.is_own_profile ? (
                                <button
                                  type="button"
                                  onClick={openDashboard}
                                  className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white cursor-pointer hover:underline"
                                >
                                  <span>Continue in Dashboard</span>
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              ) : (
                                <span className="text-xs font-mono text-neutral-400">
                                  Public Roadmap Preview
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    /* Inspirational Roadmaps Empty State */
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-10 sm:p-14 text-center space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141416] text-white shadow-sm">
                        <Route className="h-7 w-7 text-neutral-300" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-base font-bold font-mono text-white tracking-tight">
                          No Active Roadmaps Tracked
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Accelerate your engineering trajectory with AI-generated role blueprints tailored to your career ambitions, complete with milestone tracking and curated projects.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {profile.is_own_profile ? (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openRoadmapBuilder?.()}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-mono font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Generate First AI Roadmap</span>
                          </motion.button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleBack}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-2 text-xs font-mono text-neutral-300 hover:text-white hover:border-[#444] transition-colors cursor-pointer"
                          >
                            <span>Browse Curated Paths</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Projects Portfolio */}
              {activeTab === 'projects' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">
                        Hands-on Projects Portfolio
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Production-grade code deliverables built and verified during the learning progression.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">
                      {profile.projects?.length || 0} Showcased
                    </span>
                  </div>

                  {profile.projects && profile.projects.length > 0 ? (
                    <div className="space-y-3.5">
                      {profile.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 p-5 sm:p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all space-y-3.5 shadow-xl group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                                {proj.title}
                              </h4>
                              <span className="rounded-md border border-white/[0.08] bg-[#141414] px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                                {proj.category || 'Engineering'}
                              </span>
                              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-300">
                                {proj.difficulty}
                              </span>
                            </div>

                            {proj.completed_at && (
                              <span className="text-[11px] font-mono text-neutral-400">
                                Completed {proj.completed_at}
                              </span>
                            )}
                          </div>

                          {proj.description && (
                            <p className="text-xs text-neutral-300 leading-relaxed">
                              {proj.description}
                            </p>
                          )}

                          {/* Tech Stack Chips & GitHub Repo Link */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {proj.tech_stack?.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-md border border-white/[0.08] bg-[#111116] px-2 py-0.5 text-[10px] font-mono text-neutral-400"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>

                            {proj.github_url && (
                              <a
                                href={proj.github_url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:underline hover:text-white transition-colors"
                              >
                                <GithubIcon className="h-3.5 w-3.5 text-neutral-300" />
                                <span>View Repository</span>
                                <ExternalLink className="h-3 w-3 text-neutral-400" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Inspirational Projects Empty State */
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl p-10 sm:p-14 text-center space-y-4 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#141416] text-white shadow-sm">
                        <FolderGit2 className="h-7 w-7 text-neutral-300" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-base font-bold font-mono text-white tracking-tight">
                          No Capstone Projects Showcased Yet
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          Production-grade open source deliverables, full-stack microservices, and system architectures built during your learning journey will be verified and showcased here.
                        </p>
                      </div>
                      {profile.is_own_profile && (
                        <div className="pt-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={openDashboard}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-mono font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
                          >
                            <FolderGit2 className="h-3.5 w-3.5" />
                            <span>Explore Project Blueprints</span>
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 4: External Links */}
              {activeTab === 'links' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">
                      External Developer Links & Presence
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      Verified public links to external repositories, engineering networks, and personal web presence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* GitHub Card */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-400">GitHub</span>
                        <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white">
                          <GithubIcon className="h-4 w-4" />
                        </div>
                      </div>
                      {profile.github_url ? (
                        <div className="space-y-2">
                          <p className="text-xs font-mono text-white truncate font-medium">
                            {profile.github_url.replace(/^https?:\/\/(www\.)?github\.com\/?/, '@')}
                          </p>
                          <a
                            href={profile.github_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:underline"
                          >
                            <span>Open Profile</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-neutral-500">Not linked</p>
                      )}
                    </div>

                    {/* LinkedIn Card */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-400">LinkedIn</span>
                        <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white">
                          <LinkedinIcon className="h-4 w-4" />
                        </div>
                      </div>
                      {profile.linkedin_url ? (
                        <div className="space-y-2">
                          <p className="text-xs font-mono text-white truncate font-medium">
                            {profile.linkedin_url.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}
                          </p>
                          <a
                            href={profile.linkedin_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:underline"
                          >
                            <span>View Network</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-neutral-500">Not linked</p>
                      )}
                    </div>

                    {/* Portfolio Card */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#0D0D0D]/90 p-5 space-y-3.5 backdrop-blur-xl hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-neutral-400">Personal Portfolio</span>
                        <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white">
                          <Globe className="h-4 w-4" />
                        </div>
                      </div>
                      {(profile.portfolio_url || profile.website_url) ? (
                        <div className="space-y-2">
                          <p className="text-xs font-mono text-white truncate font-medium">
                            {(profile.portfolio_url || profile.website_url).replace(/^https?:\/\//, '')}
                          </p>
                          <a
                            href={profile.portfolio_url || profile.website_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 hover:text-white hover:underline"
                          >
                            <span>Visit Website</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-neutral-500">Not linked</p>
                      )}
                    </div>
                  </div>

                  {!profile.github_url && !profile.linkedin_url && !profile.portfolio_url && !profile.website_url && profile.is_own_profile && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#0A0A0A] p-6 text-center space-y-2.5 font-mono">
                      <p className="text-xs text-neutral-400">
                        You haven&apos;t added any external developer links yet.
                      </p>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditorOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Add External Links</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 5: Achievements & Badges */}
              {activeTab === 'achievements' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-white">
                        Developer Achievements & Trophies
                      </h3>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        Gamification badges earned across learning velocity, project deliverables, and milestones.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-white font-bold bg-white/[0.08] px-2.5 py-0.5 rounded-md border border-white/15">
                      {unlockedAchievementsCount}/{profile.achievements?.length || 0} Unlocked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {profile.achievements?.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-start gap-3.5 rounded-xl border p-4 transition-all ${
                          badge.unlocked
                            ? 'border-white/15 bg-[#0E0E12]/90 backdrop-blur-xl shadow-lg hover:border-white/25'
                            : 'border-white/[0.04] bg-[#080808]/90 opacity-45'
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                            badge.unlocked
                              ? 'border-white/[0.14] bg-[#16161C] shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                              : 'border-white/[0.05] bg-[#0C0C0C]'
                          }`}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-bold font-mono text-white truncate">
                              {badge.title}
                            </span>
                            {badge.unlocked ? (
                              <span className="rounded-full bg-white/[0.08] border border-white/15 px-2 py-0.2 text-[9px] font-mono font-semibold text-neutral-200 shrink-0">
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-neutral-500 shrink-0">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 leading-snug">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Profile Editor Modal */}
      {isEditorOpen && (
        <ProfileEditor
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          initialData={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}


      {/* Followers & Following Modal */}
      {isFollowersModalOpen && (
        <FollowersModal
          isOpen={isFollowersModalOpen}
          onClose={() => setIsFollowersModalOpen(false)}
          initialTab={followersModalTab}
          username={profile?.username || currentUsername}
          onNavigateUser={handleNavigateUser}
        />
      )}
    </div>
  )
}
