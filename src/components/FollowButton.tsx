'use client'

import { useState, useTransition } from 'react'
import { toggleFollow } from '@/app/actions'
import { Check, Plus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FollowButtonProps {
  externalId: string | number;
  name: string;
  type: 'club' | 'league' | 'country' | 'team';
  logoUrl?: string | null;
  initialIsFollowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pill' | 'outline';
  onToggle?: (newState: boolean) => void;
}

export function FollowButton({
  externalId,
  name,
  type,
  logoUrl,
  initialIsFollowing = false,
  size = 'md',
  variant = 'default',
  onToggle
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const nextState = !isFollowing
    setIsFollowing(nextState)
    if (onToggle) onToggle(nextState)

    startTransition(async () => {
      try {
        const serverState = await toggleFollow(String(externalId), name, type, logoUrl || undefined)
        setIsFollowing(serverState)
        if (onToggle) onToggle(serverState)
      } catch (error) {
        console.error('Failed to toggle follow:', error)
        setIsFollowing(!nextState) // revert on error
        if (onToggle) onToggle(!nextState)
      }
    })
  }

  const sizeClasses = {
    sm: 'py-1 px-2.5 text-xs gap-1.5 rounded-xl font-black',
    md: 'py-1.5 px-3.5 text-sm gap-2 rounded-2xl font-black',
    lg: 'py-2 px-5 text-base gap-2.5 rounded-2xl font-black'
  }[size]

  const variantClasses = {
    default: isFollowing
      ? 'bg-[#18181b] hover:bg-red-500 text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]'
      : 'bg-[#a3e635] hover:bg-[#84cc16] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]',
    pill: isFollowing
      ? 'bg-[#18181b] hover:bg-red-500 text-white font-black border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]'
      : 'bg-[#a3e635] hover:bg-[#84cc16] text-black font-black border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]',
    outline: isFollowing
      ? 'bg-white hover:bg-red-500 text-black hover:text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]'
      : 'bg-white hover:bg-[#a3e635] text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000]'
  }[variant]

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none ${sizeClasses} ${variantClasses} disabled:opacity-70`}
      title={isFollowing ? `Unfollow ${name}` : `Follow ${name}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
          </motion.div>
        ) : isFollowing ? (
          <motion.div
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Following</span>
          </motion.div>
        ) : (
          <motion.div
            key="plus"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Follow</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
