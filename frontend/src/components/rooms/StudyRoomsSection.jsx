import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users,
  Search,
  Plus,
  KeyRound,
  Sparkles,
  Lock,
  Globe,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'
import { useAuth } from '../../context/useAuth'
import {
  getCommunityRoomsApi,
  getRecommendedRoomsApi,
  createRoomApi,
  joinRoomByCodeApi,
  toggleRoomJoinApi,
} from '../../services/api'
import CreateRoomModal from './CreateRoomModal'
import JoinByCodeModal from './JoinByCodeModal'
import StudyRoomWorkspaceModal from './StudyRoomWorkspaceModal'

const CATEGORY_TABS = [
  { id: 'all', label: 'All Rooms' },
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
  { id: 'my', label: 'My Rooms' },
  { id: 'public', label: 'Public Rooms' },
  { id: 'private', label: 'Private Rooms' },
]

const TOPIC_PILLS = [
  'All',
  'Python',
  'React',
  'AI & Machine Learning',
  'Backend Architecture',
  'Cloud & DevOps',
  'Data Structures & Algorithms',
]

export default function StudyRoomsSection() {
  const { theme, showToast, activeRoadmap, catalogRoadmaps, continueLearningData } = useDashboard()
  const { user } = useAuth()
  const isLight = theme === 'light'

  // Extract current milestone/lesson context for smart room recommendations
  const currentMilestoneTitle = useMemo(() => {
    return (
      continueLearningData?.milestone_title ||
      continueLearningData?.step_title ||
      continueLearningData?.lessonTitle ||
      activeRoadmap?.current_milestone ||
      activeRoadmap?.milestones?.[0]?.title ||
      activeRoadmap?.roadmap_steps?.[0]?.title ||
      ''
    )
  }, [continueLearningData, activeRoadmap])

  // Data states
  const [rooms, setRooms] = useState([])
  const [recommendedRooms, setRecommendedRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all') // 'all' | 'recommended' | 'my' | 'public' | 'private'
  const [selectedTopic, setSelectedTopic] = useState('All')

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinCodeOpen, setIsJoinCodeOpen] = useState(false)
  const [activeWorkspaceRoom, setActiveWorkspaceRoom] = useState(null)

  // Fetch rooms
  const loadRoomsData = useCallback(async () => {
    try {
      const [allRes, recRes] = await Promise.all([
        getCommunityRoomsApi(),
        getRecommendedRoomsApi({
          active_roadmap: activeRoadmap?.title || '',
          current_milestone: currentMilestoneTitle,
          skills: user?.interests || (activeRoadmap?.tech_stack?.join ? activeRoadmap.tech_stack.join(',') : ''),
          interests: user?.interests || '',
        }),
      ])
      setRooms(Array.isArray(allRes) ? allRes : [])
      setRecommendedRooms(Array.isArray(recRes) ? recRes : [])
    } catch {
      showToast?.('Unable to load rooms. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [activeRoadmap, currentMilestoneTitle, user, showToast])

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const [allRes, recRes] = await Promise.all([
          getCommunityRoomsApi(),
          getRecommendedRoomsApi({
            active_roadmap: activeRoadmap?.title || '',
            current_milestone: currentMilestoneTitle,
            skills: user?.interests || (activeRoadmap?.tech_stack?.join ? activeRoadmap.tech_stack.join(',') : ''),
            interests: user?.interests || '',
          }),
        ])
        if (isMounted) {
          setRooms(Array.isArray(allRes) ? allRes : [])
          setRecommendedRooms(Array.isArray(recRes) ? recRes : [])
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [activeRoadmap, currentMilestoneTitle, user])

  // Handle Join or Enter Room
  const handleRoomAction = async (room) => {
    if (room.is_joined) {
      setActiveWorkspaceRoom(room)
      return
    }

    if (room.is_private) {
      // Private room prompt code
      setIsJoinCodeOpen(true)
      return
    }

    // Public room: join directly
    try {
      const res = await toggleRoomJoinApi(room.id)
      showToast?.(res?.message || `Joined ${room.name}!`)
      // Update local room state
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id
            ? { ...r, is_joined: true, active_learners_count: (r.active_learners_count || 0) + 1 }
            : r
        )
      )
      // Open workspace
      setActiveWorkspaceRoom({ ...room, is_joined: true })
    } catch (err) {
      showToast?.(err?.message || 'Failed to join room.')
    }
  }

  // Handle Create Room
  const handleCreateRoom = async (roomData) => {
    const created = await createRoomApi(roomData)
    showToast?.(`Room "${created.name}" created successfully!`)
    setRooms((prev) => [created, ...prev])
    setActiveWorkspaceRoom(created)
  }

  // Handle Join by Code
  const handleJoinByCode = async (code) => {
    const res = await joinRoomByCodeApi(code)
    showToast?.(res?.message || 'Successfully joined room!')
    loadRoomsData()
    if (res?.room) {
      setActiveWorkspaceRoom(res.room)
    }
  }

  // Filtered rooms
  const displayedRooms = useMemo(() => {
    let pool = rooms

    if (selectedTab === 'recommended') {
      pool = recommendedRooms
    } else if (selectedTab === 'my') {
      pool = rooms.filter((r) => r.is_joined)
    } else if (selectedTab === 'public') {
      pool = rooms.filter((r) => !r.is_private)
    } else if (selectedTab === 'private') {
      pool = rooms.filter((r) => r.is_private)
    }

    if (selectedTopic !== 'All') {
      pool = pool.filter((r) => {
        const top = (r.topic || '').toLowerCase()
        const cat = (r.category || '').toLowerCase()
        const sel = selectedTopic.toLowerCase()
        return top.includes(sel) || cat.includes(sel)
      })
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      pool = pool.filter((r) => {
        const n = (r.name || '').toLowerCase()
        const d = (r.description || '').toLowerCase()
        const t = (r.topic || '').toLowerCase()
        const rm = (r.roadmap_name || '').toLowerCase()
        return n.includes(q) || d.includes(q) || t.includes(q) || rm.includes(q)
      })
    }

    return pool
  }, [rooms, recommendedRooms, selectedTab, selectedTopic, searchQuery])

  return (
    <div className="space-y-8 pb-16">
      {/* ──────────────── TOP HEADER SECTION ──────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-inherit">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#c25e2e]/12 text-[#e87a48] border border-[#c25e2e]/25 mb-2">
            <Users className="h-3.5 w-3.5" />
            <span>Collaborative Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Study Rooms</h1>
          <p className={`text-sm mt-1 max-w-xl ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
            Learn together with people following similar learning paths.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsJoinCodeOpen(true)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e] shadow-xs'
                : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] hover:border-[#c25e2e]'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-[#e87a48]" />
            <span>Join via Code</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {/* ──────────────── SEARCH & FILTER ROW ──────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Live Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms by title, topic, or roadmap..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-hidden transition-all ${
                isLight
                  ? 'border-[#ded4be] bg-[#f0e9dc] text-[#181614] focus:border-[#c25e2e]'
                  : 'border-[#262320] bg-[#141312] text-[#faf6ee] focus:border-[#c25e2e]'
              }`}
            />
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = selectedTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#c25e2e]/15 text-[#e87a48] font-semibold border border-[#c25e2e]/30'
                      : isLight
                      ? 'text-[#6e665d] hover:text-[#181614] hover:bg-black/5'
                      : 'text-[#a8a199] hover:text-[#faf6ee] hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {TOPIC_PILLS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedTopic === topic
                  ? 'bg-[#c25e2e] text-white'
                  : isLight
                  ? 'border border-[#ded4be] bg-[#faf6ee] text-[#7a7268] hover:text-[#181614]'
                  : 'border border-[#262320] bg-[#141312] text-[#a8a199] hover:text-[#faf6ee]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* ──────────────── SMART RECOMMENDED SECTION ──────────────── */}
      {selectedTab === 'all' && recommendedRooms.length > 0 && !searchQuery && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#e87a48]" />
              <h2 className="text-sm font-semibold tracking-tight">Recommended for You</h2>
              {activeRoadmap?.title && (
                <span className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                  • Based on your active roadmap
                </span>
              )}
            </div>

            {currentMilestoneTitle && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border ${
                isLight
                  ? 'border-[#c25e2e]/25 bg-[#c25e2e]/10 text-[#c25e2e]'
                  : 'border-[#c25e2e]/30 bg-[#c25e2e]/12 text-[#e87a48]'
              }`}>
                <span>You are learning:</span>
                <strong className="font-semibold text-inherit">{currentMilestoneTitle}</strong>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {recommendedRooms.slice(0, 2).map((room) => (
              <div
                key={`rec-${room.id}`}
                className={`p-4.5 rounded-2xl border transition-all hover:border-[#c25e2e]/40 flex flex-col justify-between ${
                  isLight
                    ? 'bg-[#f0e9dc] border-[#ded4be]'
                    : 'bg-[#141312] border-[#262320]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#c25e2e]/12 text-[#e87a48] border border-[#c25e2e]/25">
                      <Sparkles className="h-3 w-3" />
                      <span>{room.recommendation_reason || 'Recommended'}</span>
                    </span>

                    <span className="text-[11px] font-medium opacity-60">
                      {room.active_learners_count} learners
                    </span>
                  </div>

                  <h3 className="text-base font-bold tracking-tight mb-1">{room.name}</h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'}`}>
                    {room.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-inherit flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#e87a48]">{room.topic}</span>
                  <button
                    type="button"
                    onClick={() => handleRoomAction(room)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{room.is_joined ? 'Open Room' : 'Join Room'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ──────────────── ROOM CARDS GRID ──────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">
            {selectedTab === 'recommended'
              ? 'Recommended Study Rooms'
              : selectedTab === 'my'
              ? 'My Joined Rooms'
              : selectedTab === 'private'
              ? 'Private Study Rooms'
              : 'All Study Rooms'}{' '}
            <span className="opacity-50">({displayedRooms.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`h-48 rounded-2xl border animate-pulse ${
                  isLight ? 'bg-[#f0e9dc] border-[#ded4be]' : 'bg-[#141312] border-[#262320]'
                }`}
              />
            ))}
          </div>
        ) : displayedRooms.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border p-8 ${
            isLight ? 'bg-[#f0e9dc] border-[#ded4be]' : 'bg-[#141312] border-[#262320]'
          }`}>
            <Users className="h-10 w-10 text-[#c25e2e] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold">No study rooms found</h3>
            <p className={`text-xs max-w-sm mx-auto mt-1 mb-4 ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
              {searchQuery
                ? `No rooms matched "${searchQuery}". Try a different keyword.`
                : 'Create the first study room and invite your peers to learn together!'}
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all cursor-pointer"
            >
              + Create Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedRooms.map((room) => {
              const isSessionActive = room.study_session_active
              return (
                <div
                  key={room.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between hover:border-[#c25e2e]/40 ${
                    isLight
                      ? 'bg-[#f0e9dc] border-[#ded4be]'
                      : 'bg-[#141312] border-[#262320]'
                  }`}
                >
                  <div>
                    {/* Top Status & Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#c25e2e]/12 text-[#e87a48] border border-[#c25e2e]/25">
                          {room.topic}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${
                          room.is_private
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {room.is_private ? <Lock className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                          <span>{room.is_private ? 'Private' : 'Public'}</span>
                        </span>
                      </div>

                      {/* Active Session Indicator */}
                      {isSessionActive && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#e87a48]">
                          <span className="h-2 w-2 rounded-full bg-[#e87a48] animate-pulse" />
                          <span>Studying</span>
                        </div>
                      )}
                    </div>

                    {/* Room Title */}
                    <h3 className="text-base font-bold tracking-tight mb-1 leading-snug line-clamp-1">
                      {room.name}
                    </h3>

                    {/* Roadmap Tag if present */}
                    {room.roadmap_name && (
                      <div className="flex items-center gap-1 text-[11px] text-[#e87a48] mb-2 font-medium">
                        <Compass className="h-3 w-3 shrink-0" />
                        <span className="truncate">{room.roadmap_name}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${
                      isLight ? 'text-[#6e665d]' : 'text-[#a8a199]'
                    }`}>
                      {room.description}
                    </p>
                  </div>

                  {/* Footer Stats & CTA */}
                  <div className="pt-4 mt-4 border-t border-inherit flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs opacity-75">
                      <Users className="h-3.5 w-3.5" />
                      <span>{room.active_learners_count}</span>
                      {room.max_members && (
                        <span className="opacity-50">/ {room.max_members}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRoomAction(room)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        room.is_joined
                          ? 'bg-[#c25e2e]/20 text-[#e87a48] border border-[#c25e2e]/30 hover:bg-[#c25e2e] hover:text-white'
                          : room.is_private
                          ? isLight
                            ? 'border border-[#ded4be] bg-[#faf6ee] text-[#181614] hover:border-[#c25e2e]'
                            : 'border border-[#262320] bg-[#1a1816] text-[#faf6ee] hover:border-[#c25e2e]'
                          : 'bg-[#c25e2e] hover:bg-[#d97b48] text-white shadow-xs'
                      }`}
                    >
                      {room.is_joined ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Enter Room</span>
                        </>
                      ) : room.is_private ? (
                        <>
                          <KeyRound className="h-3.5 w-3.5 text-[#e87a48]" />
                          <span>Enter Code</span>
                        </>
                      ) : (
                        <>
                          <span>Join Room</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ──────────────── MODALS ──────────────── */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
        activeRoadmap={activeRoadmap}
        catalogRoadmaps={catalogRoadmaps}
      />

      <JoinByCodeModal
        isOpen={isJoinCodeOpen}
        onClose={() => setIsJoinCodeOpen(false)}
        onJoin={handleJoinByCode}
      />

      {activeWorkspaceRoom && (
        <StudyRoomWorkspaceModal
          isOpen={Boolean(activeWorkspaceRoom)}
          room={activeWorkspaceRoom}
          user={user}
          activeRoadmap={activeRoadmap}
          continueLearningData={continueLearningData}
          onClose={() => setActiveWorkspaceRoom(null)}
          onRoomUpdated={(upd) => {
            setActiveWorkspaceRoom(upd)
            loadRoomsData()
          }}
        />
      )}
    </div>
  )
}
