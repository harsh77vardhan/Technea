import { useState } from 'react'
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
} from 'lucide-react'
import FollowButton from './FollowButton'
import { getAvatarUrl } from '../../utils/avatar'

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
}) {
  const [copiedShare, setCopiedShare] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [prevAvatarUrl, setPrevAvatarUrl] = useState(profile?.avatar_url)

  if (profile?.avatar_url !== prevAvatarUrl) {
    setPrevAvatarUrl(profile?.avatar_url)
    setAvatarError(false)
  }

  if (!profile) return null

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

  const initials = (profile.full_name || profile.username || 'U')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="w-full rounded-[12px] border border-[#222222] bg-[#0A0A0A] overflow-hidden shadow-2xl">
      {/* Subtle top banner strip */}
      <div className="h-28 sm:h-32 w-full bg-gradient-to-r from-[#111111] via-[#161616] to-[#0D0D0D] border-b border-[#1C1C1C] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent pointer-events-none" />
      </div>

      {/* Main Profile Info Section */}
      <div className="px-5 sm:px-8 pb-7 -mt-12 sm:-mt-14 relative">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          {/* Avatar & Badges */}
          <div className="flex items-end gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              {profile.avatar_url && !avatarError ? (
                <img
                  src={getAvatarUrl(profile.avatar_url)}
                  alt={profile.full_name || profile.username}
                  onError={() => setAvatarError(true)}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-[12px] object-cover border-2 border-[#262626] bg-[#141414] shadow-xl ring-4 ring-[#0A0A0A]"
                />
              ) : (
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-[12px] border-2 border-[#262626] bg-[#141414] text-2xl sm:text-3xl font-mono font-bold text-[#EDEDED] shadow-xl ring-4 ring-[#0A0A0A]">
                  {initials}
                </div>
              )}
            </div>

            <div className="space-y-1 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EDEDED]">
                  {profile.full_name || profile.username}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono text-[#888888]">
                  @{profile.username}
                </span>
                <span className="text-xs text-[#333333]">•</span>
                <span className="rounded-[4px] border border-[#222222] bg-[#121212] px-2 py-0.5 text-[11px] font-mono text-[#A1A1A1]">
                  {profile.developer_level}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:self-end pt-2 sm:pt-0">
            {profile.is_own_profile ? (
              <button
                type="button"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#2A2A2A] bg-[#141414] px-4 py-2 text-xs font-mono font-semibold text-[#EDEDED] hover:bg-[#1A1A1A] hover:border-[#383838] transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Pencil className="h-3.5 w-3.5 text-[#A1A1A1]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <FollowButton
                username={profile.username}
                initialIsFollowing={profile.is_following}
                isSelf={profile.is_own_profile}
                onFollowChange={onFollowChange}
                size="md"
              />
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#262626] bg-[#121212] px-3 py-2 text-xs font-mono text-[#A1A1A1] hover:text-[#EDEDED] hover:border-[#333333] transition-colors cursor-pointer"
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
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-xs sm:text-sm text-[#CCCCCC] leading-relaxed max-w-3xl">
            {profile.bio}
          </p>
        )}

        {/* Metadata & Social Row */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#737373] font-mono">
          {profile.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#555555]" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#555555]" />
            <span>Joined {profile.joined_date}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>{profile.learning_streak} Day Streak</span>
          </div>
        </div>

        {/* Social Links */}
        {(profile.github_url || profile.linkedin_url || profile.portfolio_url) && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-3 border-t border-[#191919]">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-[11px] font-mono text-[#A1A1A1] hover:text-white hover:border-[#383838] transition-colors"
              >
                <GithubIcon className="h-3 w-3" />
                <span>GitHub</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#555555]" />
              </a>
            )}

            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-[11px] font-mono text-[#A1A1A1] hover:text-[#0A66C2] hover:border-[#383838] transition-colors"
              >
                <LinkedinIcon className="h-3 w-3" />
                <span>LinkedIn</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#555555]" />
              </a>
            )}

            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#222222] bg-[#111111] px-2.5 py-1 text-[11px] font-mono text-[#A1A1A1] hover:text-white hover:border-[#383838] transition-colors"
              >
                <Globe className="h-3 w-3" />
                <span>Portfolio</span>
                <ExternalLink className="h-2.5 w-2.5 text-[#555555]" />
              </a>
            )}
          </div>
        )}

        {/* Followers / Following Network Count */}
        <div className="mt-4 flex items-center gap-4 pt-3.5 border-t border-[#191919]">
          <button
            type="button"
            onClick={onOpenFollowers}
            className="group flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <span className="font-bold text-[#EDEDED] group-hover:underline">
              {profile.followers_count}
            </span>
            <span>Followers</span>
          </button>

          <span className="text-[#333333]">•</span>

          <button
            type="button"
            onClick={onOpenFollowing}
            className="group flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <span className="font-bold text-[#EDEDED] group-hover:underline">
              {profile.following_count}
            </span>
            <span>Following</span>
          </button>

          <span className="text-[#333333]">•</span>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#888888]">
            <span className="font-bold text-[#EDEDED]">{profile.xp_points}</span>
            <span>XP</span>
          </div>
        </div>
      </div>
    </div>
  )
}
