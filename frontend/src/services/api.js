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
 * Fetch all available skills
 * @returns {Promise<Array>} List of skill objects
 */
export async function getSkills() {
  return request('/skills')
}

/**
 * Fetch a single skill by ID
 * @param {number|string} id - Skill identifier
 * @returns {Promise<Object>}
 */
export async function getSkillById(id) {
  return request(`/skills/${id}`)
}

/**
 * Fetch all curated learning paths with their roadmap steps
 * @returns {Promise<Array>} List of learning path objects
 */
export async function getLearningPaths() {
  return request('/learning-paths')
}

/**
 * Fetch a single learning path with its ordered roadmap steps
 * @param {number|string} id - Learning path identifier
 * @returns {Promise<Object>}
 */
export async function getLearningPathById(id) {
  return request(`/learning-paths/${id}`)
}

/**
 * Fetch courses, optionally filtered by associated skill ID
 * @param {Object} [params]
 * @param {number|string} [params.skill_id] - Optional skill filter
 * @returns {Promise<Array>} List of course objects
 */
export async function getCourses(params = {}) {
  const query = new URLSearchParams()
  if (params?.skill_id) {
    query.append('skill_id', params.skill_id)
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
  return request(`/courses/${id}`)
}

export default {
  getSkills,
  getSkillById,
  getLearningPaths,
  getLearningPathById,
  getCourses,
  getCourseById,
}
