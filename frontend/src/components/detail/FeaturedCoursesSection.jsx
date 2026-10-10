import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Clock,
  Star,
  Users,
  Bookmark,
  Check,
  RotateCcw,
  AlertCircle,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { getCourseRationale } from '../../utils/trackThemes'

export default function FeaturedCoursesSection({
  courses = [],
  loading = false,
  error = null,
  onRetry = () => {},
  onStartCourse = () => {},
  enrolledCourseId = null,
  theme,
}) {
  const [savedCourseIds, setSavedCourseIds] = useState(() => {
    try {
      const saved = localStorage.getItem('technea_saved_courses')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleBookmark = useCallback((courseId) => {
    setSavedCourseIds((prev) => {
      const next = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
      try {
        localStorage.setItem('technea_saved_courses', JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return (
    <section id="featured-courses" className="space-y-6 pt-10 border-t border-white/[0.08]">
      {/* ── SECTION HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: theme.accentHue }}
            />
            <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-300 font-semibold">
              Curated Video Masterclasses
            </h2>
          </div>
          <p className="mt-1 text-xs text-neutral-400 font-light">
            Verified interactive courses and tutorials vetted by Technea for this track.
          </p>
        </div>

        {!loading && !error && courses.length > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-neutral-300">
            <span className="font-semibold text-white">{courses.length}</span>
            <span>interactive classes</span>
          </div>
        )}
      </div>

      {/* ── LOADING SKELETON ──────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4"
            >
              <div className="aspect-video w-full rounded-xl bg-white/5" />
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-2/3 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR STATE ───────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center space-y-3 backdrop-blur-md">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10 text-red-400 mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-white">Error Loading Courses</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">{error}</p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Courses</span>
            </button>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────────────── */}
      {!loading && !error && courses.length === 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center space-y-3 backdrop-blur-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/[0.04] text-neutral-400 mx-auto mb-1">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Courses Available</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto font-light">
            New video lessons and interactive labs are constantly being added.
          </p>
        </div>
      )}

      {/* ── GRID LAYOUT FOR COURSE CARDS ──────────────────────────────────── */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const isEnrolled = enrolledCourseId === course.id
            const isBookmarked = savedCourseIds.includes(course.id)

            const thumbnail =
              course.thumbnail_url ||
              (course.youtube_video_id
                ? `https://img.youtube.com/vi/${course.youtube_video_id}/hqdefault.jpg`
                : null)

            const rating = (4.8 + ((course.id * 7) % 3) * 0.1).toFixed(1)
            const studentsCount = `${12 + (course.id % 15)}.${(course.id % 9) + 1}k`
            const instructorName = course.instructor || 'Technea Faculty'
            const instructorInitial = instructorName.charAt(0)
            const rationale = getCourseRationale(course)

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl"
              >
                <div className="p-5 space-y-4">
                  {/* ── 16:9 THUMBNAIL WITH FLOATING OVERLAYS ──────────────── */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner group/thumb">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                        <Play className="h-8 w-8 text-neutral-600" />
                      </div>
                    )}

                    {/* Dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Top overlay badges: Platform pill & Bookmark */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="rounded-md border border-white/20 bg-black/70 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] text-white font-medium">
                        {course.platform || 'YouTube'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleBookmark(course.id)
                        }}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
                        className={`rounded-md p-1.5 backdrop-blur-md border transition-all cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-black/60 border-white/15 text-neutral-300 hover:text-white hover:bg-black/80'
                        }`}
                      >
                        <Bookmark
                          className={`h-3 w-3 ${isBookmarked ? 'fill-amber-400' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Centered Play Button Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-black ml-0.5" />
                      </div>
                    </div>

                    {/* Bottom overlay: Rating & Duration */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono text-neutral-300">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="h-3 w-3 fill-amber-400" />
                        <span>{rating}</span>
                      </div>

                      {course.duration && (
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-neutral-300">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{course.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── COURSE TITLE & INSTRUCTOR AVATAR ──────────────────── */}
                  <div className="space-y-2.5">
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-neutral-100 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Instructor profile */}
                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-neutral-200">
                          {instructorInitial}
                        </div>
                        <span className="truncate font-medium text-neutral-300">
                          {instructorName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-500 shrink-0">
                        <Users className="h-3 w-3" />
                        <span>{studentsCount}</span>
                      </div>
                    </div>

                    {/* AI-CURATED RATIONALE CALLOUT: "Why this course" */}
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-semibold flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Why this course:
                      </span>
                      <p className="text-[11px] text-neutral-300 font-light leading-relaxed line-clamp-2">
                        {rationale}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── CARD FOOTER CTA ───────────────────────────────────────── */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                      Official Embed
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => onStartCourse(course)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer shadow-md ${
                        isEnrolled
                          ? 'bg-emerald-400 text-black'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Playing Now</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          <span>Start Course</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
