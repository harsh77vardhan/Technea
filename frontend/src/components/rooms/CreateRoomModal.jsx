import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Lock, Globe } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

const POPULAR_TOPICS = [
  'Python',
  'React & Frontend',
  'AI & Machine Learning',
  'Backend Architecture',
  'DevOps & Cloud',
  'Data Structures & Algorithms',
  'Full Stack Development',
]

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  activeRoadmap,
  catalogRoadmaps = [],
}) {
  const { theme } = useDashboard()
  const isLight = theme === 'light'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [topic, setTopic] = useState('Python')
  const [roadmapName, setRoadmapName] = useState(activeRoadmap?.title || '')
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxMembers, setMaxMembers] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a room name.')
      return
    }
    setError('')
    setIsSubmitting(true)

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        topic: topic.trim(),
        roadmap_name: roadmapName ? roadmapName.trim() : null,
        is_private: isPrivate,
        max_members: Number(maxMembers),
        category: topic.split('&')[0].trim(),
        icon: isPrivate ? 'lock' : 'users',
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to create room. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-colors duration-200 z-10 ${
            isLight
              ? 'bg-[#f0e9dc] border-[#ded4be] text-[#181614]'
              : 'bg-[#141312] border-[#262320] text-[#faf6ee]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-5 border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#c25e2e]/15 border border-[#c25e2e]/30 flex items-center justify-center text-[#e87a48]">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Create Study Room</h3>
                <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                  Host a dedicated workspace for collaborative learning
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'hover:bg-black/5 text-[#7a7268]' : 'hover:bg-white/5 text-[#a8a199]'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Room Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5 opacity-90">
                Room Name <span className="text-[#e87a48]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Python Async & Microservices Guild"
                maxLength={80}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden transition-all ${
                  isLight
                    ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                    : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] focus:border-[#c25e2e]'
                }`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1.5 opacity-90">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this study room about? What are members learning together?"
                rows={2}
                maxLength={300}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden transition-all resize-none ${
                  isLight
                    ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                    : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] focus:border-[#c25e2e]'
                }`}
              />
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-xs font-medium mb-1.5 opacity-90">Learning Topic</label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TOPICS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      topic === t
                        ? 'bg-[#c25e2e]/20 text-[#e87a48] border border-[#c25e2e]/40'
                        : isLight
                        ? 'border border-[#ded4be] bg-[#faf6ee] text-[#7a7268] hover:text-[#181614]'
                        : 'border border-[#262320] bg-[#1a1816] text-[#a8a199] hover:text-[#faf6ee]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Related Roadmap */}
            <div>
              <label className="block text-xs font-medium mb-1.5 opacity-90">Related Roadmap (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  list="roadmap-options"
                  value={roadmapName}
                  onChange={(e) => setRoadmapName(e.target.value)}
                  placeholder="e.g. Python Developer Roadmap"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-hidden transition-all ${
                    isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                      : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] focus:border-[#c25e2e]'
                  }`}
                />
                <datalist id="roadmap-options">
                  {catalogRoadmaps.map((rm) => (
                    <option key={rm.id || rm.title} value={rm.title} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Privacy: Public vs Private */}
            <div className="pt-1">
              <label className="block text-xs font-medium mb-2 opacity-90">Room Privacy</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    !isPrivate
                      ? 'border-[#c25e2e]/50 bg-[#c25e2e]/10 text-[#e87a48]'
                      : isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268]'
                      : 'border-[#262320] bg-[#1a1816] text-[#a8a199]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold">Public Room</span>
                  </div>
                  <span className="text-[11px] opacity-75">Anyone can discover and join.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isPrivate
                      ? 'border-[#c25e2e]/50 bg-[#c25e2e]/10 text-[#e87a48]'
                      : isLight
                      ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268]'
                      : 'border-[#262320] bg-[#1a1816] text-[#a8a199]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold">Private Room</span>
                  </div>
                  <span className="text-[11px] opacity-75">Join via invite code or link only.</span>
                </button>
              </div>
            </div>

            {/* Maximum Members */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium opacity-90">Max Capacity</span>
                <span className="font-mono text-[#e87a48]">{maxMembers} members</span>
              </div>
              <div className="flex items-center gap-2">
                {[15, 25, 50, 100, 250].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setMaxMembers(num)}
                    className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      maxMembers === num
                        ? 'border-[#c25e2e]/40 bg-[#c25e2e]/20 text-[#e87a48]'
                        : isLight
                        ? 'border-[#ded4be] bg-[#faf6ee] text-[#7a7268]'
                        : 'border-[#262320] bg-[#1a1816] text-[#a8a199]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-black/5 text-[#7a7268]' : 'hover:bg-white/5 text-[#a8a199]'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Creating Room...' : 'Create Room'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
