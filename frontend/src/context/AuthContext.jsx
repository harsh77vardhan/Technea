import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContextDef'
import {
  getAuthToken,
  setAuthToken,
  getCurrentUserApi,
  loginApi,
  signupApi,
  logoutApi,
  updateProfileApi,
  syncGuestProgressApi,
  getGoogleAuthUrlApi,
  resendVerificationApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(() => getAuthToken())
  const [isLoading, setIsLoading] = useState(true)

  // Global Auth & Dashboard modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login') // 'login' | 'signup'
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [isRoadmapBuilderOpen, setIsRoadmapBuilderOpen] = useState(false)
  const [roadmapBuilderInitialGoal, setRoadmapBuilderInitialGoal] = useState('')

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

  const openDashboard = useCallback(() => {
    setIsDashboardOpen(true)
  }, [])

  const closeDashboard = useCallback(() => {
    setIsDashboardOpen(false)
  }, [])

  const openRoadmapBuilder = useCallback((initialGoal = '') => {
    setRoadmapBuilderInitialGoal(initialGoal)
    setIsRoadmapBuilderOpen(true)
  }, [])

  const closeRoadmapBuilder = useCallback(() => {
    setIsRoadmapBuilderOpen(false)
  }, [])

  /**
   * Helper to scan browser localStorage for guest milestones & lessons and sync to DB
   */
  const syncLocalGuestProgress = useCallback(async () => {
    try {
      const path_progress = {}
      const course_progress = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('technea_completed_steps_')) {
          const pathId = key.replace('technea_completed_steps_', '')
          if (pathId && !isNaN(Number(pathId))) {
            const raw = localStorage.getItem(key)
            if (raw) {
              const ids = JSON.parse(raw)
              if (Array.isArray(ids) && ids.length > 0) {
                path_progress[pathId] = ids
              }
            }
          }
        } else if (key && key.startsWith('technea_completed_lessons_')) {
          const courseId = key.replace('technea_completed_lessons_', '')
          if (courseId && !isNaN(Number(courseId))) {
            const raw = localStorage.getItem(key)
            if (raw) {
              const ids = JSON.parse(raw)
              if (Array.isArray(ids) && ids.length > 0) {
                course_progress[courseId] = ids
              }
            }
          }
        }
      }

      if (Object.keys(path_progress).length > 0 || Object.keys(course_progress).length > 0) {
        await syncGuestProgressApi({ path_progress, course_progress })
      }
    } catch (e) {
      console.warn('Could not sync guest progress with server:', e)
    }
  }, [])

  // Initial authentication rehydration on mount
  useEffect(() => {
    let isMounted = true

    const rehydrateSession = async () => {
      const storedToken = getAuthToken()
      if (!storedToken) {
        if (isMounted) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const userData = await getCurrentUserApi()
        if (isMounted && userData) {
          setUser(userData)
          setTokenState(storedToken)
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing token:', err.message)
        setAuthToken(null)
        if (isMounted) {
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    rehydrateSession()

    return () => {
      isMounted = false
    }
  }, [])

  // Login handler
  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password })
    if (res?.access_token) {
      setAuthToken(res.access_token)
      setTokenState(res.access_token)
      setUser(res.user)
      closeAuthModal()

      // Automatically migrate guest progress in background
      syncLocalGuestProgress()
      return res.user
    }
    throw new Error('Login failed: No access token received.')
  }, [closeAuthModal, syncLocalGuestProgress])

  // Signup handler
  const signup = useCallback(async (email, password, fullName) => {
    const res = await signupApi({
      email,
      password,
      full_name: fullName || undefined,
    })
    if (res?.access_token) {
      setAuthToken(res.access_token)
      setTokenState(res.access_token)
      setUser(res.user)
      closeAuthModal()

      // Automatically migrate guest progress in background
      syncLocalGuestProgress()
      return res.user
    }
    throw new Error('Signup failed: No access token received.')
  }, [closeAuthModal, syncLocalGuestProgress])

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await logoutApi()
    } catch {
      // ignore
    } finally {
      setAuthToken(null)
      setTokenState(null)
      setUser(null)
      closeDashboard()
    }
  }, [closeDashboard])

  // Refresh current user data from server
  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUserApi()
      if (userData) {
        setUser(userData)
        return userData
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err)
    }
    return null
  }, [])

  // Update profile
  const updateProfile = useCallback(async (data) => {
    if (data && typeof data === 'object' && !data.password) {
      setUser((prev) => (prev ? { ...prev, ...data } : data))
      try {
        const freshUser = await getCurrentUserApi()
        if (freshUser) {
          setUser(freshUser)
          return freshUser
        }
      } catch {
        // keep optimistic state
      }
      return data
    }
    const updated = await updateProfileApi(data)
    if (updated) {
      setUser((prev) => (prev ? { ...prev, ...updated } : updated))
      return updated
    }
    throw new Error('Profile update failed')
  }, [])

  // Initiate Google OAuth — redirects browser to Google
  const loginWithGoogle = useCallback(async () => {
    try {
      const data = await getGoogleAuthUrlApi()
      if (data?.auth_url) {
        window.location.href = data.auth_url
      }
    } catch (err) {
      console.error('Google OAuth init failed:', err)
      throw err
    }
  }, [])

  const sendVerificationEmail = useCallback(async () => {
    return resendVerificationApi()
  }, [])

  const forgotPassword = useCallback(async (email) => {
    return forgotPasswordApi(email)
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    return resetPasswordApi(token, newPassword)
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    signup,
    logout,
    loginWithGoogle,
    sendVerificationEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshUser,
    syncLocalGuestProgress,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    isDashboardOpen,
    openDashboard,
    closeDashboard,
    isRoadmapBuilderOpen,
    roadmapBuilderInitialGoal,
    openRoadmapBuilder,
    closeRoadmapBuilder,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
