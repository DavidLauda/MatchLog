'use client'

import { useState } from 'react'

interface TeamLogoProps {
  src?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function TeamLogo({ src, name, className = 'w-7 h-7 object-contain', fallbackClassName = 'w-7 h-7 text-xs' }: TeamLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    const initials = (name || '?')
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    return (
      <div 
        className={`bg-[#fde047] border-2 border-black rounded-full flex items-center justify-center font-black font-mono text-black shadow-[1px_1px_0px_0px_#000] shrink-0 ${fallbackClassName}`}
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
      onError={() => setFailedSrc(src)}
    />
  )
}
