export default function PathDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#08090d] text-white selection:bg-white selection:text-black">
      {/* ── HERO SKELETON ─────────────────────────────────────────────────── */}
      <div className="pt-8 pb-14 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          {/* Back button skeleton */}
          <div className="h-7 w-36 bg-white/10 rounded-xl" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* Chips row */}
              <div className="flex flex-wrap gap-2.5">
                <div className="h-6 w-32 bg-white/10 rounded-full" />
                <div className="h-6 w-24 bg-white/10 rounded-full" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-36 bg-white/10 rounded-full" />
              </div>

              {/* Title & description */}
              <div className="space-y-3">
                <div className="h-12 w-3/4 bg-white/10 rounded-2xl" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-2/3 bg-white/5 rounded" />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <div className="h-11 w-44 bg-white/10 rounded-xl" />
                <div className="h-11 w-36 bg-white/5 rounded-xl" />
              </div>
            </div>

            {/* Emblem box */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="h-64 w-72 rounded-3xl bg-white/[0.03] border border-white/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT BODY SKELETON ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main timeline skeleton */}
          <div className="lg:col-span-8 space-y-6 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3"
                >
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-white/10 rounded" />
                    <div className="h-4 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-white/10 rounded" />
                  <div className="h-3 w-4/5 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar card skeleton */}
          <div className="lg:col-span-4 space-y-4 animate-pulse">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
              <div className="h-4 w-32 bg-white/10 rounded" />
              <div className="h-24 w-full bg-white/5 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-full bg-white/5 rounded" />
              </div>
              <div className="h-11 w-full bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
