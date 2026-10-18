import { useState, useRef } from 'react'
import { X, Upload, Loader2, Camera, Check } from 'lucide-react'
import { updateMyProfileApi, uploadAvatarApi, getAvatarUrl } from '../../services/api'
import { useAuth } from '../../context/useAuth'

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/

export default function ProfileEditor({
  isOpen,
  onClose,
  initialData,
  onProfileUpdated,
}) {
  const { updateProfile } = useAuth()
  const fileInputRef = useRef(null)

  const [fullName, setFullName] = useState(initialData?.full_name || '')
  const [username, setUsername] = useState(initialData?.username || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || '')
  const [linkedinUrl, setLinkedinUrl] = useState(initialData?.linkedin_url || '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialData?.portfolio_url || '')

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(initialData?.avatar_url || '')
  const [prevInitialAvatar, setPrevInitialAvatar] = useState(initialData?.avatar_url || '')
  const [previewError, setPreviewError] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  if (initialData?.avatar_url !== prevInitialAvatar) {
    setPrevInitialAvatar(initialData?.avatar_url || '')
    setAvatarPreview(initialData?.avatar_url || '')
    setPreviewError(false)
  }

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [usernameError, setUsernameError] = useState(null)

  if (!isOpen) return null

  const handleUsernameChange = (val) => {
    const clean = val.toLowerCase().replace(/\s+/g, '')
    setUsername(clean)
    if (clean && !USERNAME_REGEX.test(clean)) {
      setUsernameError('3-20 characters: lowercase letters, numbers, and underscores only.')
    } else {
      setUsernameError(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp']

    if (!allowedMimes.includes(file.type.toLowerCase()) && !allowedExts.includes(ext)) {
      setErrorMessage('Invalid file type. Supported formats: JPG, PNG, WebP.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size is 5MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    setSelectedFile(file)
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    setPreviewError(false)
    setErrorMessage(null)
  }

  const handleRemoveAvatar = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setSelectedFile(null)
    setAvatarPreview('')
    setPreviewError(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.')
      return
    }

    if (!username.trim() || !USERNAME_REGEX.test(username.trim())) {
      setUsernameError('Valid username required (3-20 chars, lowercase, numbers, underscores).')
      return
    }

    setIsSubmitting(true)

    try {
      let finalAvatarUrl = avatarPreview

      // 1. If user selected a new file, upload it first
      if (selectedFile) {
        const uploadRes = await uploadAvatarApi(selectedFile)
        finalAvatarUrl = uploadRes.avatar_url
      } else if (!avatarPreview) {
        finalAvatarUrl = null
      }

      // 2. Update profile details
      const updatePayload = {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: finalAvatarUrl || null,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      }

      const updatedProfile = await updateMyProfileApi(updatePayload)

      // Sync AuthContext so Navbar and Dashboard immediately reflect the new avatar
      if (updateProfile) {
        try {
          await updateProfile({
            ...updatedProfile,
            avatar_url: updatedProfile.avatar_url || finalAvatarUrl,
          })
        } catch {
          // ignore context sync fallback
        }
      }

      if (onProfileUpdated) {
        onProfileUpdated({
          ...updatedProfile,
          avatar_url: updatedProfile.avatar_url || finalAvatarUrl,
        })
      }

      onClose()
    } catch (err) {
      console.error('Failed to update profile:', err)
      setErrorMessage(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const initials = (fullName || username || 'U').slice(0, 2).toUpperCase()

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-[10px] border border-[#262626] bg-[#0D0D0D] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1C] px-6 py-4 bg-[#090909]">
          <div>
            <h3 className="text-sm font-bold text-[#EDEDED] font-mono">
              Edit Developer Profile
            </h3>
            <p className="text-[11px] text-[#737373] font-mono mt-0.5">
              Customize your engineering identity and public portfolio.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#666666] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-red-950/30 border-b border-red-900/40 text-red-400 text-xs font-mono">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Avatar Section */}
          <div className="flex items-center gap-5 p-4 rounded-[8px] border border-[#1C1C1C] bg-[#070707]">
            <div className="relative group shrink-0">
              {avatarPreview && !previewError ? (
                <img
                  src={getAvatarUrl(avatarPreview)}
                  alt={fullName}
                  onError={() => setPreviewError(true)}
                  className="h-16 w-16 rounded-[10px] object-cover border border-[#2B2B2B]"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-[10px] border border-[#2B2B2B] bg-[#141414] text-lg font-bold text-[#EDEDED] font-mono">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Change photo"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-xs font-bold text-[#EDEDED] block">
                Profile Photo
              </span>
              <p className="text-[11px] text-[#737373]">
                Upload JPG, PNG, or WebP up to 5MB. Optimized for dark interfaces.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#2B2B2B] bg-[#141414] px-3 py-1 text-xs font-mono text-[#D4D4D4] hover:text-white hover:border-[#404040] transition-colors cursor-pointer"
                >
                  <Upload className="h-3 w-3" />
                  <span>{selectedFile ? 'Replace Image' : 'Upload Image'}</span>
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-[11px] font-mono text-[#666666] hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[#A1A1A1] block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Harsh Singh"
                required
                className="w-full rounded-[6px] border border-[#242424] bg-[#070707] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-[#A1A1A1] block">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-[#555555]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="harsh_singh"
                  required
                  className={`w-full rounded-[6px] border pl-7 pr-3 py-2 text-xs text-[#EDEDED] placeholder-[#444444] focus:outline-none font-mono ${
                    usernameError
                      ? 'border-red-500/50 bg-red-950/10'
                      : 'border-[#242424] bg-[#070707] focus:border-[#555555]'
                  }`}
                />
              </div>
              {usernameError && (
                <p className="text-[10px] text-red-400 font-mono mt-0.5">{usernameError}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-medium text-[#A1A1A1]">
                Bio
              </label>
              <span className="text-[10px] font-mono text-[#666666]">
                {bio.length}/500
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="e.g. AI enthusiast building intelligent distributed systems and developer tools."
              className="w-full rounded-[6px] border border-[#242424] bg-[#070707] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-medium text-[#A1A1A1] block">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA / Bengaluru / Remote"
              className="w-full rounded-[6px] border border-[#242424] bg-[#070707] px-3 py-2 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2 border-t border-[#1C1C1C]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] block">
              External Developer Links
            </span>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#888888] block">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full rounded-[6px] border border-[#222222] bg-[#070707] px-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#888888] block">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-[6px] border border-[#222222] bg-[#070707] px-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-[#888888] block">
                  Portfolio / Personal Website URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full rounded-[6px] border border-[#222222] bg-[#070707] px-3 py-1.5 text-xs text-[#EDEDED] placeholder-[#444444] focus:border-[#555555] focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1C1C1C]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-[6px] border border-[#262626] bg-[#121212] px-4 py-2 text-xs font-mono text-[#888888] hover:text-[#EDEDED] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(usernameError)}
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EDEDED] px-5 py-2 text-xs font-bold text-[#050505] hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
