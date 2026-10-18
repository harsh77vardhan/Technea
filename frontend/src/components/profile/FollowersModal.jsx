import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Users, Loader2 } from 'lucide-react'
import { getUserFollowersApi, getUserFollowingApi, getAvatarUrl } from '../../services/api'
import FollowButton from './FollowButton'

export default function FollowersModal({
  isOpen,
  onClose,
  initialTab = 'followers', // 'followers' | 'following'
  username,
  onNavigateUser,
}) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab)

  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab)
    setActiveTab(initialTab)
  }

  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isOpen || !username) return
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [followersRes, followingRes] = await Promise.allSettled([
          getUserFollowersApi(username),
          getUserFollowingApi(username),
        ])

        if (isMounted) {
          if (followersRes.status === 'fulfilled' && Array.isArray(followersRes.value)) {
            setFollowers(followersRes.value)
          }
          if (followingRes.status === 'fulfilled' && Array.isArray(followingRes.value)) {
            setFollowing(followingRes.value)
          }
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Failed to load followers/following lists:', err)
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [isOpen, username])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const currentList = activeTab === 'followers' ? followers : following
  const filteredList = currentList.filter((u) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    )
  })

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0A0A0E]/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 shrink-0 bg-white/[0.01]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-[#EDEDED] font-mono tracking-wide">
                  Developer Network
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  @{username}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8F98] font-mono">
                Explore connected peer engineers and mentors across the network.
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Tab switchers with animated indicator */}
          <div className="flex border-b border-white/[0.06] bg-black/40 px-4 shrink-0 relative">
            <button
              type="button"
              onClick={() => setActiveTab('followers')}
              className={`relative flex-1 py-3 text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                activeTab === 'followers'
                  ? 'text-white font-bold'
                  : 'text-[#8A8F98] hover:text-[#EDEDED]'
              }`}
            >
              <span>Followers ({followers.length})</span>
              {activeTab === 'followers' && (
                <motion.div
                  layoutId="followersModalTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('following')}
              className={`relative flex-1 py-3 text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                activeTab === 'following'
                  ? 'text-white font-bold'
                  : 'text-[#8A8F98] hover:text-[#EDEDED]'
              }`}
            >
              <span>Following ({following.length})</span>
              {activeTab === 'following' && (
                <motion.div
                  layoutId="followersModalTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Search input */}
          <div className="p-4 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-3.5 w-3.5 text-[#8A8F98] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab} by name or handle...`}
                className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-10 pr-3.5 py-2 text-xs text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 font-mono transition-all"
              />
            </div>
          </div>

          {/* User list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {isLoading ? (
              <div className="py-14 text-center text-[#8A8F98] font-mono text-xs flex items-center justify-center gap-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span>Loading developer network...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-14 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-[#8A8F98]">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-xs font-mono font-medium text-[#EDEDED]">
                  {searchQuery ? 'No matching engineers found' : `No ${activeTab} yet`}
                </p>
                <p className="text-[11px] font-mono text-[#8A8F98] max-w-xs mx-auto">
                  {searchQuery
                    ? 'Try searching with a different username or full name.'
                    : `Engineers who follow @${username} will appear in this verified roster.`}
                </p>
              </div>
            ) : (
              filteredList.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] transition-all group"
                >
                  <div
                    className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1 mr-3"
                    onClick={() => {
                      onClose()
                      if (onNavigateUser) onNavigateUser(dev.username)
                    }}
                  >
                    {dev.avatar_url ? (
                      <img
                        src={getAvatarUrl(dev.avatar_url)}
                        alt={dev.full_name || dev.username}
                        className="h-10 w-10 rounded-full object-cover border border-white/[0.12] ring-2 ring-black shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-[#141416] text-xs font-bold text-[#EDEDED] font-mono ring-2 ring-black shrink-0">
                        {(dev.full_name || dev.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#EDEDED] group-hover:text-white group-hover:underline truncate">
                          {dev.full_name || dev.username}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#8A8F98] block truncate">
                        @{dev.username}
                      </span>
                      {dev.bio && (
                        <p className="text-[10px] text-[#CCCCCC] truncate max-w-[240px] mt-0.5 font-sans">
                          {dev.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <FollowButton
                      username={dev.username}
                      initialIsFollowing={dev.is_following}
                      isSelf={dev.is_self}
                      size="sm"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
