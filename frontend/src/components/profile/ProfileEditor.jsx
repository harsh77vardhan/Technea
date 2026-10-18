import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Loader2,
  Camera,
  Check,
  MapPin,
  Globe,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Lock,
  User,
  Share2,
  Sparkles,
} from 'lucide-react'
import { updateMyProfileApi, uploadAvatarApi, getAvatarUrl } from '../../services/api'
import { useAuth } from '../../context/useAuth'

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB

function GithubIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

export default function ProfileEditor({
  isOpen = true,
  onClose,
  initialData,
  onProfileUpdated,
}) {
  const { updateProfile, refreshUser } = useAuth()
  const fileInputRef = useRef(null)
  const blobUrlRef = useRef(null)


  // Active Tab: 'identity' | 'links'
  const [activeTab, setActiveTab] = useState('identity')

  // Developer Identity Form State
  const [fullName, setFullName] = useState(initialData?.full_name || '')
  const [username, setUsername] = useState(initialData?.username || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [visibility, setVisibility] = useState(
    initialData?.profile_visibility || initialData?.visibility || (initialData?.is_private ? 'private' : 'public')
  )

  // Developer Links Form State
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedin_url || '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialData?.portfolio_url || initialData?.website_url || '')

  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatar_url || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [usernameError, setUsernameError] = useState(null)

  // Storing initialData reference to sync state if props change
  const [prevInitialData, setPrevInitialData] = useState(initialData)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData)
    setFullName(initialData?.full_name || '')
    setUsername(initialData?.username || '')
    setBio(initialData?.bio || '')
    setLocation(initialData?.location || '')
    setVisibility(
      initialData?.profile_visibility || initialData?.visibility || (initialData?.is_private ? 'private' : 'public')
    )
    setGithubUrl(initialData?.github_url || '')
    setLinkedinUrl(initialData?.linkedin_url || '')
    setPortfolioUrl(initialData?.portfolio_url || initialData?.website_url || '')
    setAvatarPreview(initialData?.avatar_url || '')
    setSelectedFile(null)
    setAvatarRemoved(false)
    setPreviewError(false)
    setPhotoError(null)
  }

  const handleReset = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setFullName(initialData?.full_name || '')
    setUsername(initialData?.username || '')
    setBio(initialData?.bio || '')
    setLocation(initialData?.location || '')
    setVisibility(
      initialData?.profile_visibility || initialData?.visibility || (initialData?.is_private ? 'private' : 'public')
    )
    setGithubUrl(initialData?.github_url || '')
    setLinkedinUrl(initialData?.linkedin_url || '')
    setPortfolioUrl(initialData?.portfolio_url || initialData?.website_url || '')
    setAvatarPreview(initialData?.avatar_url || '')
    setSelectedFile(null)
    setAvatarRemoved(false)
    setPreviewError(false)
    setPhotoError(null)
    setErrorMessage(null)
    setSuccessMessage(null)
    setUsernameError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [])

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  // Real-time username validation
  const handleUsernameChange = (val) => {
    const clean = val.toLowerCase().replace(/\s+/g, '')
    setUsername(clean)
    if (clean && !USERNAME_REGEX.test(clean)) {
      setUsernameError('3-20 characters: lowercase letters, numbers, and underscores only.')
    } else {
      setUsernameError(null)
    }
  }

  // Handle Avatar selection with instant local preview & validation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp']

    if (!allowedMimes.includes(file.type.toLowerCase()) && !allowedExts.includes(ext)) {
      setPhotoError('Invalid format. Supported formats: JPG, PNG, WebP.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setPhotoError('File too large. Maximum size is 5MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    // Revoke previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }

    setSelectedFile(file)
    setAvatarRemoved(false)
    setPhotoError(null)
    setPreviewError(false)
    setErrorMessage(null)

    const localUrl = URL.createObjectURL(file)
    blobUrlRef.current = localUrl
    setAvatarPreview(localUrl)
  }

  // Handle Avatar removal
  const handleRemoveAvatar = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setSelectedFile(null)
    setAvatarPreview('')
    setAvatarRemoved(true)
    setPreviewError(false)
    setPhotoError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validation checks
    if (!fullName.trim()) {
      setActiveTab('identity')
      setErrorMessage('Full name is required.')
      return
    }

    if (!username.trim() || !USERNAME_REGEX.test(username.trim())) {
      setActiveTab('identity')
      setUsernameError('Valid username required (3-20 chars, lowercase, numbers, underscores).')
      setErrorMessage('Please fix the username validation error.')
      return
    }

    setIsSubmitting(true)

    try {
      let finalAvatarUrl = avatarPreview

      // 1. If a new image was selected, upload it first
      if (selectedFile) {
        const uploadRes = await uploadAvatarApi(selectedFile)
        finalAvatarUrl = uploadRes?.avatar_url || finalAvatarUrl
      } else if (avatarRemoved) {
        finalAvatarUrl = null
      }

      // 2. Persist profile changes to backend
      const updatePayload = {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: finalAvatarUrl || null,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
        website_url: portfolioUrl.trim() || null,
        profile_visibility: visibility,
      }

      const updatedProfile = await updateMyProfileApi(updatePayload)

      // 3. Immediately sync AuthContext
      if (updateProfile) {
        try {
          await updateProfile({
            ...updatedProfile,
            avatar_url: updatedProfile?.avatar_url ?? finalAvatarUrl,
          })
        } catch (ctxErr) {
          console.warn('AuthContext sync notification skipped:', ctxErr)
        }
      }

      if (refreshUser) {
        try {
          await refreshUser()
        } catch (rErr) {
          console.warn('refreshUser notification skipped:', rErr)
        }
      }


      // 4. Notify parent component
      if (onProfileUpdated) {
        onProfileUpdated({
          ...updatedProfile,
          avatar_url: updatedProfile?.avatar_url ?? finalAvatarUrl,
          visibility,
        })
      }

      setSuccessMessage('Profile changes saved successfully!')

      // Dismiss dialog after short visual feedback
      setTimeout(() => {
        onClose?.()
      }, 700)
    } catch (err) {
      console.error('Failed to update profile:', err)
      setErrorMessage(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = (fullName || username || 'U').slice(0, 2).toUpperCase()

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-editor-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      >
        {/* Backdrop Fade Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !isSubmitting && onClose?.()}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window: Premium Black Glassmorphic Aesthetic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        >
          {/* Futuristic Ambient Glow Accents */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-white/[0.06] px-6 py-4 bg-white/[0.01]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/70" />
                <h2
                  id="profile-editor-title"
                  className="text-sm font-bold font-mono text-[#EDEDED] tracking-wide"
                >
                  Edit Developer Profile
                </h2>
              </div>
              <p className="text-xs text-[#8A8F98] font-mono">
                Customize your engineering persona, avatar, and community presence.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => !isSubmitting && onClose?.()}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.05] transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Tab Navigation with Animated Indicator */}
          <div className="relative border-b border-white/[0.06] px-6 pt-3 bg-white/[0.01]">
            <nav className="flex items-center gap-2" aria-label="Editor Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('identity')}
                className={`relative flex items-center gap-2 pb-3 px-2 text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === 'identity'
                    ? 'text-[#EDEDED]'
                    : 'text-[#8A8F98] hover:text-[#EDEDED]'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Developer Identity</span>
                {usernameError && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
                {activeTab === 'identity' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('links')}
                className={`relative flex items-center gap-2 pb-3 px-2 text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === 'links'
                    ? 'text-[#EDEDED]'
                    : 'text-[#8A8F98] hover:text-[#EDEDED]'
                }`}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Developer Links</span>
                {activeTab === 'links' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Feedback Banners (Error & Success) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-red-500/20 bg-red-950/20 px-6 py-2.5 text-xs font-mono text-red-400 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-b border-emerald-500/20 bg-emerald-950/20 px-6 py-2.5 text-xs font-mono text-emerald-400 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'identity' ? (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* 1. Profile Photo Subsection */}
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 backdrop-blur-md">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      {/* Prominent circular avatar with glowing border */}
                      <div className="relative group shrink-0 self-center sm:self-auto">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.08),0_0_40px_rgba(59,130,246,0.12)] ring-4 ring-[#0A0A0A] bg-[#141414] overflow-hidden flex items-center justify-center">
                          {avatarPreview && !previewError ? (
                            <img
                              src={getAvatarUrl(avatarPreview)}
                              alt={fullName || 'Avatar'}
                              onError={() => setPreviewError(true)}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-mono font-bold text-xl sm:text-2xl text-[#EDEDED] select-none">
                              {initials}
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-[2px]"
                            title="Change photo"
                          >
                            <Camera className="h-5 w-5 mb-0.5" />
                            <span className="text-[10px] font-mono font-medium">Change</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo details & action buttons */}
                      <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                        <div>
                          <h3 className="text-xs font-bold font-mono text-[#EDEDED]">
                            Profile Photo
                          </h3>
                          <p className="text-[11px] text-[#8A8F98] font-mono mt-0.5 leading-relaxed">
                            Upload JPG, PNG, or WebP up to 5MB. Circular preview updates instantly before saving.
                          </p>
                        </div>

                        {/* Real-time photo validation error */}
                        {photoError && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>{photoError}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                          />

                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-mono font-medium text-[#EDEDED] hover:bg-white/[0.09] hover:border-white/20 transition-all cursor-pointer shadow-xs"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{avatarPreview ? 'Change Photo' : 'Upload Image'}</span>
                          </motion.button>

                          {avatarPreview && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.96 }}
                              onClick={handleRemoveAvatar}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs font-mono text-red-400 hover:bg-red-950/40 hover:border-red-500/30 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove Photo</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Developer Identity Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium text-[#8A8F98] block">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Satoshi Nakamoto"
                        required
                        className="w-full rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                      />
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium text-[#8A8F98] block">
                        Username <span className="text-red-400">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-mono text-[#8A8F98] pointer-events-none">
                          @
                        </span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          placeholder="developer_handle"
                          required
                          className={`w-full rounded-xl border pl-8 pr-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:outline-none transition-all ${
                            usernameError
                              ? 'border-red-500/50 bg-red-950/15 focus:ring-1 focus:ring-red-500/40'
                              : 'border-white/[0.08] bg-black/60 focus:border-white/30 focus:ring-1 focus:ring-white/20'
                          }`}
                        />
                      </div>
                      {usernameError && (
                        <p className="text-[11px] text-red-400 font-mono mt-0.5">
                          {usernameError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio with Live Character Counter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-medium text-[#8A8F98]">
                        Bio
                      </label>
                      <span
                        className={`text-[11px] font-mono ${
                          bio.length >= 480 ? 'text-amber-400 font-bold' : 'text-[#8A8F98]'
                        }`}
                      >
                        {bio.length} / 500
                      </span>
                    </div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 500))}
                      rows={3}
                      maxLength={500}
                      placeholder="e.g. Distributed systems engineer building open-source developer tooling and AI infrastructure."
                      className="w-full rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Location with MapPin Icon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#8A8F98] block">
                      Location
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3.5 h-3.5 w-3.5 text-[#8A8F98] pointer-events-none" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. San Francisco, CA / Bengaluru / Remote"
                        className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-9 pr-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Profile Visibility Selector */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-mono font-medium text-[#8A8F98] flex items-center justify-between">
                      <span>Profile Visibility</span>
                      <span className="text-[10px] text-[#8A8F98] uppercase font-mono">
                        {visibility === 'public' ? 'Public Community' : 'Private Access'}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          visibility === 'public'
                            ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] opacity-70'
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg ${
                            visibility === 'public'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/[0.05] text-[#8A8F98]'
                          }`}
                        >
                          <Globe className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#EDEDED] block">
                            Public
                          </span>
                          <span className="text-[11px] text-[#8A8F98] block leading-snug">
                            Visible to entire developer community
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('private')}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          visibility === 'private'
                            ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] opacity-70'
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg ${
                            visibility === 'private'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-white/[0.05] text-[#8A8F98]'
                          }`}
                        >
                          <Lock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#EDEDED] block">
                            Private
                          </span>
                          <span className="text-[11px] text-[#8A8F98] block leading-snug">
                            Only visible to you
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="links"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="space-y-5"
                >
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs font-mono text-[#8A8F98] leading-relaxed">
                    Connect your public developer repositories, professional profiles, and portfolio website.
                  </div>

                  {/* GitHub URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#8A8F98] flex items-center gap-1.5">
                      <GithubIcon className="h-3.5 w-3.5 text-[#EDEDED]" />
                      <span>GitHub Profile URL</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A8F98]">
                        <GithubIcon className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-10 pr-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#8A8F98] flex items-center gap-1.5">
                      <LinkedinIcon className="h-3.5 w-3.5 text-[#0A66C2]" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A8F98]">
                        <LinkedinIcon className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-10 pr-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Portfolio Website URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#8A8F98] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Portfolio / Website URL</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8A8F98]">
                        <Globe className="h-4 w-4" />
                      </div>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="w-full rounded-xl border border-white/[0.08] bg-black/60 pl-10 pr-3.5 py-2.5 text-xs font-mono text-[#EDEDED] placeholder-[#8A8F98]/50 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
              {/* Reset to Initial Values Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </motion.button>

              <div className="flex items-center gap-2.5 ml-auto">
                {/* Cancel Button */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => !isSubmitting && onClose?.()}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-mono text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </motion.button>

                {/* Save Changes Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: isSubmitting || Boolean(usernameError) ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting || Boolean(usernameError) ? 1 : 0.98 }}
                  disabled={isSubmitting || Boolean(usernameError)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#EDEDED] px-5 py-2 text-xs font-mono font-bold text-[#0A0A0A] hover:bg-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.15)] active:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A0A0A]" />
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#0A0A0A]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
