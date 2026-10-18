import { useState, useEffect } from 'react'
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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md rounded-[10px] border border-[#262626] bg-[#0E0E0E] shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1C] px-5 py-4 shrink-0 bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#A1A1A1]" />
            <h3 className="text-sm font-bold text-[#EDEDED] font-mono">
              @{username}&apos;s Network
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#666666] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-[#1A1A1A] bg-[#080808] px-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 text-xs font-mono font-medium border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'followers'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-[#737373] hover:text-[#EDEDED]'
            }`}
          >
            Followers ({followers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 text-xs font-mono font-medium border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'following'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-[#737373] hover:text-[#EDEDED]'
            }`}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-[#1A1A1A] bg-[#0A0A0A] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full rounded-[6px] border border-[#222222] bg-[#050505] pl-9 pr-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#555555] focus:border-[#444444] focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#171717] p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 text-center text-[#737373] font-mono text-xs flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Loading developer network...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center text-[#666666] font-mono text-xs">
              {searchQuery ? 'No matching developers found.' : `No ${activeTab} yet.`}
            </div>
          ) : (
            filteredList.map((dev) => (
              <div
                key={dev.id}
                className="flex items-center justify-between p-2.5 rounded-[6px] hover:bg-[#121212] transition-colors"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                  onClick={() => {
                    onClose()
                    if (onNavigateUser) onNavigateUser(dev.username)
                  }}
                >
                  {dev.avatar_url ? (
                    <img
                      src={getAvatarUrl(dev.avatar_url)}
                      alt={dev.full_name || dev.username}
                      className="h-9 w-9 rounded-[8px] object-cover border border-[#262626] shrink-0"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#262626] bg-[#161616] text-xs font-bold text-[#EDEDED] font-mono shrink-0">
                      {(dev.full_name || dev.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#EDEDED] truncate hover:underline">
                        {dev.full_name || dev.username}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#737373] block truncate">
                      @{dev.username}
                    </span>
                    {dev.bio && (
                      <p className="text-[10px] text-[#888888] truncate max-w-[200px] mt-0.5">
                        {dev.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 ml-2">
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
      </div>
    </div>
  )
}
