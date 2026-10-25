/**
 * Resolves an avatar URL into a valid accessible URL.
 * Handles:
 * - blob: URLs (used for instant local client-side previews)
 * - data: URLs (base64 image strings)
 * - Full http:// or https:// URLs
 * - Relative paths (/uploads/avatars/... or /static/avatars/...)
 *
 * @param {string|null|undefined} avatarUrl
 * @returns {string|null}
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null
  const trimmed = avatarUrl.trim()
  if (!trimmed) return null

  // Local object URL preview or data URI
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  // Fully qualified URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Relative backend path - prepend backend origin
  const backendBase = (
    import.meta.env?.VITE_BACKEND_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000'
  ).replace(/\/api\/v1\/?$/, '')

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${backendBase}${cleanPath}`
}

/**
 * Extracts 1-2 uppercase initials from a name string, username, email, or user object.
 *
 * @param {string|object|null|undefined} input
 * @param {string} [fallback='U']
 * @returns {string}
 */
export function getInitials(input, fallback = 'U') {
  if (!input) return fallback

  let rawString
  if (typeof input === 'object') {
    rawString =
      input.full_name ||
      input.username ||
      input.email?.split('@')[0] ||
      fallback
  } else if (typeof input === 'string') {
    rawString = input.trim()
  } else {
    return fallback
  }

  if (!rawString) return fallback

  // Strip leading @ or prefixes
  const clean = rawString.replace(/^@+/, '').trim()
  if (!clean) return fallback

  const parts = clean.split(/[\s_\-.]+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return clean.slice(0, 2).toUpperCase()
}

/**
 * Generates a deterministic modern color gradient for avatar initials based on seed text.
 *
 * @param {string} [seed='']
 * @returns {string} Tailwind gradient class
 */
export function getAvatarGradient(seed = '') {
  const GRADIENTS = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-amber-600 to-orange-600',
    'from-cyan-600 to-blue-600',
    'from-rose-600 to-red-600',
    'from-violet-600 to-purple-700',
    'from-teal-600 to-cyan-700',
  ]

  if (!seed || typeof seed !== 'string') return GRADIENTS[0]

  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }

  const index = Math.abs(hash) % GRADIENTS.length
  return GRADIENTS[index]
}
