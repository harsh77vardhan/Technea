import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, KeyRound, ArrowRight } from 'lucide-react'
import { useDashboard } from '../../context/useDashboard'

export default function JoinByCodeModal({ isOpen, onClose, onJoin }) {
  const { theme } = useDashboard()
  const isLight = theme === 'light'

  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Please enter a room invite code or link.')
      return
    }
    setError('')
    setIsSubmitting(true)

    try {
      await onJoin(code.trim())
      onClose()
    } catch (err) {
      setError(err?.message || 'Invalid code or room not found.')
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
          className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-colors duration-200 z-10 ${
            isLight
              ? 'bg-[#f0e9dc] border-[#ded4be] text-[#181614]'
              : 'bg-[#141312] border-[#262320] text-[#faf6ee]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-5 border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#c25e2e]/15 border border-[#c25e2e]/30 flex items-center justify-center text-[#e87a48]">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight">Join with Code or Link</h3>
                <p className={`text-xs ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                  Enter private room invite code or URL
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
            <div>
              <label className="block text-xs font-medium mb-1.5 opacity-90">
                Invite Code / Link
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. TECH-PYTH or https://.../rooms/TECH-8492"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono tracking-wide outline-hidden transition-all uppercase placeholder:normal-case placeholder:font-sans ${
                  isLight
                    ? 'border-[#ded4be] bg-[#faf6ee] text-[#181614] focus:border-[#c25e2e]'
                    : 'border-[#262320] bg-[#1a1816] text-[#faf6ee] focus:border-[#c25e2e]'
                }`}
              />
              <p className={`text-[11px] mt-1.5 ${isLight ? 'text-[#7a7268]' : 'text-[#a8a199]'}`}>
                Invite codes are provided by the room creator or shared by peers.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
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
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#c25e2e] hover:bg-[#d97b48] text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{isSubmitting ? 'Joining...' : 'Join Room'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
