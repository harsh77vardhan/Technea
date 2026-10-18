import { useState } from 'react'
import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react'
import { followUserApi, unfollowUserApi } from '../../services/api'
import { useAuth } from '../../context/useAuth'

export default function FollowButton({
  username,
  initialIsFollowing = false,
  isSelf = false,
  onFollowChange,
  size = 'md', // 'sm' | 'md'
}) {
  const { user, openAuthModal } = useAuth()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [prevProps, setPrevProps] = useState({ username, initialIsFollowing })
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (prevProps.username !== username || prevProps.initialIsFollowing !== initialIsFollowing) {
    setPrevProps({ username, initialIsFollowing })
    setIsFollowing(initialIsFollowing)
  }

  if (isSelf || (user && user.username === username)) {
    return null
  }

  const handleToggle = async (e) => {
    e.stopPropagation()
    if (!user) {
      openAuthModal('login')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFollowing) {
        const res = await unfollowUserApi(username)
        setIsFollowing(false)
        if (onFollowChange) onFollowChange(false, res.followers_count)
      } else {
        const res = await followUserApi(username)
        setIsFollowing(true)
        if (onFollowChange) onFollowChange(true, res.followers_count)
      }
    } catch (err) {
      console.error('Failed to toggle follow status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const isSmall = size === 'sm'

  if (isFollowing) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] font-mono font-medium transition-all cursor-pointer ${
          isSmall ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
        } ${
          isHovered
            ? 'border border-red-500/40 bg-red-950/20 text-red-400 hover:bg-red-900/30'
            : 'border border-[#262626] bg-[#121212] text-[#D4D4D4] hover:border-[#383838]'
        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isHovered ? (
          <>
            <UserX className="h-3 w-3 text-red-400" />
            <span>Unfollow</span>
          </>
        ) : (
          <>
            <UserCheck className="h-3 w-3 text-emerald-400" />
            <span>Following</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] font-mono font-bold transition-all cursor-pointer shadow-xs ${
        isSmall ? 'px-2.5 py-1 text-[11px]' : 'px-4 py-1.5 text-xs'
      } bg-[#EDEDED] text-[#050505] hover:bg-white active:scale-98 ${
        isLoading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-3 w-3" />
          <span>Follow</span>
        </>
      )}
    </button>
  )
}
