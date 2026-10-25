import { useState } from 'react'
import { ImageOff } from 'lucide-react'

/**
 * Resilient Image Component with Graceful Fallback
 * Prevents broken image icons and browser layout jumping when external images fail.
 */
export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  fallback,
  fallbackSrc,
  fallbackIcon: FallbackIcon,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) {
  const [prevSrc, setPrevSrc] = useState(src)
  const [hasError, setHasError] = useState(!src)
  const [currentSrc, setCurrentSrc] = useState(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setCurrentSrc(src)
    setHasError(!src)
  }

  const handleError = (e) => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      return
    }
    setHasError(true)
    if (onError) onError(e)
  }

  const handleLoad = (e) => {
    setHasError(false)
    if (onLoad) onLoad(e)
  }

  if (hasError || !currentSrc) {
    if (fallback) {
      return typeof fallback === 'function' ? fallback() : fallback
    }

    return (
      <div
        className={`flex items-center justify-center bg-[#0d0f14] text-neutral-600 border border-white/[0.06] select-none ${className}`}
        aria-label={alt || 'Image placeholder'}
        role="img"
      >
        {FallbackIcon ? (
          <FallbackIcon className="h-1/3 w-1/3 max-h-8 max-w-8 text-neutral-500" />
        ) : (
          <ImageOff className="h-1/3 w-1/3 max-h-6 max-w-6 text-neutral-600" />
        )}
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )
}
