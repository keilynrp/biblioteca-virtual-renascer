"use client"

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  className?: string
  containerClassName?: string
}

export function LazyImage({
  src,
  alt,
  placeholder = '/placeholder.png',
  className,
  containerClassName,
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src)
              if (observer) observer.disconnect()
            }
          })
        },
        {
          rootMargin: '50px',
        }
      )

      observer.observe(imageRef)
    }

    return () => {
      if (observer) observer.disconnect()
    }
  }, [imageRef, src, imageSrc, placeholder])

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <img
        ref={setImageRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}
