/**
 * API Service Client for Technea Backend
 * Communicates with FastAPI backend endpoints at /api/v1
 */

/**
 * Resolves the FastAPI base URL dynamically:
 * - Checks VITE_API_URL, VITE_BACKEND_URL, and VITE_API_BASE_URL from environment variables
 * - Normalizes input by ensuring the /api/v1 prefix is correctly attached without duplicate slashes
 * - Defaults to http://localhost:8000/api/v1 in local development (dev server or localhost hostname)
 * - Defaults to https://technea-backend.onrender.com/api/v1 in production builds (e.g. Vercel)
 *
 * @returns {string}
 */
export function getApiBaseUrl() {
  const envUrl =
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_BACKEND_URL ||
    import.meta.env?.VITE_API_BASE_URL

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const trimmed = envUrl.trim().replace(/\/+$/, '')
    if (trimmed.endsWith('/api/v1')) {
      return trimmed
    }
    if (trimmed.endsWith('/api')) {
      return `${trimmed}/v1`
    }
    return `${trimmed}/api/v1`
  }

  // Detect local development environment
  const isDev =
    import.meta.env?.DEV ||
    (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '0.0.0.0'))

  if (isDev) {
    return 'http://localhost:8000/api/v1'
  }

  // Production fallback for public beta deployment (Vercel, custom domain)
  return 'https://technea-backend.onrender.com/api/v1'
}

export const API_BASE_URL = getApiBaseUrl()

const AUTH_TOKEN_KEY = 'technea_auth_token'

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY)
    }
  } catch (e) {
    console.warn('Failed to persist auth token:', e)
  }
}

/**
 * Reusable fetch wrapper with error handling and JSON parsing
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g. '/skills')
 * @param {RequestInit} [options] - Fetch configuration options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}`
  const defaultHeaders = {
    Accept: 'application/json',
  }
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const token = getAuthToken()
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status} (${response.statusText})`
      let errorData = null
      try {
        errorData = await response.json()
        if (errorData?.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((d) => (typeof d === 'string' ? d : d.msg || JSON.stringify(d)))
              .join(', ')
          } else if (typeof errorData.detail === 'object') {
            errorMessage = errorData.detail.message || JSON.stringify(errorData.detail)
          }
        } else if (errorData?.message && typeof errorData.message === 'string') {
          errorMessage = errorData.message
        } else if (errorData?.error && typeof errorData.error === 'string') {
          errorMessage = errorData.error
        }
      } catch {
        // Fallback to HTTP status text if response is not JSON
      }

      const error = new Error(errorMessage)
      error.status = response.status
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      }
      error.detail = errorData?.detail
      throw error
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message)
    throw error
  }
}

/**
 * Check if value is a valid positive numeric database ID
 */
function isNumericId(val) {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') return false
  const num = Number(val)
  return Number.isInteger(num) && num > 0
}

/**
 * Fetch all available skills with optional search or category filter
 * @param {Object} [params]
 * @param {string} [params.q] - Optional search query
 * @param {string} [params.category] - Optional domain category filter
 * @param {number} [params.limit=150] - Pagination limit
 * @returns {Promise<Array>} List of skill objects
 */
export async function getSkills(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.append('q', params.q)
  if (params.category) query.append('category', params.category)
  if (params.limit) query.append('limit', String(params.limit))
  else query.append('limit', '150')
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return request(`/skills${queryString}`)
}

/**
 * Fetch a single skill by ID
 * @param {number|string} id - Skill identifier
 * @returns {Promise<Object>}
 */
export async function getSkillById(id) {
  if (!isNumericId(id)) {
    throw new Error(`Invalid skill ID: ${id}`)
  }
  return request(`/skills/${id}`)
}

/**
 * Fetch skill graph relationships (prerequisites, recommended next skills, paths)
 * @param {number|string} id - Skill identifier
 * @returns {Promise<Object>}
 */
export async function getSkillRelationships(id) {
  if (!isNumericId(id)) {
    throw new Error(`Invalid skill ID: ${id}`)
  }
  return request(`/skills/${id}/relationships`)
}

