'use client'

import { useState } from 'react'
import { 
  Flame, Search, ArrowRight, TrendingUp, Calendar, Trophy, Globe, User, LogIn, Target, Shield, Heart,
  Activity, Star, StarHalf, List, Clock, Zap, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { FollowButton } from './FollowButton'
import { TeamLogo } from './TeamLogo'
import { FormattedDate } from './FormattedDate'
import { Statty } from './Statty'

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
      <Statty ratings={ratings} />

      {/* Onboarding Starter Kit if following nothing */}
      {followedEntities.length === 0 && (
        <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] text-white border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-[2px_2px_0px_0px_#000]">
                <Sparkles className="w-3.5 h-3.5 text-[#fde047]" /> Welcome to your Custom Feed
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                Follow Clubs, Leagues & Countries
              </h2>
              <p className="text-zinc-700 font-bold text-sm sm:text-base max-w-xl mt-2">
                Build your personalized dashboard of live results, upcoming fixtures, and quick review logging. Get started by picking a few below:
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-black stroke-[2.5]" /> Featured Clubs
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STARTER_CLUBS.map(club => (
                  <div key={club.externalId} className="flex items-center gap-2 bg-white border-2 border-black hover:bg-zinc-100 rounded-2xl p-1.5 pr-2.5 transition-all shadow-[2px_2px_0px_0px_#000]">
                    <TeamLogo src={club.logoUrl} name={club.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px]" />
                    <span className="text-xs font-black text-black">{club.name}</span>
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
              <div className="text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-black stroke-[2.5]" /> Major Competitions
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STARTER_LEAGUES.map(league => (
                  <div key={league.externalId} className="flex items-center gap-2 bg-white border-2 border-black hover:bg-zinc-100 rounded-2xl p-1.5 pr-2.5 transition-all shadow-[2px_2px_0px_0px_#000]">
                    <TeamLogo src={league.logoUrl} name={league.name} className="w-6 h-6 object-contain" fallbackClassName="w-6 h-6 text-[10px]" />
                    <span className="text-xs font-black text-black">{league.name}</span>
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
              <div className="text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="text-sm">🌍</span> National Teams
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STARTER_COUNTRIES.map(country => (
                  <div key={country.externalId} className="flex items-center gap-2 bg-white border-2 border-black hover:bg-zinc-100 rounded-2xl p-1.5 pr-2.5 transition-all shadow-[2px_2px_0px_0px_#000]">
                    <TeamLogo src={country.logoUrl} name={country.name} className="w-5 h-3.5 object-cover rounded border border-black shadow-sm" fallbackClassName="w-5 h-3.5 text-[8px] rounded" />
                    <span className="text-xs font-black text-black">{country.name}</span>
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
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-black pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-5 py-2.5 rounded-2xl font-black text-base transition-all flex items-center gap-2 cursor-pointer border-2 border-black ${
              activeTab === 'feed'
                ? 'bg-[#a3e635] text-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-zinc-700 hover:text-black shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100'
            }`}
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Followed Feed</span>
            {followedEntities.length > 0 && (
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-mono font-black border border-black">
                {recentMatches.length + upcomingMatches.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('diary')}
            className={`px-5 py-2.5 rounded-2xl font-black text-base transition-all flex items-center gap-2 cursor-pointer border-2 border-black ${
              activeTab === 'diary'
                ? 'bg-[#c4b5fd] text-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                : 'bg-white text-zinc-700 hover:text-black shadow-[2px_2px_0px_0px_#000] hover:bg-zinc-100'
            }`}
          >
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            <span>My Diary</span>
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full font-mono font-black border border-black">
              {ratings.length}
            </span>
          </button>
        </div>

        {/* Feed Sub-filters */}
        {activeTab === 'feed' && followedEntities.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFeedFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black ${
                feedFilter === 'all' ? 'bg-[#18181b] text-white shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-zinc-700 hover:text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFeedFilter('upcoming')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 border-black ${
                feedFilter === 'upcoming' ? 'bg-[#fde047] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-zinc-700 hover:text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Upcoming ({upcomingMatches.length})
            </button>
            <button
              onClick={() => setFeedFilter('recent')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 border-black ${
                feedFilter === 'recent' ? 'bg-[#fda4af] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-zinc-700 hover:text-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Recent Results ({recentMatches.length})
            </button>
          </div>
        )}
      </div>

      {/* Tab Content: Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-10">
          {followedEntities.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-black rounded-3xl p-12 text-center flex flex-col items-center shadow-[4px_4px_0px_0px_#000]">
              <Trophy className="w-12 h-12 text-black mb-3 stroke-[2]" />
              <h3 className="text-xl font-black text-black">Your feed is empty</h3>
              <p className="text-zinc-600 font-bold text-sm max-w-sm mt-1">
                Follow clubs, leagues, or countries above to see recent scores and upcoming schedules right here.
              </p>
            </div>
          ) : displayedUpcoming.length === 0 && displayedRecent.length === 0 ? (
            <div className="bg-white border-[3px] border-black rounded-3xl p-12 text-center text-black font-black shadow-[4px_4px_0px_0px_#000]">
              No fixtures found for your selected filter.
            </div>
          ) : (
            <>
              {/* Upcoming Section */}
              {displayedUpcoming.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#a3e635] border border-black inline-block" />
                      <Calendar className="w-4 h-4 stroke-[2.5]" /> Upcoming Fixtures
                    </h3>
                    <span className="text-xs font-black text-black bg-[#fef9c3] px-2.5 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">{displayedUpcoming.length} matches</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {displayedUpcoming.map((fixture: any) => (
                      <Link
                        key={fixture.fixture.id}
                        href={`/match/${fixture.fixture.id}`}
                        className="bg-[#fef9c3] border-[2.5px] border-black rounded-3xl p-5 transition-all flex flex-col justify-between group shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000]"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-black mb-4 pb-3 border-b-2 border-black font-black">
                            <span className="flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-black stroke-[2.5]" /> {fixture.league.name}
                            </span>
                            <span className="font-mono bg-white px-2.5 py-1 rounded-xl border-2 border-black text-black flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                              <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                              <FormattedDate date={fixture.fixture.date} options={{ weekday: 'short', month: 'short', day: 'numeric' }} fallbackFormat="short" />
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                                <span className="font-black text-base text-black">{fixture.teams.home.name}</span>
                              </div>
                              <span className="font-mono text-sm font-black text-black bg-white px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">VS</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                                <span className="font-black text-base text-black">{fixture.teams.away.name}</span>
                              </div>
                              <span className="font-mono text-xs font-black text-black uppercase tracking-widest bg-[#a3e635] px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
                                {fixture.fixture.status.short}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-end">
                          <span className="text-xs font-black text-black flex items-center gap-1">
                            View Preview & Lineups <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
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
                    <h3 className="text-base font-black uppercase tracking-wider text-black flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#fda4af] border border-black inline-block" />
                      <Flame className="w-4 h-4 stroke-[2.5]" /> Recent Results
                    </h3>
                    <span className="text-xs font-black text-black bg-[#fda4af] px-2.5 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">{displayedRecent.length} matches</span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {displayedRecent.map((fixture: any) => {
                      const isLogged = ratings.some(r => String(r.match.externalId) === String(fixture.fixture.id))
                      const userRating = ratings.find(r => String(r.match.externalId) === String(fixture.fixture.id))

                      return (
                        <Link
                          key={fixture.fixture.id}
                          href={`/match/${fixture.fixture.id}`}
                          className="bg-white border-[2.5px] border-black rounded-3xl p-5 transition-all flex flex-col justify-between group shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000]"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-black mb-4 pb-3 border-b-2 border-black font-black">
                              <span className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-black stroke-[2.5]" /> {fixture.league.name}
                              </span>
                              <span className="font-mono bg-[#f3e8ff] px-2.5 py-1 rounded-xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
                                <FormattedDate date={fixture.fixture.date} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                                  <span className="font-black text-base text-black">{fixture.teams.home.name}</span>
                                </div>
                                <span className="font-mono text-xl font-black text-white bg-[#18181b] px-3 py-0.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                  {fixture.goals.home ?? '-'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                                  <span className="font-black text-base text-black">{fixture.teams.away.name}</span>
                                </div>
                                <span className="font-mono text-xl font-black text-white bg-[#18181b] px-3 py-0.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                  {fixture.goals.away ?? '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-between">
                            {isLogged && userRating ? (
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5 bg-[#fef9c3] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const isFull = star <= userRating.stars;
                                    const isHalf = !isFull && (star - 1 < userRating.stars);
                                    return (
                                      <div key={star} className="relative w-3.5 h-3.5">
                                        <Star
                                          className={`w-3.5 h-3.5 absolute inset-0 stroke-[2] ${isFull || isHalf ? 'drop-shadow-[1px_1px_0px_#000]' : ''} ${isFull ? 'fill-amber-400 text-black' : 'fill-white text-black'}`}
                                        />
                                        {isHalf && (
                                          <Star
                                            className="w-3.5 h-3.5 absolute inset-0 stroke-[2] fill-amber-400 text-black drop-shadow-[1px_1px_0px_#000] z-10"
                                            style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                                <span className="text-xs font-black bg-[#a3e635] text-black border border-black px-2 py-0.5 rounded-md shadow-[1px_1px_0px_0px_#000]">
                                  Logged
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-black text-black flex items-center gap-1 bg-[#fde047] px-2.5 py-1 rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-black stroke-[2] drop-shadow-[1px_1px_0px_#000]" /> Rate & Review <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                            <span className="text-[11px] text-black uppercase tracking-widest font-black bg-zinc-100 px-2 py-0.5 rounded border border-black">{fixture.fixture.status.short}</span>
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
            <div className="bg-[#f3e8ff] border-[3px] border-black rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[6px_6px_0px_0px_#000]">
              <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] mb-4">
                <Trophy className="w-10 h-10 text-black stroke-[2]" />
              </div>
              <h2 className="text-2xl font-black text-black mb-2">No matches logged yet</h2>
              <p className="text-zinc-700 font-bold mb-6 max-w-sm">
                Keep track of the matches you&apos;ve watched, rate them, and write your thoughts.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#a3e635] hover:bg-[#84cc16] text-black font-black border-2 border-black rounded-2xl px-6 py-3 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                Find a match <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {ratings.map((rating) => (
                <Link
                  key={rating.id}
                  href={`/match/${rating.match.externalId}`}
                  className="bg-[#f3e8ff] border-[2.5px] border-black rounded-3xl overflow-hidden hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex flex-col group shadow-[5px_5px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000]"
                >
                  <div className="p-5 flex flex-col gap-4 bg-white border-b-2 border-black">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={rating.match.homeTeam.logoUrl} name={rating.match.homeTeam.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                        <span className="font-black text-base text-black line-clamp-1">{rating.match.homeTeam.name}</span>
                      </div>
                      <div className="font-mono text-xl font-black text-white px-2.5 py-0.5 rounded-xl shrink-0 w-11 text-center bg-[#18181b] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {rating.match.homeScore ?? '-'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TeamLogo src={rating.match.awayTeam.logoUrl} name={rating.match.awayTeam.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                        <span className="font-black text-base text-black line-clamp-1">{rating.match.awayTeam.name}</span>
                      </div>
                      <div className="font-mono text-xl font-black text-white px-2.5 py-0.5 rounded-xl shrink-0 w-11 text-center bg-[#18181b] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {rating.match.awayScore ?? '-'}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 bg-white px-2.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFull = star <= rating.stars;
                          const isHalf = !isFull && (star - 1 < rating.stars);
                          return (
                            <div key={star} className="relative w-4 h-4">
                              <Star
                                className={`w-4 h-4 absolute inset-0 stroke-[2] ${isFull || isHalf ? 'drop-shadow-[1px_1px_0px_#000]' : ''} ${isFull ? 'fill-amber-400 text-black' : 'fill-white text-black'}`}
                              />
                              {isHalf && (
                                <Star
                                  className="w-4 h-4 absolute inset-0 stroke-[2] fill-amber-400 text-black drop-shadow-[1px_1px_0px_#000] z-10"
                                  style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <span className="text-xs font-black text-black uppercase tracking-widest bg-white px-2.5 py-1 rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">
                        <FormattedDate date={rating.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                      </span>
                    </div>
                    {rating.manOfTheMatch && (
                      <div className="text-xs font-black text-black bg-[#a3e635] border-2 border-black px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#000] inline-block mb-1">
                        🏅 MotM: {rating.manOfTheMatch}
                      </div>
                    )}
                    {rating.review && (
                      <p className="text-sm text-black font-bold line-clamp-2 leading-relaxed bg-white p-3.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        &ldquo;{rating.review}&rdquo;
                      </p>
                    )}
                    {Array.isArray(rating.tags) && rating.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {rating.tags.map((tag: string) => (
                          <span key={tag} className="text-[11px] font-black px-2.5 py-1 rounded-full bg-[#fde047] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] uppercase tracking-wider">
                            #{tag}
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
