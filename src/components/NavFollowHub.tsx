'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { FollowModal } from './FollowModal'

interface NavFollowHubProps {
  initialFollows: { externalId: string; type: string }[];
}

export function NavFollowHub({ initialFollows }: NavFollowHubProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
        title="Manage Followed Clubs, Leagues, and Countries"
      >
        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
        <span>Follows</span>
      </button>

      <FollowModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialFollows={initialFollows}
      />
    </>
  )
}
