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
        className="flex items-center gap-1.5 text-sm font-black text-black hover:bg-[#fde047] bg-white border-2 border-black px-3.5 py-1.5 rounded-2xl shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
        title="Manage Followed Clubs, Leagues, and Countries"
      >
        <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
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
