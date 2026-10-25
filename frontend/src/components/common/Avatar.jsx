import { useState } from 'react'
import { getAvatarUrl, getInitials, getAvatarGradient } from '../../utils/avatar'

/**
 * Resilient Avatar Component
 * Displays user avatar image with graceful fallback to monogram initials and deterministic gradient.
 */
export default function Avatar({
  src,
  name = '',
  username = '',
  alt = '',
  size = 'md',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  shape = 'circle', // 'circle' | 'rounded'
}) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const resolvedUrl = getAvatarUrl(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setHasError(false)
  }

  const initials = getInitials(name || username || 'U')
  const gradient = getAvatarGradient(username || name || 'default')

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg',
    '2xl': 'h-24 w-24 text-2xl',
  }

  const baseSize = sizeClasses[size] || size
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
  const altText = alt || name || username || 'User avatar'

  return (
    <div
      className={`relative shrink-0 overflow-hidden flex items-center justify-center select-none ${baseSize} ${shapeClass} ${className}`}
    >
      {resolvedUrl && !hasError ? (
        <img
          src={resolvedUrl}
          alt={altText}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover ${shapeClass} ${imageClassName}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-mono font-bold text-white bg-gradient-to-tr ${gradient} ${shapeClass} ${fallbackClassName}`}
          aria-label={altText}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
