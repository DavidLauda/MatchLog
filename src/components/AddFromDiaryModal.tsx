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
          className="btn-primary inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer text-base"
        >
          <BookOpen className="w-5 h-5" />
          Add Matches from My Diary
        </button>
      )
    }

    if (triggerVariant === 'card-button') {
      return (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add from Diary
        </button>
      )
    }

    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-indigo-500/20 shrink-0"
      >
        <BookOpen className="w-4 h-4" />
        Add from Diary
      </button>
    )
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-950/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Add to "{listTitle}"
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Select matches from your diary to add or remove from this list.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter diary matches by team or competition..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* List of Diary Matches */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-zinc-800/40">
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              {diaryMatches.length === 0 
                ? "You haven't logged any matches in your diary yet."
                : "No matches found matching your search."}
            </div>
          ) : (
            filteredMatches.map(match => {
              const isAdded = addedIds.includes(match.id)
              const isPending = pendingIds[match.id]

              return (
                <div key={match.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                      <span className="text-amber-400/90 font-medium flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {match.competition}
                      </span>
                      <span>•</span>
                      <span className="font-mono">
                        <FormattedDate date={match.matchDate} fallbackFormat="short" />
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-zinc-200 truncate">
                        <TeamLogo src={match.homeTeam.logoUrl} name={match.homeTeam.name} className="w-5 h-5 object-contain" fallbackClassName="w-5 h-5 text-[10px]" />
                        <span className="truncate">{match.homeTeam.name}</span>
                      </div>
                      
                      <div className="font-mono font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-xs text-zinc-300 shrink-0">
                        {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                      </div>

                      <div className="flex items-center gap-2 font-semibold text-zinc-200 truncate">
                        <TeamLogo src={match.awayTeam.logoUrl} name={match.awayTeam.name} className="w-5 h-5 object-contain" fallbackClassName="w-5 h-5 text-[10px]" />
                        <span className="truncate">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(match.id)}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 group/btn'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow-indigo-500/20'
                    } disabled:opacity-50`}
                  >
                    {isPending ? (
                      '...'
                    ) : isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                        <X className="w-3.5 h-3.5 hidden group-hover/btn:inline" />
                        <span className="group-hover/btn:hidden">Added</span>
                        <span className="hidden group-hover/btn:inline">Remove</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
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
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
          <span>{addedIds.length} match{addedIds.length !== 1 ? 'es' : ''} in list</span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors cursor-pointer"
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
