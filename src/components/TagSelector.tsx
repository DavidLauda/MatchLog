'use client'

import { useState } from 'react'
import { Tag, Sparkles } from 'lucide-react'

const COMMON_TAGS = [
  'thriller',
  'comeback',
  'controversial',
  'masterclass',
  'golazo',
  'derby',
  'atmosphere',
  'tactical',
  'var-drama',
  'upset',
  'heartbreak',
  'classic',
  'dominant',
  'end-to-end',
  'banger',
  'underdog'
]

interface TagSelectorProps {
  initialTags?: string[];
}

export function TagSelector({ initialTags = [] }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState(initialTags.join(', '))

  const currentTags = inputValue
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)

  const toggleTag = (tagToToggle: string) => {
    const isSelected = currentTags.includes(tagToToggle.toLowerCase())
    let newTags: string[]

    if (isSelected) {
      newTags = currentTags.filter(t => t !== tagToToggle.toLowerCase())
    } else {
      newTags = [...currentTags, tagToToggle.toLowerCase()]
    }

    setInputValue(newTags.join(', '))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="tags" className="text-sm font-black text-black flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Tags</span>
          <span className="text-xs text-zinc-600 font-bold">(click to add or type below)</span>
        </label>
        <span className="text-[11px] text-black font-black flex items-center gap-1 bg-[#fde047] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
          <Sparkles className="w-3 h-3 stroke-[2.5]" /> Popular
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {COMMON_TAGS.map((tag) => {
          const isSelected = currentTags.includes(tag.toLowerCase())
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1 cursor-pointer select-none border-2 border-black ${
                isSelected
                  ? 'bg-[#fde047] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                  : 'bg-white hover:bg-zinc-100 text-zinc-800 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <span>#{tag}</span>
            </button>
          )
        })}
      </div>

      <div className="pt-1">
        <input
          type="text"
          name="tags"
          id="tags"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. thriller, comeback, controversial"
          className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold placeholder-zinc-400 shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] transition-all text-sm"
        />
      </div>
    </div>
  )
}
