'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Trophy, ArrowRight, Sparkles, Calendar, Clock, CheckCircle2, Flame, Shield, Globe } from 'lucide-react'
import Link from 'next/link'
import { FollowButton } from './FollowButton'
import { TeamLogo } from './TeamLogo'
import { FormattedDate } from './FormattedDate'

interface HomeFeedProps {
  followedEntities: any[];
  recentMatches: any[];
  upcomingMatches: any[];
  ratings: any[];
}

const STARTER_CLUBS = [
  { externalId: '133604', name: 'Arsenal', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png' },
  { externalId: '133738', name: 'Real Madrid', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/7b8c2c1611746765.png' },
  { externalId: '133739', name: 'Barcelona', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/s7754d1611746816.png' },
  { externalId: '133613', name: 'Man City', type: 'club' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' },
]

const STARTER_LEAGUES = [
  { externalId: '4328', name: 'Premier League', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png' },
  { externalId: '4480', name: 'Champions League', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/dtu13t1542818664.png' },
  { externalId: '4335', name: 'La Liga', type: 'league' as const, logoUrl: 'https://r2.thesportsdb.com/images/media/league/badge/7onmyv1534768422.png' },
]

const STARTER_COUNTRIES = [
  { externalId: 'England', name: 'England', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/gb-eng.png' },
  { externalId: 'Spain', name: 'Spain', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/es.png' },
  { externalId: 'Brazil', name: 'Brazil', type: 'country' as const, logoUrl: 'https://flagcdn.com/w80/br.png' },
]

export function HomeFeed({ followedEntities, recentMatches, upcomingMatches, ratings }: HomeFeedProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'diary'>('feed')
  const [feedFilter, setFeedFilter] = useState<'all' | 'upcoming' | 'recent'>('all')

  const isFollowed = (id: string, type: string) => {
    return followedEntities.some(e => String(e.externalId) === String(id) && e.type === type)
  }

  const displayedRecent = feedFilter === 'upcoming' ? [] : recentMatches
  const displayedUpcoming = feedFilter === 'recent' ? [] : upcomingMatches

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Onboarding Starter Kit if following nothing */}
      {followedEntities.length === 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Welcome to your Custom Feed
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Follow Clubs, Leagues & Countries
                </h2>
                <p className="text-zinc-400 text-sm sm:text-base max-w-xl mt-1">
                  Build your personalized dashboard of live results, upcoming fixtures, and quick review logging. Get started by picking a few below:
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Featured Clubs
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STARTER_CLUBS.map(club => (
                    <div key={club.externalId} className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-1.5 pr-2.5 transition-all">
                      <TeamLogo src={club.logoUrl} name={club.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px]" />
                      <span className="text-xs font-bold text-zinc-200">{club.name}</span>
                      <FollowButton
                        externalId={club.externalId}
                        name={club.name}
                        type={club.type}
                        logoUrl={club.logoUrl}
                        initialIsFollowing={isFollowed(club.externalId, club.type)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-indigo-400" /> Major Competitions
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STARTER_LEAGUES.map(league => (
                    <div key={league.externalId} className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-1.5 pr-2.5 transition-all">
                      <TeamLogo src={league.logoUrl} name={league.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px]" />
                      <span className="text-xs font-bold text-zinc-200">{league.name}</span>
                      <FollowButton
                        externalId={league.externalId}
                        name={league.name}
                        type={league.type}
                        logoUrl={league.logoUrl}
                        initialIsFollowing={isFollowed(league.externalId, league.type)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" /> National Teams & Nations
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STARTER_COUNTRIES.map(country => (
                    <div key={country.externalId} className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-1.5 pr-2.5 transition-all">
                      <TeamLogo src={country.logoUrl} name={country.name} className="w-5 h-3.5 object-cover rounded shadow-sm" fallbackClassName="w-5 h-3.5 text-[8px] rounded" />
                      <span className="text-xs font-bold text-zinc-200">{country.name}</span>
                      <FollowButton
                        externalId={country.externalId}
                        name={country.name}
                        type={country.type}
                        logoUrl={country.logoUrl}
                        initialIsFollowing={isFollowed(country.externalId, country.type)}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Followed Feed</span>
            {followedEntities.length > 0 && (
              <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full font-mono font-bold">
                {recentMatches.length + upcomingMatches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('diary')}
            className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'diary'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>My Diary</span>
            <span className="text-xs bg-zinc-800/80 px-2 py-0.5 rounded-full font-mono font-bold text-zinc-300">
              {ratings.length}
            </span>
          </button>
        </div>

        {/* Feed Sub-filters */}
        {activeTab === 'feed' && followedEntities.length > 0 && (
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                feedFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeedFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                feedFilter === 'upcoming' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm' : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Upcoming ({upcomingMatches.length})
            </button>
            <button
              onClick={() => setFeedFilter('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                feedFilter === 'recent' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm' : 'text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-indigo-400" /> Recent Results ({recentMatches.length})
            </button>
          </div>
        )}
      </div>

      {/* Tab Content: Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-10">
          {followedEntities.length === 0 ? (
            <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center">
              <Trophy className="w-10 h-10 text-zinc-600 mb-3" />
              <h3 className="text-lg font-bold text-zinc-300">Your feed is empty</h3>
              <p className="text-zinc-500 text-sm max-w-sm mt-1">
                Follow clubs, leagues, or countries above to see recent scores and upcoming schedules right here.
              </p>
            </div>
          ) : displayedUpcoming.length === 0 && displayedRecent.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
              No fixtures found for your selected filter.
            </div>
          ) : (
            <>
              {/* Upcoming Section */}
              {displayedUpcoming.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Upcoming Fixtures
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">{displayedUpcoming.length} matches</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {displayedUpcoming.map((fixture: any) => (
                      <Link
                        key={fixture.fixture.id}
                        href={`/match/${fixture.fixture.id}`}
                        className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:bg-zinc-800/90"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 pb-3 border-b border-zinc-800/80 font-medium">
                            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                              <Trophy className="w-3 h-3 text-amber-400" /> {fixture.league.name}
                            </span>
                            <span className="font-mono bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800 text-amber-400/90 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <FormattedDate date={fixture.fixture.date} options={{ weekday: 'short', month: 'short', day: 'numeric' }} fallbackFormat="short" />
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                                <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{fixture.teams.home.name}</span>
                              </div>
                              <span className="font-mono text-sm font-bold text-zinc-500">VS</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                                <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{fixture.teams.away.name}</span>
                              </div>
                              <span className="font-mono text-xs font-medium text-amber-500/80 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded">
                                {fixture.fixture.status.short}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-800/50 flex items-center justify-end">
                          <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                            View Preview & Lineups <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Results Section */}
              {displayedRecent.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                      <Flame className="w-4 h-4" /> Recent Results
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">{displayedRecent.length} matches</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {displayedRecent.map((fixture: any) => {
                      const isLogged = ratings.some(r => String(r.match.externalId) === String(fixture.fixture.id))
                      const userRating = ratings.find(r => String(r.match.externalId) === String(fixture.fixture.id))

                      return (
                        <Link
                          key={fixture.fixture.id}
                          href={`/match/${fixture.fixture.id}`}
                          className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:bg-zinc-800/90"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 pb-3 border-b border-zinc-800/80 font-medium">
                              <span className="text-zinc-300 font-semibold">{fixture.league.name}</span>
                              <span className="text-zinc-500 font-mono">
                                <FormattedDate date={fixture.fixture.date} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                                  <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{fixture.teams.home.name}</span>
                                </div>
                                <span className="font-mono text-xl font-black text-white bg-zinc-950/80 px-2.5 py-0.5 rounded-lg border border-zinc-800/80">
                                  {fixture.goals.home ?? '-'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                                  <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{fixture.teams.away.name}</span>
                                </div>
                                <span className="font-mono text-xl font-black text-white bg-zinc-950/80 px-2.5 py-0.5 rounded-lg border border-zinc-800/80">
                                  {fixture.goals.away ?? '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                            {isLogged && userRating ? (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`w-3.5 h-3.5 ${star <= userRating.stars ? 'fill-amber-400 text-amber-400' : 'fill-zinc-800 text-zinc-800'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-wider">
                                  Logged
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                                ⭐ Rate & Review <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">{fixture.fixture.status.short}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab Content: Diary */}
      {activeTab === 'diary' && (
        <div>
          {ratings.length === 0 ? (
            <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-zinc-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-300 mb-2">No matches logged yet</h2>
              <p className="text-zinc-500 mb-6 max-w-sm">
                Keep track of the matches you've watched, rate them, and write your thoughts.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-md shadow-indigo-900/20"
              >
                Find a match <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ratings.map((rating) => (
                <Link
                  key={rating.id}
                  href={`/match/${rating.match.externalId}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 hover:bg-zinc-800/80 transition-all flex flex-col group shadow-sm hover:shadow-xl"
                >
                  <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <TeamLogo src={rating.match.homeTeam.logoUrl} name={rating.match.homeTeam.name} className="w-full h-full object-contain" fallbackClassName="w-8 h-8 text-xs" />
                        </div>
                        <span className="font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{rating.match.homeTeam.name}</span>
                      </div>
                      <div className="font-mono text-xl font-black text-zinc-100 px-2 py-0.5 rounded-lg shrink-0 w-10 text-center bg-zinc-950/50 border border-zinc-800/50">
                        {rating.match.homeScore ?? '-'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full overflow-hidden shrink-0">
                          <TeamLogo src={rating.match.awayTeam.logoUrl} name={rating.match.awayTeam.name} className="w-full h-full object-contain" fallbackClassName="w-8 h-8 text-xs" />
                        </div>
                        <span className="font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{rating.match.awayTeam.name}</span>
                      </div>
                      <div className="font-mono text-xl font-black text-zinc-100 px-2 py-0.5 rounded-lg shrink-0 w-10 text-center bg-zinc-950/50 border border-zinc-800/50">
                        {rating.match.awayScore ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#131316] p-4 border-t border-zinc-800/50 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= rating.stars ? 'fill-indigo-500 text-indigo-500' : 'fill-zinc-800 text-zinc-800'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        <FormattedDate date={rating.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                      </span>
                    </div>
                    {rating.review && (
                      <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed italic border-l-2 border-zinc-800 pl-3">
                        "{rating.review}"
                      </p>
                    )}
                    {Array.isArray(rating.tags) && rating.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {rating.tags.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
