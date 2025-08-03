/**
 * Image optimization utilities for better performance
 */

interface ImageOptimizationOptions {
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
  sizes?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * Generate optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
) {
  const {
    quality = 75,
    format = 'auto',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priority = false,
    placeholder = 'empty',
    blurDataURL,
  } = options

  return {
    src,
    alt,
    quality,
    sizes,
    priority,
    placeholder,
    blurDataURL,
    // Enable optimization
    unoptimized: false,
    // Add loading strategy
    loading: priority ? 'eager' : 'lazy',
  }
}

/**
 * Generate blur data URL for placeholder
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(1, '#e5e7eb')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => resolve()
    img.onerror = reject
    
    // Set priority for critical images
    if (priority) {
      img.fetchPriority = 'high'
    }
    
    img.src = src
  })
}

/**
 * Lazy load images with Intersection Observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  private images: Set<HTMLImageElement> = new Set()

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      })
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.observer?.unobserve(img)
        this.images.delete(img)
      }
    })
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.removeAttribute('data-src')
      img.classList.add('loaded')
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.images.add(img)
      this.observer.observe(img)
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img)
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.unobserve(img)
      this.images.delete(img)
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.images.clear()
    }
  }
}

/**
 * Optimize avatar images with fallback
 */
export function getAvatarProps(
  src: string | undefined,
  name: string,
  size: number = 40
) {
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=3F51B5&color=fff&format=svg`
  
  return getOptimizedImageProps(
    src || fallbackSrc,
    `${name} avatar`,
    {
      quality: 80,
      sizes: `${size}px`,
      placeholder: 'blur',
      blurDataURL: generateBlurDataURL(size, size),
    }
  )
}

/**
 * Responsive image sizes for different breakpoints
 */
export const responsiveSizes = {
  avatar: '40px',
  thumbnail: '(max-width: 640px) 100px, 150px',
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  hero: '100vw',
  full: '100vw',
} as const

/**
 * Image format detection and optimization
 */
export function getSupportedImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg'
  
  // Check for AVIF support
  const avifCanvas = document.createElement('canvas')
  avifCanvas.width = 1
  avifCanvas.height = 1
  const avifSupported = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  
  if (avifSupported) return 'avif'
  
  // Check for WebP support
  const webpCanvas = document.createElement('canvas')
  webpCanvas.width = 1
  webpCanvas.height = 1
  const webpSupported = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  
  if (webpSupported) return 'webp'
  
  return 'jpeg'
}

// Create singleton lazy loader
export const lazyImageLoader = new LazyImageLoader()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    lazyImageLoader.disconnect()
  })
}