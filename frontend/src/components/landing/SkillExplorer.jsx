import { lazy, Suspense } from 'react'

const SkillExplorerModal = lazy(() => import('../explorer/SkillExplorerModal'))

export default function SkillExplorer({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <Suspense
      fallback={
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Loading explorer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        >
          <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0c10]/95 px-8 py-6 shadow-2xl backdrop-blur-xl">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
              <div className="h-10 w-10 rounded-full border-2 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
            </div>
            <span className="text-xs font-medium text-neutral-400 tracking-wider">Opening Skill Explorer...</span>
          </div>
        </div>
      }
    >
      <SkillExplorerModal isOpen={isOpen} onClose={onClose} />
    </Suspense>
  )
}

