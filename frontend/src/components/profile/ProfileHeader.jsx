import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Globe,
  ExternalLink,
  Pencil,
  Share2,
  Check,
  ShieldCheck,
  Flame,
  LayoutDashboard,
  Sparkles,
  Zap,
} from 'lucide-react'
import FollowButton from './FollowButton'
import { getAvatarUrl } from '../../utils/avatar'
import { useAuth } from '../../context/useAuth'
import { getTierConfig } from '../../utils/tierConfig'

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

export default function ProfileHeader({
  profile,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onFollowChange,
  onOpenDashboard,
}) {
  const { openDashboard } = useAuth()
  const [copiedShare, setCopiedShare] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [prevAvatarUrl, setPrevAvatarUrl] = useState(profile?.avatar_url)

  if (profile?.avatar_url !== prevAvatarUrl) {
    setPrevAvatarUrl(profile?.avatar_url)
    setAvatarError(false)
  }

  if (!profile) return null

  const tierConfig = getTierConfig(profile.developer_level)

  const handleShare = async () => {
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
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2200)
    } catch (err) {
      console.error('Failed to copy profile link:', err)
    }
  }

  const handleDashboardClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard()
    } else if (openDashboard) {
      openDashboard()
    }
  }

  const initials = (profile.full_name || profile.username || 'U')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0D0D0D]/90 backdrop-blur-xl overflow-hidden shadow-2xl relative">
      {/* Futuristic Command Center Banner with Starfield Canvas Effect */}
      <div className="h-32 sm:h-38 w-full bg-gradient-to-r from-[#070709] via-[#101014] to-[#0A0A0E] border-b border-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Dynamic Ambient Glow Aura based on Developer Tier */}
        <div
          className={`absolute -top-16 left-8 sm:left-14 h-48 w-48 rounded-full bg-gradient-to-r ${tierConfig.gradient} opacity-25 blur-3xl pointer-events-none`}
        />

        {/* Top Autonomous Network Telemetry Badge */}
        <div className="absolute top-3.5 right-4 sm:right-6 hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/60 px-3 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#8A8F98]">
            TECHNEA // NODE ACTIVE
          </span>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="px-5 sm:px-8 pb-7 -mt-14 sm:-mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          {/* Circular Avatar & Glow Ring */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative group shrink-0 self-start sm:self-auto">
              {/* Outer dynamic ambient blur glow */}
              <div
                className={`absolute -inset-1 rounded-full bg-gradient-to-r ${tierConfig.gradient} opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* High-resolution circular avatar with developer level glow ring */}
              <div
                className={`relative h-24 w-24 sm:h-28 sm:w-28 rounded-full p-[3px] bg-gradient-to-r ${tierConfig.gradient} shadow-2xl ${tierConfig.ring}`}
              >
                {profile.avatar_url && !avatarError ? (
                  <img
                    src={getAvatarUrl(profile.avatar_url)}
                    alt={profile.full_name || profile.username}
                    onError={() => setAvatarError(true)}
                    className="h-full w-full rounded-full object-cover bg-[#0A0A0A] ring-2 ring-[#050505]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#111111] text-2xl sm:text-3xl font-mono font-bold text-[#EDEDED] ring-2 ring-[#050505] select-none">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 mb-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#EDEDED] font-sans">
                  {profile.full_name || profile.username}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.18)]">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Developer</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#141414] px-2.5 py-0.5 text-[10px] font-mono text-[#8A8F98]">
                  <Globe className="h-2.5 w-2.5 text-[#52525B]" />
                  <span>Public Identity</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-mono text-[#8A8F98]">
                  @{profile.username}
                </span>
                <span className="text-xs text-[#52525B]">•</span>
                {/* Engineering Tier Credential Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-mono font-semibold tracking-wide ${tierConfig.pill}`}
                >
                  <Zap className="h-3 w-3 animate-pulse" />
                  <span>{profile.developer_level}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-end pt-2 sm:pt-0 flex-wrap">
            {profile.is_own_profile ? (
              <>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onEditProfile}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#161616] px-4 py-2 text-xs font-mono font-semibold text-[#EDEDED] hover:bg-[#202020] hover:border-white/[0.22] transition-all cursor-pointer shadow-sm"
                >
                  <Pencil className="h-3.5 w-3.5 text-[#8A8F98]" />
                  <span>Edit Profile</span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDashboardClick}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#121212] px-3.5 py-2 text-xs font-mono font-semibold text-[#D4D4D4] hover:text-white hover:bg-[#1A1A1A] hover:border-white/[0.24] transition-all cursor-pointer shadow-sm"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Dashboard</span>
                </motion.button>
              </>
            ) : (
              <FollowButton
                username={profile.username}
                initialIsFollowing={profile.is_following}
                isSelf={profile.is_own_profile}
                onFollowChange={onFollowChange}
                size="md"
              />
            )}

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#121212] px-3 py-2 text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] hover:border-white/[0.18] transition-colors cursor-pointer"
              title="Share profile link"
            >
              {copiedShare ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Bio with typographic hierarchy */}
        {profile.bio && (
          <p className="mt-4 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed max-w-3xl font-sans">
            {profile.bio}
          </p>
        )}

        {/* Metadata pills: Location, Joined date, Learning streak */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#8A8F98] font-mono">
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#52525B]" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#52525B]" />
            <span>Joined {profile.joined_date}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>{profile.learning_streak} Day Streak</span>
          </div>
        </div>

        {/* External Developer Links Pills */}
        {(profile.github_url || profile.linkedin_url || profile.portfolio_url || profile.website_url) && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06]">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#111111]/90 px-2.5 py-1 text-[11px] font-mono text-[#8A8F98] hover:text-white hover:border-white/[0.22] hover:shadow-[0_0_12px_rgba(255,255,255,0.08)] transition-all"
              >
                <GithubIcon className="h-3 w-3" />
                <span>GitHub</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#52525B]" />
              </a>
            )}

            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#111111]/90 px-2.5 py-1 text-[11px] font-mono text-[#8A8F98] hover:text-[#0A66C2] hover:border-[#0A66C2]/50 hover:shadow-[0_0_14px_rgba(10,102,194,0.2)] transition-all"
              >
                <LinkedinIcon className="h-3 w-3" />
                <span>LinkedIn</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#52525B]" />
              </a>
            )}

            {(profile.portfolio_url || profile.website_url) && (
              <a
                href={profile.portfolio_url || profile.website_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#111111]/90 px-2.5 py-1 text-[11px] font-mono text-[#8A8F98] hover:text-cyan-300 hover:border-cyan-500/40 hover:shadow-[0_0_14px_rgba(6,182,212,0.2)] transition-all"
              >
                <Globe className="h-3 w-3" />
                <span>{profile.portfolio_url ? 'Portfolio' : 'Website'}</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#52525B]" />
              </a>
            )}
          </div>
        )}

        {/* Followers / Following Network Counters */}
        <div className="mt-4 flex items-center gap-4 pt-3.5 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onOpenFollowers}
            className="group flex items-center gap-1.5 text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <span className="font-bold text-[#EDEDED] group-hover:underline">
              {profile.followers_count}
            </span>
            <span>Followers</span>
          </button>

          <span className="text-[#52525B]">•</span>

          <button
            type="button"
            onClick={onOpenFollowing}
            className="group flex items-center gap-1.5 text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <span className="font-bold text-[#EDEDED] group-hover:underline">
              {profile.following_count}
            </span>
            <span>Following</span>
          </button>

          <span className="text-[#52525B]">•</span>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#8A8F98]">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span className="font-bold text-[#EDEDED]">{profile.xp_points}</span>
            <span>XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}
