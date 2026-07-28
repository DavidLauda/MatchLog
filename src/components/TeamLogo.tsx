'use client'

import { useState, useEffect } from 'react'

interface TeamLogoProps {
  src?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function TeamLogo({ src, name, className = 'w-7 h-7 object-contain', fallbackClassName = 'w-7 h-7 text-xs' }: TeamLogoProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  if (!src || hasError) {
    const initials = (name || '?')
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <div 
        className={`bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/80 rounded-full flex items-center justify-center font-bold font-mono text-zinc-300 shadow-inner shrink-0 ${fallbackClassName}`}
        title={name}
      >
        {initials || '⚽'}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${className} shrink-0`}
      onError={() => setHasError(true)}
    />
  )
}
