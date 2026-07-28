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
        <label htmlFor="tags" className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tags</span>
          <span className="text-xs text-slate-500 font-normal">(click to add or type below)</span>
        </label>
        <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
          <Sparkles className="w-3 h-3" /> Popular
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
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400/50 scale-[1.03]'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-slate-600'
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
          className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
        />
      </div>
    </div>
  )
}
