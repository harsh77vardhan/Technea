import { useState, useEffect } from 'react'
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
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { getPublicProfileApi } from '../services/api'
import ProfileHeader from '../components/profile/ProfileHeader'
import ProfileEditor from '../components/profile/ProfileEditor'
import FollowersModal from '../components/profile/FollowersModal'

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

function getBadgeIcon(iconName) {
  switch (iconName) {
    case 'flame':
      return <Flame className="h-4 w-4 text-amber-400" />
    case 'target':
      return <Target className="h-4 w-4 text-emerald-400" />
    case 'folder_git':
      return <FolderGit2 className="h-4 w-4 text-blue-400" />
    case 'users':
      return <Users className="h-4 w-4 text-purple-400" />
    case 'sparkles':
    default:
      return <Sparkles className="h-4 w-4 text-cyan-400" />
  }
}

export default function ProfilePage({ username: initialUsername, onBackToHome }) {
  const [overrideUsername, setOverrideUsername] = useState(null)
  const currentUsername = overrideUsername || initialUsername || ''
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false)
  const [followersModalTab, setFollowersModalTab] = useState('followers')

  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    if (!currentUsername) return
    let isMounted = true

    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPublicProfileApi(currentUsername)
        if (isMounted) setProfile(data)
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load profile:', err)
          setError(err.message || 'Profile could not be found.')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [currentUsername, reloadTrigger])

  const handleNavigateUser = (newUsername) => {
    setOverrideUsername(newUsername)
    window.history.pushState({}, '', `/profile/${newUsername}`)
  }

  const handleOpenFollowers = () => {
    setFollowersModalTab('followers')
    setIsFollowersModalOpen(true)
  }

  const handleOpenFollowing = () => {
    setFollowersModalTab('following')
    setIsFollowersModalOpen(true)
  }

  const handleFollowChange = (isFollowing, followersCount) => {
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
  }

  const handleProfileUpdated = (updated) => {
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
  }

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome()
    } else {
      window.history.pushState({}, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EDEDED] antialiased selection:bg-[#333333] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#1A1A1A] bg-[#050505]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#222222] bg-[#0E0E0E] px-3 py-1.5 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:border-[#383838] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Technea</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#555555]">TECHNEA //</span>
            <span className="text-xs font-mono font-medium text-[#A1A1A1]">DEVELOPER IDENTITY</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3 font-mono text-xs text-[#737373]">
            <Loader2 className="h-6 w-6 animate-spin text-[#EDEDED]" />
            <span>Loading developer profile...</span>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md rounded-[10px] border border-[#262626] bg-[#0C0C0C] p-8 text-center space-y-4 my-16">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
            <div className="space-y-1">
              <h2 className="text-sm font-mono font-bold text-[#EDEDED]">Profile Not Found</h2>
              <p className="text-xs font-mono text-[#737373]">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-4 py-2 text-xs font-mono font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        ) : profile ? (
          <div className="space-y-8">
            {/* 1. Profile Header Component */}
            <ProfileHeader
              profile={profile}
              onEditProfile={() => setIsEditorOpen(true)}
              onOpenFollowers={handleOpenFollowers}
              onOpenFollowing={handleOpenFollowing}
              onFollowChange={handleFollowChange}
            />

            {/* 2. Developer Progression & Stats Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-[#737373]">
                  Engineering Progression & Stats
                </h2>
                <span className="text-[11px] font-mono text-[#555555]">
                  Tier: {profile.developer_level}
                </span>
              </div>

              {/* XP Progress Bar Strip */}
              <div className="rounded-[10px] border border-[#1E1E1E] bg-[#0C0C0C] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-[#EDEDED]">{profile.xp_points} XP</span>
                    <span className="text-[#666666]">/ {profile.next_level_xp} XP to next tier</span>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">{profile.level_progress_percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, profile.level_progress_percent))}%` }}
                  />
                </div>
              </div>

              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Streak */}
                <div className="rounded-[10px] border border-[#1C1C1C] bg-[#0C0C0C] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#737373]">Active Streak</span>
                    <Flame className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#EDEDED]">
                    {profile.learning_streak} <span className="text-xs font-normal text-[#666666]">days</span>
                  </p>
                </div>

                {/* Milestones */}
                <div className="rounded-[10px] border border-[#1C1C1C] bg-[#0C0C0C] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#737373]">Milestones</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#EDEDED]">
                    {profile.completed_milestones_count}
                  </p>
                </div>

                {/* Mastered Lessons */}
                <div className="rounded-[10px] border border-[#1C1C1C] bg-[#0C0C0C] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#737373]">Lessons Mastered</span>
                    <BookOpen className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#EDEDED]">
                    {profile.completed_courses_count}
                  </p>
                </div>

                {/* Hands-on Projects */}
                <div className="rounded-[10px] border border-[#1C1C1C] bg-[#0C0C0C] p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#737373]">Projects Built</span>
                    <FolderGit2 className="h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-[#EDEDED]">
                    {profile.completed_projects_count}
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Two-Column Layout: Left (Projects & Skills) / Right (Achievements) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2 cols wide) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Completed Projects Showcase */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-[#A1A1A1]" />
                      <h2 className="text-sm font-bold font-mono text-[#EDEDED]">
                        Hands-on Projects Portfolio
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-[#666666]">
                      {profile.projects?.length || 0} Showcased
                    </span>
                  </div>

                  {profile.projects && profile.projects.length > 0 ? (
                    <div className="space-y-3">
                      {profile.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="rounded-[10px] border border-[#1F1F1F] bg-[#0C0C0C] p-4 sm:p-5 hover:border-[#2D2D2D] transition-colors space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="text-sm font-bold text-[#EDEDED]">
                                {proj.title}
                              </h3>
                              <span className="rounded-[4px] border border-[#2B2B2B] bg-[#141414] px-2 py-0.5 text-[10px] font-mono text-[#A1A1A1]">
                                {proj.category || 'Engineering'}
                              </span>
                              <span className="rounded-[4px] border border-blue-500/20 bg-blue-950/20 px-2 py-0.5 text-[10px] font-mono text-blue-400">
                                {proj.difficulty}
                              </span>
                            </div>

                            {proj.completed_at && (
                              <span className="text-[11px] font-mono text-[#666666]">
                                Completed {proj.completed_at}
                              </span>
                            )}
                          </div>

                          {proj.description && (
                            <p className="text-xs text-[#A1A1A1] leading-relaxed">
                              {proj.description}
                            </p>
                          )}

                          {/* Tech Stack Pills & GitHub Link */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#181818]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {proj.tech_stack?.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-[4px] border border-[#222222] bg-[#111111] px-2 py-0.5 text-[10px] font-mono text-[#888888]"
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
                                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#EDEDED] hover:underline"
                              >
                                <GithubIcon className="h-3.5 w-3.5 text-[#EDEDED]" />
                                <span>View Repository</span>
                                <ExternalLink className="h-3 w-3 text-[#737373]" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[10px] border border-dashed border-[#222222] bg-[#0A0A0A] p-8 text-center space-y-2 font-mono">
                      <Code2 className="mx-auto h-6 w-6 text-[#444444]" />
                      <p className="text-xs text-[#888888]">No projects showcased yet.</p>
                      <p className="text-[11px] text-[#555555]">
                        Hands-on project deliverables from learning paths appear here.
                      </p>
                    </div>
                  )}
                </section>

                {/* Engineering Skills Mastery */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#A1A1A1]" />
                      <h2 className="text-sm font-bold font-mono text-[#EDEDED]">
                        Mastered Skills & Roadmap Progress
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-[#666666]">
                      {profile.skills?.length || 0} Tracked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.skills?.map((skill) => (
                      <div
                        key={skill.skill_id}
                        className="rounded-[8px] border border-[#1E1E1E] bg-[#0C0C0C] p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-[#EDEDED] truncate">
                            {skill.skill_name}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {skill.mastery_percent}%
                          </span>
                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#181818]">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${skill.mastery_percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-[#666666]">
                          <span>{skill.completed_milestones} milestones verified</span>
                          <span>Level {Math.ceil(skill.mastery_percent / 20)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Achievements & Badges */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#A1A1A1]" />
                      <h2 className="text-sm font-bold font-mono text-[#EDEDED]">
                        Developer Achievements
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-amber-400">
                      {profile.achievements?.filter((a) => a.unlocked).length || 0}/
                      {profile.achievements?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {profile.achievements?.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-start gap-3 rounded-[8px] border p-3 transition-colors ${
                          badge.unlocked
                            ? 'border-[#262626] bg-[#0C0C0C]'
                            : 'border-[#181818] bg-[#080808] opacity-50'
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border ${
                            badge.unlocked
                              ? 'border-[#2D2D2D] bg-[#141414]'
                              : 'border-[#1C1C1C] bg-[#0E0E0E]'
                          }`}
                        >
                          {getBadgeIcon(badge.icon)}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-[#EDEDED] truncate">
                              {badge.title}
                            </span>
                            {badge.unlocked && (
                              <span className="rounded-full bg-amber-400/10 px-1.5 py-0.2 text-[9px] font-mono text-amber-400">
                                Unlocked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#737373] leading-snug">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Profile Editor Modal */}
      {isEditorOpen && (
        <ProfileEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
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
