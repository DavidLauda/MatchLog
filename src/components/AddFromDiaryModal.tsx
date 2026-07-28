'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Check, Search, X, BookOpen, Trophy } from 'lucide-react'
import { addMatchToList, removeMatchFromList } from '@/app/actions'
import { TeamLogo } from './TeamLogo'
import { FormattedDate } from './FormattedDate'

interface DiaryMatch {
  id: string;
  externalId: string;
  competition: string;
  matchDate: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { name: string; logoUrl?: string | null };
  awayTeam: { name: string; logoUrl?: string | null };
  stars?: number;
  review?: string | null;
}

interface AddFromDiaryModalProps {
  listId: string;
  listTitle?: string;
  diaryMatches: DiaryMatch[];
  existingMatchIds?: string[];
  triggerVariant?: 'header-button' | 'card-button' | 'empty-state';
}

export function AddFromDiaryModal({
  listId,
  listTitle = 'List',
  diaryMatches,
  existingMatchIds = [],
  triggerVariant = 'header-button'
}: AddFromDiaryModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [addedIds, setAddedIds] = useState<string[]>(existingMatchIds)
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({})
  const [, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setAddedIds(existingMatchIds)
  }, [existingMatchIds])

  const handleToggle = async (matchId: string) => {
    const isAdded = addedIds.includes(matchId)
    setPendingIds(prev => ({ ...prev, [matchId]: true }))

    startTransition(async () => {
      try {
        if (isAdded) {
          await removeMatchFromList(listId, matchId)
          setAddedIds(prev => prev.filter(id => id !== matchId))
        } else {
          await addMatchToList(listId, matchId)
          setAddedIds(prev => [...prev, matchId])
        }
      } catch (err) {
        console.error(err)
        alert('Failed to update list')
      } finally {
        setPendingIds(prev => ({ ...prev, [matchId]: false }))
      }
    })
  }

  const filteredMatches = diaryMatches.filter(match => {
    const q = searchQuery.toLowerCase()
    return (
      match.homeTeam.name.toLowerCase().includes(q) ||
      match.awayTeam.name.toLowerCase().includes(q) ||
      match.competition.toLowerCase().includes(q)
    )
  })

  const renderTrigger = () => {
    if (triggerVariant === 'empty-state') {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
          className="retro-btn-primary inline-flex items-center gap-2 font-black px-6 py-3 text-base"
        >
          <BookOpen className="w-5 h-5 stroke-[2.5]" />
          Add Matches from My Diary
        </button>
      )
    }

    if (triggerVariant === 'card-button') {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fde047] hover:bg-[#facc15] text-black border-2 border-black text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add from Diary
        </button>
      )
    }

    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="retro-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm shrink-0"
      >
        <BookOpen className="w-4 h-4 stroke-[2.5]" />
        Add from Diary
      </button>
    )
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-[#fef9c3] border-[3px] border-black rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[8px_8px_0px_0px_#000] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between gap-4 bg-white">
          <div>
            <h3 className="text-xl font-black text-black flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
              Add to &ldquo;{listTitle}&rdquo;
            </h3>
            <p className="text-xs font-bold text-zinc-600 mt-1">
              Select matches from your diary to add or remove from this list.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-black hover:bg-zinc-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black bg-[#fef9c3]">
          <div className="relative">
            <Search className="w-4 h-4 text-black stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter diary matches by team or competition..."
              className="w-full bg-white border-2 border-black rounded-2xl pl-10 pr-4 py-2.5 text-sm text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] shadow-[2px_2px_0px_0px_#000] transition-all"
            />
          </div>
        </div>

        {/* List of Diary Matches */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-bold text-sm">
              {diaryMatches.length === 0 
                ? "You haven't logged any matches in your diary yet."
                : "No matches found matching your search."}
            </div>
          ) : (
            filteredMatches.map(match => {
              const isAdded = addedIds.includes(match.id)
              const isPending = pendingIds[match.id]

              return (
                <div key={match.id} className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000] flex items-center justify-between gap-4 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 mb-1">
                      <span className="text-black font-black flex items-center gap-1 bg-[#fef9c3] px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]">
                        <Trophy className="w-3 h-3 stroke-[2.5]" /> {match.competition}
                      </span>
                      <span>•</span>
                      <span className="font-mono font-black text-black">
                        <FormattedDate date={match.matchDate} fallbackFormat="short" />
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm pt-1">
                      <div className="flex items-center gap-2 font-black text-black truncate">
                        <TeamLogo src={match.homeTeam.logoUrl} name={match.homeTeam.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px] font-black" />
                        <span className="truncate">{match.homeTeam.name}</span>
                      </div>
                      
                      <div className="font-mono font-black bg-[#18181b] px-2.5 py-0.5 rounded-lg border-2 border-black text-xs text-white shrink-0 shadow-[1px_1px_0px_0px_#000]">
                        {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                      </div>

                      <div className="flex items-center gap-2 font-black text-black truncate">
                        <TeamLogo src={match.awayTeam.logoUrl} name={match.awayTeam.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px] font-black" />
                        <span className="truncate">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(match.id)}
                    disabled={isPending}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                      isAdded
                        ? 'bg-[#fda4af] hover:bg-[#fb7185] text-black group/btn'
                        : 'bg-[#a3e635] hover:bg-[#84cc16] text-black'
                    } disabled:opacity-50`}
                  >
                    {isPending ? (
                      '...'
                    ) : isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5] group-hover/btn:hidden" />
                        <X className="w-3.5 h-3.5 stroke-[2.5] hidden group-hover/btn:inline" />
                        <span className="group-hover/btn:hidden">Added</span>
                        <span className="hidden group-hover/btn:inline">Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        Add
                      </>
                    )}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-black bg-[#fef9c3] flex items-center justify-between text-xs font-black text-black">
          <span className="bg-white px-3 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">{addedIds.length} match{addedIds.length !== 1 ? 'es' : ''} in list</span>
          <button
            onClick={() => setIsOpen(false)}
            className="retro-btn-primary py-2 px-6"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {renderTrigger()}
      {mounted && typeof document !== 'undefined' && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  )
}
