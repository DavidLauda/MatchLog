'use client'

import { useState, useEffect, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Trophy, Globe, Shield, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { FollowButton } from './FollowButton'
import { TeamLogo } from './TeamLogo'
import { searchTeamsAction } from '@/app/actions'

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFollows: { externalId: string; type: string }[];
}

const TOP_CLUBS = [
  { externalId: '133604', name: 'Arsenal', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png', country: 'England' },
  { externalId: '133613', name: 'Manchester City', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png', country: 'England' },
  { externalId: '133738', name: 'Real Madrid', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/7b8c2c1611746765.png', country: 'Spain' },
  { externalId: '133739', name: 'Barcelona', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/s7754d1611746816.png', country: 'Spain' },
  { externalId: '133664', name: 'Bayern Munich', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/qwvrst1467462947.png', country: 'Germany' },
  { externalId: '133601', name: 'Liverpool', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/c8h4u51711200230.png', country: 'England' },
  { externalId: '133612', name: 'Manchester United', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png', country: 'England' },
  { externalId: '133602', name: 'Chelsea', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png', country: 'England' },
]

const TOP_LEAGUES = [
  { externalId: '4328', name: 'English Premier League', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png' },
  { externalId: '4480', name: 'UEFA Champions League', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/dtu13t1542818664.png' },
  { externalId: '4335', name: 'Spanish La Liga', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/7onmyv1534768422.png' },
  { externalId: '4331', name: 'German Bundesliga', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png' },
  { externalId: '4332', name: 'Italian Serie A', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/t06u5t1753702175.png' },
  { externalId: '4346', name: 'American Major League Soccer', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/spn8991535728519.png' },
]

const TOP_COUNTRIES = [
  { externalId: 'England', name: 'England', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/gb-eng.png' },
  { externalId: 'Spain', name: 'Spain', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/es.png' },
  { externalId: 'Argentina', name: 'Argentina', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/ar.png' },
  { externalId: 'Brazil', name: 'Brazil', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/br.png' },
  { externalId: 'Germany', name: 'Germany', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/de.png' },
  { externalId: 'France', name: 'France', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/fr.png' },
  { externalId: 'Italy', name: 'Italy', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/it.png' },
  { externalId: 'USA', name: 'USA', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/us.png' },
]

export function FollowModal({ isOpen, onClose, initialFollows = [] }: FollowModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'popular' | 'clubs' | 'leagues' | 'countries'>('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, startSearchTransition] = useTransition()
  const [followedSet, setFollowedSet] = useState<Set<string>>(
    new Set(initialFollows.map(f => `${f.type}:${f.externalId}`))
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.trim().length >= 2) {
      startSearchTransition(async () => {
        try {
          const res = await searchTeamsAction(q)
          setSearchResults(res || [])
        } catch (err) {
          console.error(err)
        }
      })
    } else {
      setSearchResults([])
    }
  }

  const isItemFollowed = (externalId: string, type: string) => {
    return followedSet.has(`${type}:${externalId}`)
  }

  const handleToggleState = (externalId: string, type: string, newState: boolean) => {
    const key = `${type}:${externalId}`
    setFollowedSet(prev => {
      const next = new Set(prev)
      if (newState) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="w-full max-w-3xl bg-[#fef9c3] border-[3px] border-black rounded-3xl shadow-[8px_8px_0px_0px_#000] overflow-hidden flex flex-col max-h-[85vh] relative z-50"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#fde047] rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black">Personalize Your Feed</h2>
              <p className="text-xs font-bold text-zinc-600">Follow your favorite clubs, competitions, and countries</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-black hover:bg-zinc-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-black px-6 bg-[#fef9c3] gap-2 overflow-x-auto shrink-0 pt-2">
          <button
            onClick={() => { setActiveTab('popular'); setSearchQuery(''); }}
            className={`py-3 px-4 font-black text-sm border-2 border-black rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'popular' 
                ? 'bg-white text-black shadow-[2px_0px_0px_0px_#000] border-b-white translate-y-[2px]' 
                : 'bg-[#fde047] text-black hover:bg-[#facc15]'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Featured</span>
          </button>
          <button
            onClick={() => setActiveTab('clubs')}
            className={`py-3 px-4 font-black text-sm border-2 border-black rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'clubs' 
                ? 'bg-white text-black shadow-[2px_0px_0px_0px_#000] border-b-white translate-y-[2px]' 
                : 'bg-[#fde047] text-black hover:bg-[#facc15]'
            }`}
          >
            <Shield className="w-4 h-4 stroke-[2.5]" />
            <span>Clubs & Teams</span>
          </button>
          <button
            onClick={() => { setActiveTab('leagues'); setSearchQuery(''); }}
            className={`py-3 px-4 font-black text-sm border-2 border-black rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'leagues' 
                ? 'bg-white text-black shadow-[2px_0px_0px_0px_#000] border-b-white translate-y-[2px]' 
                : 'bg-[#fde047] text-black hover:bg-[#facc15]'
            }`}
          >
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            <span>Leagues</span>
          </button>
          <button
            onClick={() => { setActiveTab('countries'); setSearchQuery(''); }}
            className={`py-3 px-4 font-black text-sm border-2 border-black rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'countries' 
                ? 'bg-white text-black shadow-[2px_0px_0px_0px_#000] border-b-white translate-y-[2px]' 
                : 'bg-[#fde047] text-black hover:bg-[#facc15]'
            }`}
          >
            <Globe className="w-4 h-4 stroke-[2.5]" />
            <span>Countries</span>
          </button>
        </div>

        {/* Search Input for Clubs */}
        {activeTab === 'clubs' && (
          <div className="p-6 pb-2 shrink-0 bg-white">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black stroke-[2.5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search any team worldwide (e.g. Arsenal, Dortmund, Milan)..."
                className="w-full bg-white border-2 border-black rounded-2xl py-3 pl-12 pr-10 text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] shadow-[3px_3px_0px_0px_#000] text-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-black" />
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {activeTab === 'popular' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-black stroke-[2.5]" /> Popular Clubs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOP_CLUBS.map(club => (
                    <div key={club.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={club.logoUrl} name={club.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-sm font-black" />
                        <div>
                          <div className="font-black text-sm text-black">{club.name}</div>
                          <div className="text-xs font-bold text-zinc-600">{club.country}</div>
                        </div>
                      </div>
                      <FollowButton 
                        externalId={club.externalId} 
                        name={club.name} 
                        type={club.type} 
                        logoUrl={club.logoUrl}
                        initialIsFollowing={isItemFollowed(club.externalId, club.type)}
                        onToggle={(state) => handleToggleState(club.externalId, club.type, state)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-black stroke-[2.5]" /> Top Competitions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOP_LEAGUES.map(league => (
                    <div key={league.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={league.logoUrl} name={league.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-sm font-black" />
                        <div className="font-black text-sm text-black">{league.name}</div>
                      </div>
                      <FollowButton 
                        externalId={league.externalId} 
                        name={league.name} 
                        type={league.type} 
                        logoUrl={league.logoUrl}
                        initialIsFollowing={isItemFollowed(league.externalId, league.type)}
                        onToggle={(state) => handleToggleState(league.externalId, league.type, state)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-black stroke-[2.5]" /> Footballing Nations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOP_COUNTRIES.map(country => (
                    <div key={country.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={country.logoUrl} name={country.name} className="w-7 h-5 object-cover rounded border border-black shadow-sm" fallbackClassName="w-7 h-5 text-xs rounded font-black" />
                        <div className="font-black text-sm text-black">{country.name}</div>
                      </div>
                      <FollowButton 
                        externalId={country.externalId} 
                        name={country.name} 
                        type={country.type} 
                        logoUrl={country.logoUrl}
                        initialIsFollowing={isItemFollowed(country.externalId, country.type)}
                        onToggle={(state) => handleToggleState(country.externalId, country.type, state)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clubs' && (
            <div>
              {searchQuery.trim().length === 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-600 mb-3">Popular Suggestions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TOP_CLUBS.map(club => (
                      <div key={club.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                        <div className="flex items-center gap-3">
                          <TeamLogo src={club.logoUrl} name={club.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-sm font-black" />
                          <div>
                            <div className="font-black text-sm text-black">{club.name}</div>
                            <div className="text-xs font-bold text-zinc-600">{club.country}</div>
                          </div>
                        </div>
                        <FollowButton 
                          externalId={club.externalId} 
                          name={club.name} 
                          type={club.type} 
                          logoUrl={club.logoUrl}
                          initialIsFollowing={isItemFollowed(club.externalId, club.type)}
                          onToggle={(state) => handleToggleState(club.externalId, club.type, state)}
                          size="sm"
                          variant="pill"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 && !isSearching ? (
                <div className="text-center py-12 font-bold text-zinc-500">
                  No clubs found matching "<span className="text-black font-black">{searchQuery}</span>"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.map(club => (
                    <div key={club.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={club.logoUrl} name={club.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-sm font-black" />
                        <div>
                          <div className="font-black text-sm text-black">{club.name}</div>
                          {club.country && <div className="text-xs font-bold text-zinc-600">{club.country}</div>}
                        </div>
                      </div>
                      <FollowButton 
                        externalId={club.externalId} 
                        name={club.name} 
                        type="club" 
                        logoUrl={club.logoUrl}
                        initialIsFollowing={isItemFollowed(club.externalId, 'club')}
                        onToggle={(state) => handleToggleState(club.externalId, 'club', state)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leagues' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOP_LEAGUES.map(league => (
                <div key={league.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                  <div className="flex items-center gap-3">
                    <TeamLogo src={league.logoUrl} name={league.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-sm font-black" />
                    <div className="font-black text-sm text-black">{league.name}</div>
                  </div>
                  <FollowButton 
                    externalId={league.externalId} 
                    name={league.name} 
                    type={league.type} 
                    logoUrl={league.logoUrl}
                    initialIsFollowing={isItemFollowed(league.externalId, league.type)}
                    onToggle={(state) => handleToggleState(league.externalId, league.type, state)}
                    size="sm"
                    variant="pill"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'countries' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TOP_COUNTRIES.map(country => (
                <div key={country.externalId} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all">
                  <div className="flex items-center gap-3">
                    <TeamLogo src={country.logoUrl} name={country.name} className="w-7 h-5 object-cover rounded border border-black shadow-sm" fallbackClassName="w-7 h-5 text-xs rounded font-black" />
                    <div className="font-black text-sm text-black">{country.name}</div>
                  </div>
                  <FollowButton 
                    externalId={country.externalId} 
                    name={country.name} 
                    type={country.type} 
                    logoUrl={country.logoUrl}
                    initialIsFollowing={isItemFollowed(country.externalId, country.type)}
                    onToggle={(state) => handleToggleState(country.externalId, country.type, state)}
                    size="sm"
                    variant="pill"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-black bg-[#fef9c3] flex items-center justify-between px-6 shrink-0">
          <div className="text-xs font-black text-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            <span>Following <strong className="text-black font-black bg-white px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]">{followedSet.size}</strong> entities</span>
          </div>
          <button
            onClick={onClose}
            className="retro-btn-primary py-2 px-6 text-sm"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
