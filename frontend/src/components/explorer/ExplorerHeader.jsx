import { X } from 'lucide-react'

export default function ExplorerHeader({ onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 pt-6 pb-5 sm:px-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
          Build Your Roadmap
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed">
          Search any technology, skill or career path and we&apos;ll build a clear learning roadmap.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>
    </div>
  )
}