/**
 * Fetch curated learning paths with their roadmap steps, supporting search & filters
 * @param {Object} [params]
 * @param {string} [params.q] - Optional search query with fuzzy and synonym matching
 * Helper to generate URL-friendly slug from title
 * @param {string} text
 * @returns {string}
 */
export function slugifyTitle(text) {
  if (!text || typeof text !== 'string') return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Fetch learning paths with search, category/level filtering, and pagination
 * @param {Object} [params]
 * @param {string} [params.q] - Search query
 * @param {string} [params.category] - Optional domain filter
 * @param {string} [params.level] - Optional difficulty filter
 * @param {boolean} [params.is_featured] - Optional featured filter
 * @param {string} [params.tag] - Optional tag filter
 * @param {number} [params.page] - Optional page number (1-based)
 * @param {number} [params.page_size] - Optional page size
 * @param {number} [params.limit=250] - Pagination limit
 * @param {number} [params.skip=0] - Pagination offset
 * @returns {Promise<Array>} List of learning path objects
 */
export async function getLearningPaths(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.append('q', params.q)
  if (params.category && params.category !== 'All' && params.category !== 'all') query.append('category', params.category)
  if (params.level && params.level !== 'All' && params.level !== 'all') query.append('level', params.level)
  if (params.is_featured !== undefined) query.append('is_featured', String(params.is_featured))
  if (params.tag) query.append('tag', params.tag)
  if (params.duration) query.append('duration', params.duration)
  if (params.goal) query.append('goal', params.goal)
  if (params.style) query.append('style', params.style)
  if (params.language) query.append('language', params.language)

  // Handle pagination (page, page_size, skip, limit)
  if (params.page && params.page_size) {
    const pageNum = Math.max(1, parseInt(params.page, 10) || 1)
    const pageSize = Math.max(1, parseInt(params.page_size, 10) || 20)
    query.append('skip', String((pageNum - 1) * pageSize))
    query.append('limit', String(pageSize))
    query.append('page', String(pageNum))
    query.append('page_size', String(pageSize))
  } else if (params.limit) {
    query.append('limit', String(params.limit))
    if (params.skip) query.append('skip', String(params.skip))
  } else {
    query.append('limit', '250')
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''
  return request(`/learning-paths${queryString}`)
}

/**
 * Fetch featured roadmaps
 * @returns {Promise<Array>} List of featured learning paths
 */
export async function getFeaturedRoadmapsApi() {
  try {
    const res = await request('/learning-paths/featured')
    if (Array.isArray(res) && res.length > 0) return res
  } catch (err) {
    console.warn('Backend /learning-paths/featured fallback:', err.message)
  }
  return getLearningPaths({ limit: 12 })
}

/**
 * Fetch recommended roadmaps
 * @returns {Promise<Array>} List of recommended learning paths
 */
export async function getRecommendedRoadmapsApi() {
  try {
    const res = await request('/learning-paths/recommended')
    if (Array.isArray(res) && res.length > 0) return res
  } catch (err) {
    console.warn('Backend /learning-paths/recommended fallback:', err.message)
  }
  return getLearningPaths({ limit: 8 })
}

/**
 * Fetch roadmap catalog with search and filters, querying /roadmaps/catalog or /learning-paths
 * @param {Object} [params]
 * @returns {Promise<Array>}
 */
export async function getRoadmapCatalogApi(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.append('q', params.q)
  if (params.category && params.category !== 'All' && params.category !== 'all') query.append('category', params.category)
  if (params.level && params.level !== 'All' && params.level !== 'all') query.append('level', params.level)
  if (params.duration) query.append('duration', params.duration)
  if (params.goal) query.append('goal', params.goal)
  if (params.tag) query.append('tag', params.tag)
  if (params.is_featured !== undefined) query.append('is_featured', String(params.is_featured))

  if (params.page && params.page_size) {
    const pageNum = Math.max(1, parseInt(params.page, 10) || 1)
    const pageSize = Math.max(1, parseInt(params.page_size, 10) || 20)
    query.append('skip', String((pageNum - 1) * pageSize))
    query.append('limit', String(pageSize))
  } else if (params.limit) {
    query.append('limit', String(params.limit))
  } else {
    query.append('limit', '250')
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''

  try {
    const res = await request(`/roadmaps/catalog${queryString}`)
    if (Array.isArray(res) && res.length > 0) return res
  } catch (err) {
    console.warn('/roadmaps/catalog fallback to /learning-paths:', err.message)
  }

  return getLearningPaths(params)
}

/**
 * Unified platform search with fuzzy matching and synonym expansion
 * @param {string} [q=''] - Search query term
 * @param {Object} [options]
 * @param {string} [options.category] - Optional category filter
 * @param {string} [options.level] - Optional difficulty level
 * @param {string} [options.duration] - Optional duration filter (e.g. '2 Weeks', '4 Weeks')
 * @param {string} [options.goal] - Optional goal filter (e.g. 'Job', 'Projects')
 * @param {string} [options.style] - Optional style filter (e.g. 'Projects', 'Videos')
 * @param {string} [options.language] - Optional language filter (e.g. 'English', 'Hindi')
 * @param {number} [options.limit=15] - Limit per entity
 * @returns {Promise<Object>} { query, synonyms_expanded, fuzzy_corrections, learning_paths, skills, courses, is_fallback, fallback_message }
 */
export async function searchCatalog(q = '', options = {}) {
  const query = new URLSearchParams()
  if (q && q.trim()) query.append('q', q.trim())
  if (options.category) query.append('category', options.category)
  if (options.level) query.append('level', options.level)
  if (options.duration) query.append('duration', options.duration)
  if (options.goal) query.append('goal', options.goal)
  if (options.style) query.append('style', options.style)
  if (options.language) query.append('language', options.language)
  if (options.limit) query.append('limit', String(options.limit))
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return request(`/search${queryString}`)
}

/**
 * AI Intent understanding and learning progression recommendation
 * @param {string} prompt - Natural language goal or background prompt
 * @returns {Promise<Object>} { intent, recommended_progression, recommended_learning_paths, recommended_courses }
 */
export async function analyzeIntent(prompt) {
  if (!prompt || !prompt.trim()) {
    throw new Error('Prompt query is required')
  }
  const query = new URLSearchParams({ q: prompt.trim() })
  return request(`/search/intent?${query.toString()}`)
}

/**
 * Fetch a single learning path with its ordered roadmap steps by numeric ID or string slug
 * @param {number|string} slugOrId - Learning path identifier (ID or slug)
 * @returns {Promise<Object>} Full learning path object with roadmap_steps
 */
export async function getLearningPathById(slugOrId) {
  if (!slugOrId && slugOrId !== 0) {
    throw new Error('A valid learning path ID or slug is required')
  }

  // 1. If numeric ID (e.g. 10 or "10")
  if (isNumericId(slugOrId)) {
    return request(`/learning-paths/${slugOrId}`)
  }

  // 2. String slug (e.g. "python-fundamentals" or "full-stack-web-development")
  const slugStr = String(slugOrId).trim()
  try {
    const directRes = await request(`/learning-paths/${encodeURIComponent(slugStr)}`)
    if (directRes && (directRes.id || directRes.title)) {
      return directRes
    }
  } catch (err) {
    console.warn(`Direct slug lookup fallback for '${slugStr}':`, err.message)
  }

  // 3. Fallback: Search all learning paths to find matching title or slug
  const allPaths = await getLearningPaths({ limit: 300 })
  const targetNorm = slugStr.toLowerCase().replace(/[^a-z0-9]/g, '')

  const matched = (allPaths || []).find((p) => {
    if (String(p.id) === slugStr) return true
    const pSlug = slugifyTitle(p.title)
    if (pSlug === slugStr.toLowerCase()) return true
    const pNorm = (p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')
    if (pNorm === targetNorm) return true
    return false
  })

  if (matched && isNumericId(matched.id)) {
    return request(`/learning-paths/${matched.id}`)
  }

  if (matched) {
    return matched
  }

  throw new Error(`Learning path with ID or slug '${slugOrId}' not found`)
}

/**
 * Fetch courses, optionally filtered by associated skill ID or learning path ID
 * @param {Object} [params]
 * @param {number|string} [params.skill_id] - Optional skill filter
 * @param {number|string} [params.learning_path_id] - Optional learning path filter
 * @returns {Promise<Array>} List of course objects
 */
export async function getCourses(params = {}) {
  const query = new URLSearchParams()
  if (isNumericId(params?.skill_id)) {
    query.append('skill_id', params.skill_id)
  }
  if (isNumericId(params?.learning_path_id)) {
    query.append('learning_path_id', params.learning_path_id)
  }
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return request(`/courses${queryString}`)
}


/**
 * Fetch a single course by ID
 * @param {number|string} id - Course identifier
 * @returns {Promise<Object>}
 */
export async function getCourseById(id) {
  if (!isNumericId(id)) {
    throw new Error(`Invalid course ID: ${id}`)
  }
  return request(`/courses/${id}`)
}

/**
 * Fetch ordered lessons for a specific course
 * @param {number|string} courseId - Course identifier
 * @returns {Promise<Array>} List of lesson objects
 */
export async function getCourseLessons(courseId) {
  if (!isNumericId(courseId)) {
    return []
  }
  return request(`/courses/${courseId}/lessons`)
}

/**
 * Fetch related courses recommendation
 * @param {number|string} courseId - Course identifier
 * @param {number} [limit=4] - Max courses
 * @returns {Promise<Array>} List of related course objects
 */
export async function getRelatedCourses(courseId, limit = 4) {
  if (!isNumericId(courseId)) {
    return []
  }
  return request(`/courses/${courseId}/related?limit=${limit}`)
}

/* ==========================================================================
   Authentication API Endpoints
   ========================================================================== */

/**
 * Register a new user account
 * @param {Object} data - { email, password, full_name }
 * @returns {Promise<{ access_token: string, token_type: string, user: Object }>}
 */
export async function signupApi(data) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Authenticate existing user with email and password
 * @param {Object} data - { email, password }
 * @returns {Promise<{ access_token: string, token_type: string, user: Object }>}
 */
export async function loginApi(data) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Fetch authenticated user profile
 * @returns {Promise<Object>}
 */
export async function getCurrentUserApi() {
  return request('/auth/me')
}

/**
 * Update user profile
 * @param {Object} data - { full_name, avatar_url, bio, password }
 * @returns {Promise<Object>}
 */
export async function updateProfileApi(data) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Informs the backend of user logout
 * @returns {Promise<Object>}
 */
export async function logoutApi() {
  try {
    return await request('/auth/logout', { method: 'POST' })
  } catch {
    return { message: 'Logged out' }
  }
}

// Google OAuth
export async function getGoogleAuthUrlApi() {
  return request('/auth/google')
}

// Email verification
export async function verifyEmailApi(token) {
  return request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function resendVerificationApi() {
  return request('/auth/resend-verification', { method: 'POST' })
}

// Password reset
export async function forgotPasswordApi(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPasswordApi(token, new_password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
  })
}

// Passwordless OTP Authentication
export async function sendOtpApi(email) {
  return request('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function verifyOtpApi(email, otp) {
  return request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  })
}

/**
 * Check if a username is available
 * @param {string} username
 * @returns {Promise<{ available: boolean, username: string, message?: string }>}
 */
export async function checkUsernameApi(username) {
  const cleanUsername = String(username || '').replace(/^@/, '').trim()
  return request(`/auth/check-username?username=${encodeURIComponent(cleanUsername)}`)
}

/**
 * First-time profile setup onboarding completion
 * @param {Object} payload - { full_name, username, avatar_url, learning_goal, experience_level, primary_focus }
 * @returns {Promise<{ message: string, user: Object }>}
 */
export async function setupProfileApi(payload) {
  return request('/auth/profile-setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* ==========================================================================
   User Progress & Dashboard API Endpoints
   ========================================================================== */

/**
 * Fetch completed roadmap steps for a learning path
 * @param {number|string} pathId
 * @returns {Promise<{ learning_path_id: number, completed_step_ids: Array<number>, total_steps: number, progress_percent: number }>}
 */
export async function getPathProgressApi(pathId) {
  if (!isNumericId(pathId)) return null
  return request(`/progress/learning-paths/${pathId}`)
}

/**
 * Toggle roadmap step milestone completion status
 * @param {Object} data - { path_id: number, step_id: number, is_completed: boolean }
 * @returns {Promise<Object>} Updated path progress
 */
export async function toggleStepProgressApi({ path_id, step_id, is_completed = true }) {
  return request('/progress/steps/toggle', {
    method: 'POST',
    body: JSON.stringify({
      learning_path_id: Number(path_id),
      step_id: Number(step_id),
      is_completed: Boolean(is_completed),
    }),
  })
}

/**
 * Fetch completed lessons for a course
 * @param {number|string} courseId
 * @returns {Promise<{ course_id: number, completed_lesson_ids: Array<number>, total_lessons: number, progress_percent: number }>}
 */
export async function getCourseProgressApi(courseId) {
  if (!isNumericId(courseId)) return null
  return request(`/progress/courses/${courseId}`)
}

/**
 * Toggle video lesson completion status
 * @param {Object} data - { course_id: number, lesson_id: number, is_completed: boolean }
 * @returns {Promise<Object>} Updated course progress
 */
export async function toggleLessonProgressApi({ course_id, lesson_id, is_completed = true }) {
  return request('/progress/lessons/toggle', {
    method: 'POST',
    body: JSON.stringify({
      course_id: Number(course_id),
      lesson_id: Number(lesson_id),
      is_completed: Boolean(is_completed),
    }),
  })
}

/**
 * Sync guest localStorage progress to the user's account
 * @param {Object} payload - { path_progress: Record<string, number[]>, course_progress: Record<string, number[]> }
 * @returns {Promise<Object>}
 */
export async function syncGuestProgressApi(payload) {
  return request('/progress/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Fetch user learning dashboard summary
 * @returns {Promise<Object>} Dashboard analytics
 */
export async function getDashboardSummaryApi() {
  return request('/progress/dashboard')
}

/* ==========================================================================
   AI Career Roadmap Builder Endpoints
   ========================================================================== */

/**
 * Generate a personalized career roadmap from natural language career goal
 * @param {Object} data - { goal: string, experience_level?: string, available_time?: string, preferred_language?: string, current_skills?: string[], target_role?: string, current_level?: string, main_goal?: string, preferred_style?: string }
 * @returns {Promise<Object>} Generated roadmap with phases, milestones, courses, projects
 */
export async function generateRoadmapApi(data) {
  return request('/roadmaps/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Persist generated roadmap to authenticated user profile
 * @param {Object} data - { title, goal, target_role, experience_level, estimated_duration, roadmap_data }
 * @returns {Promise<Object>} Saved roadmap model
 */
export async function saveRoadmapApi(data) {
  return request('/roadmaps/save', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Update an existing saved roadmap (title, target role, milestone hierarchy, or roadmap_data)
 * @param {number|string} roadmapId
 * @param {Object} payload - { title?: string, target_role?: string, roadmap_data?: Object, completed_milestone_ids?: string[] }
 * @returns {Promise<Object>} Updated roadmap model
 */
export async function updateRoadmapApi(roadmapId, payload) {
  return request(`/roadmaps/${roadmapId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/**
 * Fetch all saved roadmaps for the current authenticated user
 * @returns {Promise<Array>} List of saved roadmaps
 */
export async function getMyRoadmapsApi() {
  return request('/roadmaps/my')
}

/**
 * Fetch single saved roadmap by ID
 * @param {number|string} roadmapId
 * @returns {Promise<Object>}
 */
export async function getRoadmapByIdApi(roadmapId) {
  return request(`/roadmaps/${roadmapId}`)
}

/**
 * Toggle milestone completion inside a saved roadmap
 * @param {number|string} roadmapId
 * @param {Object} data - { milestone_id: string, is_completed: boolean }
 * @returns {Promise<Object>} Updated roadmap model with recalculated progress
 */
export async function toggleRoadmapMilestoneApi(roadmapId, data) {
  return request(`/roadmaps/${roadmapId}/progress`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Delete a saved roadmap
 * @param {number|string} roadmapId
 * @returns {Promise<Object>}
 */
export async function deleteRoadmapApi(roadmapId) {
  return request(`/roadmaps/${roadmapId}`, {
    method: 'DELETE',
  })
}

/* ==========================================================================
   Daily Productivity & Learning Profile Endpoints
   ========================================================================== */

/**
 * Fetch daily checklist, streak, and weekly history
 * @param {string} [date] - Optional YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function getDailyActivityApi(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return request(`/progress/daily${query}`)
}

/**
 * Toggle a daily productivity checklist item
 * @param {Object} data - { task_id: string, is_completed: boolean, activity_date?: string }
 * @returns {Promise<Object>} Updated daily activity
 */
export async function toggleDailyTaskApi(data) {
  return request('/progress/daily/toggle', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Fetch contextual AI Learning Buddy mentorship guidance
 * @returns {Promise<Object>}
 */
export async function getAIBuddyApi() {
  return request('/progress/ai-buddy')
}

/**
 * Fetch learner profile and skills mastery breakdown
 * @returns {Promise<Object>}
 */
export async function getUserProfileApi() {
  return request('/progress/profile')
}

/* ==========================================================================
   Hands-on Projects & Recommendations Endpoints
   ========================================================================== */

/**
 * Fetch all available engineering projects
 * @param {Object} [params] - { category?: string, difficulty?: string, skill?: string }
 * @returns {Promise<Array>}
 */
export async function getProjectsApi(params = {}) {
  const query = new URLSearchParams()
  if (params.category) query.append('category', params.category)
  if (params.difficulty) query.append('difficulty', params.difficulty)
  if (params.skill) query.append('skill', params.skill)
  const qs = query.toString() ? `?${query.toString()}` : ''
  return request(`/projects${qs}`)
}

/**
 * Fetch contextually recommended projects for user's active skills & roadmap
 * @returns {Promise<Array>}
 */
export async function getRecommendedProjectsApi() {
  return request('/projects/recommended')
}

/**
 * Fetch user's active and completed projects with github URLs
 * @returns {Promise<Array>}
 */
export async function getMyProjectsApi() {
  return request('/projects/my')
}

/**
 * Fetch details of a single project
 * @param {number|string} projectId
 * @returns {Promise<Object>}
 */
export async function getProjectByIdApi(projectId) {
  return request(`/projects/${projectId}`)
}

/**
 * Update project status (not_started, in_progress, completed) and optional GitHub URL
 * @param {number|string} projectId
 * @param {Object} data - { status: string, github_url?: string }
 * @returns {Promise<Object>}
 */
export async function updateProjectStatusApi(projectId, data) {
  return request(`/projects/${projectId}/status`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/* ==========================================================================
   Learning Community & Peer Rooms Endpoints
   ========================================================================== */

/**
 * Fetch all available peer learning rooms
 * @returns {Promise<Array>}
 */
export async function getCommunityRoomsApi() {
  return request('/community/rooms')
}

/**
 * Toggle membership in a peer learning room
 * @param {number|string} roomId
 * @returns {Promise<Object>}
 */
export async function toggleRoomJoinApi(roomId) {
  return request(`/community/rooms/${roomId}/join`, {
    method: 'POST',
  })
}

/**
 * Fetch list of rooms the user has joined
 * @returns {Promise<Array>}
 */
export async function getMyRoomsApi() {
  return request('/community/rooms/my')
}

/* ==========================================================================
   Context-Aware AI Technical Mentor Endpoints
   ========================================================================== */

/**
 * Send query to centralized AI Mentor chat endpoint
 * @param {Object} data - { message: string, conversation_history?: Array<{ role: string, content: string }> }
 * @returns {Promise<{ response: string, suggestions: string[], related_actions: Array<Object>, provider_used?: string }>}
 */
export async function sendAiChatApi(data) {
  const payload = {
    message: data?.message || '',
    conversation_history: Array.isArray(data?.conversation_history) ? data.conversation_history : [],
  }
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Send query to context-aware AI Technical Mentor (legacy)
 * @param {Object} data - { message: string, context_skill?: string, context_milestone?: string }
 * @returns {Promise<Object>}
 */
export async function sendAiMentorChatApi(data) {
  return request('/progress/ai-mentor/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/* ==========================================================================
   Public Profile Viewer, Profile Editor, and Follow System Endpoints
   ========================================================================== */

/**
 * Fetch public developer portfolio profile by username or ID
 * GET /users/{username} (and fallback /users/profile/{username})
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function getPublicProfileApi(username) {
  const cleanUsername = String(username || '').replace(/^@/, '').trim()
  if (!cleanUsername) {
    throw new Error('Username is required to fetch profile')
  }
  try {
    return await request(`/users/${encodeURIComponent(cleanUsername)}`)
  } catch {
    return await request(`/users/profile/${encodeURIComponent(cleanUsername)}`)
  }
}

/**
 * Update authenticated user's profile details
 * PUT /auth/profile (and fallback /users/me/profile)
 * @param {Object} data - { full_name, username, bio?, location?, avatar_url?, github_url?, linkedin_url?, portfolio_url? }
 * @returns {Promise<Object>}
 */
export async function updateMyProfileApi(data) {
  try {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  } catch {
    return await request('/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

/**
 * Upload profile avatar image
 * POST /auth/avatar (and fallback /users/avatar)
 * @param {File} file
 * @returns {Promise<Object>}
 */
export async function uploadAvatarApi(file) {
  const formData = new FormData()
  formData.append('file', file)
  try {
    return await request('/auth/avatar', {
      method: 'POST',
      body: formData,
    })
  } catch {
    const fallbackFormData = new FormData()
    fallbackFormData.append('file', file)
    return await request('/users/avatar', {
      method: 'POST',
      body: fallbackFormData,
    })
  }
}

/**
 * Fetch authenticated user's profile and learning statistics
 * GET /users/me/stats (and fallback /progress/dashboard)
 * @returns {Promise<Object>}
 */
export async function getUserStatsApi() {
  try {
    return await request('/users/me/stats')
  } catch {
    try {
      return await request('/progress/dashboard')
    } catch {
      return await request('/progress/profile')
    }
  }
}


/**
 * Follow a Technea developer
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function followUserApi(username) {
  return request(`/users/${encodeURIComponent(username)}/follow`, {
    method: 'POST',
  })
}

/**
 * Unfollow a Technea developer
 * @param {string} username
 * @returns {Promise<Object>}
 */
export async function unfollowUserApi(username) {
  return request(`/users/${encodeURIComponent(username)}/unfollow`, {
    method: 'POST',
  })
}

/**
 * Fetch list of followers for a user
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function getUserFollowersApi(username) {
  return request(`/users/${encodeURIComponent(username)}/followers`)
}

/**
 * Fetch list of users followed by a user
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function getUserFollowingApi(username) {
  return request(`/users/${encodeURIComponent(username)}/following`)
}

export default {
  getAuthToken,
  setAuthToken,
  signupApi,
  loginApi,
  getCurrentUserApi,
  updateProfileApi,
  logoutApi,
  getGoogleAuthUrlApi,
  verifyEmailApi,
  resendVerificationApi,
  forgotPasswordApi,
  resetPasswordApi,
  sendOtpApi,
  verifyOtpApi,
  checkUsernameApi,
  setupProfileApi,
  getPathProgressApi,
  toggleStepProgressApi,
  getCourseProgressApi,
  toggleLessonProgressApi,
  syncGuestProgressApi,
  getDashboardSummaryApi,
  generateRoadmapApi,
  saveRoadmapApi,
  getMyRoadmapsApi,
  getRoadmapByIdApi,
  toggleRoadmapMilestoneApi,
  deleteRoadmapApi,
  getDailyActivityApi,
  toggleDailyTaskApi,
  getAIBuddyApi,
  getUserProfileApi,
  getProjectsApi,
  getRecommendedProjectsApi,
  getMyProjectsApi,
  getProjectByIdApi,
  updateProjectStatusApi,
  getCommunityRoomsApi,
  toggleRoomJoinApi,
  getMyRoomsApi,
  sendAiChatApi,
  sendAiMentorChatApi,
  getSkills,
  getSkillById,
  getSkillRelationships,
  getLearningPaths,
  getLearningPathById,
  getFeaturedRoadmapsApi,
  getRecommendedRoadmapsApi,
  getRoadmapCatalogApi,
  slugifyTitle,
  getCourses,
  getCourseById,
  getCourseLessons,
  getRelatedCourses,
  searchCatalog,
  analyzeIntent,
  getPublicProfileApi,
  updateMyProfileApi,
  uploadAvatarApi,
  followUserApi,
  unfollowUserApi,
  getUserFollowersApi,
  getUserFollowingApi,
  getUserStatsApi,
}


export { getAvatarUrl, getBackendBaseUrl } from '../utils/avatar'





