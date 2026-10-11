/**
 * API Service Client for Technea Backend
 * Communicates with FastAPI backend endpoints at /api/v1
 */

const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'

/**
 * Reusable fetch wrapper with error handling and JSON parsing
 * @param {string} endpoint - Path relative to API_BASE_URL (e.g. '/skills')
 * @param {RequestInit} [options] - Fetch configuration options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
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
      try {
        const errorData = await response.json()
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail)
        }
      } catch {
        // Fallback to HTTP status text if response is not JSON
      }
      throw new Error(errorMessage)
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
 * @param {string} [params.category] - Optional domain filter
 * @param {string} [params.level] - Optional difficulty filter
 * @param {number} [params.limit=250] - Pagination limit
 * @returns {Promise<Array>} List of learning path objects
 */
export async function getLearningPaths(params = {}) {
  const query = new URLSearchParams()
  if (params.q) query.append('q', params.q)
  if (params.category) query.append('category', params.category)
  if (params.level) query.append('level', params.level)
  if (params.limit) query.append('limit', String(params.limit))
  else query.append('limit', '250')
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return request(`/learning-paths${queryString}`)
}

/**
 * Unified platform search with fuzzy matching and synonym expansion
 * @param {string} q - Search query term
 * @param {Object} [options]
 * @param {string} [options.category] - Optional category filter
 * @param {string} [options.level] - Optional difficulty level
 * @param {number} [options.limit=15] - Limit per entity
 * @returns {Promise<Object>} { query, synonyms_expanded, fuzzy_corrections, learning_paths, skills, courses }
 */
export async function searchCatalog(q, options = {}) {
  if (!q || !q.trim()) {
    return {
      query: '',
      normalized_query: '',
      synonyms_expanded: [],
      fuzzy_corrections: [],
      learning_paths: [],
      skills: [],
      courses: [],
      total_matches: 0,
    }
  }
  const query = new URLSearchParams()
  query.append('q', q.trim())
  if (options.category) query.append('category', options.category)
  if (options.level) query.append('level', options.level)
  if (options.limit) query.append('limit', String(options.limit))
  return request(`/search?${query.toString()}`)
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
 * Fetch a single learning path with its ordered roadmap steps
 * @param {number|string} id - Learning path identifier
 * @returns {Promise<Object>}
 */
export async function getLearningPathById(id) {
  if (!isNumericId(id)) {
    throw new Error(`Invalid learning path ID: ${id}`)
  }
  return request(`/learning-paths/${id}`)
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

export default {
  getSkills,
  getSkillById,
  getSkillRelationships,
  getLearningPaths,
  getLearningPathById,
  getCourses,
  getCourseById,
  getCourseLessons,
  getRelatedCourses,
  searchCatalog,
  analyzeIntent,
}

