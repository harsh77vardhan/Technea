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
