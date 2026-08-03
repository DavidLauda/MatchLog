import { getFixtureDetails, getLineups } from '@/lib/thesportsdb'
import prisma from '@/lib/prisma'
import { logMatchRating, deleteMatchRating, addMatchToList, checkIsFollowing, getOrFetchMatchStats } from '@/app/actions'
import { StarRating } from '@/components/StarRating'
import { FollowButton } from '@/components/FollowButton'
import { TeamLogo } from '@/components/TeamLogo'
import { FormattedDate } from '@/components/FormattedDate'
import { TagSelector } from '@/components/TagSelector'
import Link from 'next/link'
import { ArrowLeft, Trash2, Star, MessageSquareQuote } from 'lucide-react'

function getCommunityReviews(matchId: string, details: any, realOtherRatings: any[]) {
  if (realOtherRatings && realOtherRatings.length > 0) {
    return realOtherRatings
  }

  const hash = matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const homeName = details?.teams?.home?.name || 'Home Team'
  const awayName = details?.teams?.away?.name || 'Away Team'
  const compName = details?.league?.name || 'League'
  
  const sampleUsers = [
    { username: 'tactic_master99', avatarBg: 'from-blue-500 to-indigo-600' },
    { username: 'elena_stadium', avatarBg: 'from-emerald-500 to-teal-600' },
    { username: 'matchday_mike', avatarBg: 'from-amber-500 to-orange-600' },
    { username: 'gunner_sarah', avatarBg: 'from-purple-500 to-pink-600' },
    { username: 'tiki_taka_tom', avatarBg: 'from-rose-500 to-red-600' },
  ]

  const sampleReviews = [
    {
      stars: 5,
      review: `What a battle between ${homeName} and ${awayName}! The tactical adjustments in the second half really opened up the game. Best 90 minutes of football I've watched all month.`,
      tags: ['thriller', 'tactical', 'must-watch'],
    },
    {
      stars: 4,
      review: `Atmosphere was absolutely electric today! Very competitive fixture in ${compName}. Both defenses played well despite the constant attacking pressure.`,
      tags: ['atmosphere', 'competitive', 'high-tempo'],
    },
    {
      stars: 4,
      review: `End-to-end action from start to finish! A few controversial refereeing decisions in midfield, but you can't deny the sheer quality on display.`,
      tags: ['drama', 'end-to-end', 'controversial'],
    },
    {
      stars: 5,
      review: `Absolute cinema. If you missed this live, you need to watch the extended highlights immediately. World class performances all over the pitch.`,
      tags: ['masterclass', 'classic', 'cinema'],
    },
  ]

  const user1 = sampleUsers[(hash) % sampleUsers.length]
  const user2 = sampleUsers[(hash + 1) % sampleUsers.length]
  const user3 = sampleUsers[(hash + 2) % sampleUsers.length]

  const rev1 = sampleReviews[(hash) % sampleReviews.length]
  const rev2 = sampleReviews[(hash + 1) % sampleReviews.length]
  const rev3 = sampleReviews[(hash + 2) % sampleReviews.length]

  const baseDate = new Date(details?.fixture?.date || Date.now())

  return [
    {
      id: `mock-1-${matchId}`,
      stars: rev1.stars,
      review: rev1.review,
      tags: rev1.tags,
      watchedAt: new Date(baseDate.getTime() + 1000 * 60 * 60 * 2),
      user: { username: user1.username, avatarBg: user1.avatarBg },
    },
    {
      id: `mock-2-${matchId}`,
      stars: rev2.stars,
      review: rev2.review,
      tags: rev2.tags,
      watchedAt: new Date(baseDate.getTime() + 1000 * 60 * 60 * 12),
      user: { username: user2.username, avatarBg: user2.avatarBg },
    },
    {
      id: `mock-3-${matchId}`,
      stars: rev3.stars,
      review: rev3.review,
      tags: rev3.tags,
      watchedAt: new Date(baseDate.getTime() + 1000 * 60 * 60 * 24),
      user: { username: user3.username, avatarBg: user3.avatarBg },
    },
  ]
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const match = await prisma.match.findUnique({
    where: { externalId: id },
    include: { 
      homeTeam: true,
      awayTeam: true,
      ratings: {
        include: { user: true },
        orderBy: { watchedAt: 'desc' }
      } 
    } 
  })

  const user = await prisma.user.findFirst()
  const lists = user ? await prisma.matchList.findMany({ where: { userId: user.id } }) : []

  let [details, lineups] = await Promise.all([
    getFixtureDetails(id),
    getLineups(id),
  ])

  let isHomeFollowed = false
  let isAwayFollowed = false
  if (details) {
    [isHomeFollowed, isAwayFollowed] = await Promise.all([
      checkIsFollowing(details.teams.home.id, 'club'),
      checkIsFollowing(details.teams.away.id, 'club')
    ])
  }

  // If match exists in DB, check if API data matches or is missing. If mismatch/missing, use local DB data (legacy match fallback).
  if (match) {
    if (!details || (details.teams.home.name !== match.homeTeam.name && details.teams.away.name !== match.awayTeam.name)) {
      details = {
        fixture: {
          id: match.externalId,
          date: match.matchDate.toISOString(),
          status: { short: 'FT' },
          venue: { name: 'Unknown Venue', city: '' },
          referee: 'Unknown'
        },
        league: {
          name: match.competition || 'Unknown',
          season: ''
        },
        teams: {
          home: {
            id: match.homeTeamId,
            name: match.homeTeam.name,
            logo: match.homeTeam.logoUrl
          },
          away: {
            id: match.awayTeamId,
            name: match.awayTeam.name,
            logo: match.awayTeam.logoUrl
          }
        },
        goals: {
          home: match.homeScore,
          away: match.awayScore
        }
      }
      lineups = []
      
      const [homeF, awayF] = await Promise.all([
        checkIsFollowing(match.homeTeamId, 'club'),
        checkIsFollowing(match.awayTeamId, 'club')
      ])
      isHomeFollowed = homeF
      isAwayFollowed = awayF
    }
  }
  
  if (!details) {
    return (
      <div className="text-center py-20 bg-white border-[3px] border-black rounded-3xl p-12 shadow-[6px_6px_0px_0px_#000]">
        <h1 className="text-2xl font-black text-black mb-4">Match not found</h1>
        <Link href="/search" className="retro-btn-primary">
          Search for matches
        </Link>
      </div>
    )
  }

  const homeLineup = lineups.filter((l: any) => l.strHome === "Yes").sort((a: any, b: any) => parseInt(a.intSquadNumber || '0') - parseInt(b.intSquadNumber || '0'))
  const awayLineup = lineups.filter((l: any) => l.strHome === "No").sort((a: any, b: any) => parseInt(a.intSquadNumber || '0') - parseInt(b.intSquadNumber || '0'))

  let stats: any[] = []
  if (details) {
    stats = await getOrFetchMatchStats(id, details.fixture.date, details.teams.home.name, details.teams.away.name)
  }

  const homeStats = stats.find(s => s.team.name.toLowerCase() === details.teams.home.name.toLowerCase())?.statistics || stats[0]?.statistics || [];
  const awayStats = stats.find(s => s.team.name.toLowerCase() === details.teams.away.name.toLowerCase())?.statistics || stats[1]?.statistics || [];

  const combinedStats = homeStats.map((hs: any, index: number) => {
    const as = awayStats[index];
    return {
      type: hs.type,
      homeValue: hs.value !== null ? hs.value : '-',
      awayValue: as?.value !== null ? as?.value : '-'
    }
  }).filter((s: any) => s.homeValue !== '-' || s.awayValue !== '-');

  const existingRating = match?.ratings?.find((r: any) => r.userId === user?.id)
  const realOtherRatings = match?.ratings?.filter((r: any) => r.userId !== user?.id) || []
  const communityReviews = getCommunityReviews(id, details, realOtherRatings)

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-black hover:underline decoration-2 transition-all">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Back to Diary
        </Link>
      </div>
      
      <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[6px_6px_0px_0px_#000]">
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo src={details.teams.home.logo} name={details.teams.home.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-md" fallbackClassName="w-24 h-24 sm:w-32 sm:h-32 text-3xl font-black" />
            <h2 className="text-xl sm:text-2xl font-black text-black text-center">{details.teams.home.name}</h2>
            <FollowButton
              externalId={details.teams.home.id}
              name={details.teams.home.name}
              type="club"
              logoUrl={details.teams.home.logo}
              initialIsFollowing={isHomeFollowed}
              size="sm"
              variant="pill"
            />
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-black tracking-widest text-black bg-white px-3 py-1 rounded-full border-2 border-black uppercase shadow-[1px_1px_0px_0px_#000]">
              {details.fixture.status.short}
            </div>
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-tighter bg-[#18181b] text-white px-6 py-2 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]">
              {details.goals.home ?? '-'} : {details.goals.away ?? '-'}
            </div>
            <div className="text-sm text-black font-black bg-white/80 px-3 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
              <FormattedDate date={details.fixture.date} fallbackFormat="short" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo src={details.teams.away.logo} name={details.teams.away.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-md" fallbackClassName="w-24 h-24 sm:w-32 sm:h-32 text-3xl font-black" />
            <h2 className="text-xl sm:text-2xl font-black text-black text-center">{details.teams.away.name}</h2>
            <FollowButton
              externalId={details.teams.away.id}
              name={details.teams.away.name}
              type="club"
              logoUrl={details.teams.away.logo}
              initialIsFollowing={isAwayFollowed}
              size="sm"
              variant="pill"
            />
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000]">
            <h3 className="text-lg font-black text-black mb-4">{existingRating ? 'Your Rating' : 'Log Match'}</h3>
            
            <form action={logMatchRating} className="space-y-4">
              <input type="hidden" name="matchId" value={id} />
              
              <div>
                <label className="block text-sm font-black text-black mb-2">Rating</label>
                <div className="bg-[#fef9c3] p-3 rounded-2xl border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">
                  <StarRating initialRating={existingRating?.stars || 0} />
                </div>
              </div>
              
              <div>
                <label htmlFor="review" className="block text-sm font-black text-black mb-2">Review (optional)</label>
                <textarea 
                  name="review" 
                  id="review"
                  rows={3}
                  defaultValue={existingRating?.review || ''}
                  placeholder="What did you think of the match?"
                  className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all resize-none text-sm"
                ></textarea>
              </div>
              
              <div>
                <TagSelector initialTags={existingRating?.tags || []} />
              </div>

              
              <div className="flex gap-3 pt-2">
                <button type="submit" className="w-full retro-btn-primary py-3">
                  {existingRating ? 'Update Rating' : 'Log Match'}
                </button>
              </div>
            </form>

            {existingRating && (
              <form action={async () => {
                'use server'
                await deleteMatchRating(existingRating.id)
              }} className="mt-3">
                <button type="submit" className="w-full bg-[#fda4af] hover:bg-red-400 text-black font-black border-2 border-black rounded-2xl py-2.5 px-4 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Trash2 className="w-4 h-4 stroke-[2.5]" />
                  Remove Log
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 space-y-4 shadow-[5px_5px_0px_0px_#000]">
            <h3 className="text-lg font-black text-black mb-4">Match Details</h3>
            
            <div className="flex justify-between py-2 border-b-2 border-black">
              <span className="text-zinc-600 font-bold">Competition</span>
              <span className="font-black text-black text-right">{details.league.name}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b-2 border-black">
              <span className="text-zinc-600 font-bold">Season</span>
              <span className="font-black text-black text-right">{details.league.season}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b-2 border-black">
              <span className="text-zinc-600 font-bold">Venue</span>
              <span className="font-black text-black text-right">{details.fixture.venue?.name}, {details.fixture.venue?.city}</span>
            </div>
            

          </div>

          {combinedStats && combinedStats.length > 0 && (
            <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 space-y-4 shadow-[5px_5px_0px_0px_#000]">
              <h3 className="text-lg font-black text-black mb-4">Match Statistics</h3>
              <div className="space-y-3">
                {combinedStats.map((stat: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b-2 border-black text-sm">
                    <span className="w-12 text-center font-black text-black bg-[#fef9c3] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">{stat.homeValue}</span>
                    <span className="flex-1 text-center font-bold text-black">{stat.type}</span>
                    <span className="w-12 text-center font-black text-black bg-[#fef9c3] px-2 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">{stat.awayValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {match && lists.length > 0 && (
            <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000]">
              <h3 className="text-lg font-black text-black mb-4">Add to List</h3>
              <form action={async (formData) => {
                'use server'
                const listId = formData.get('listId') as string
                if (listId) await addMatchToList(listId, match.id)
              }} className="flex gap-2">
                <select name="listId" className="flex-1 bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all text-sm">
                  <option value="">Select a list...</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.title}</option>
                  ))}
                </select>
                <button type="submit" className="retro-btn-dark">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {lineups && lineups.length > 0 && (
        <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 space-y-6 shadow-[5px_5px_0px_0px_#000]">
          <h3 className="text-lg font-black text-black">Lineups</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team */}
            <div className="space-y-4">
              <div className="font-black text-center border-b-2 border-black pb-2 text-black bg-[#dcfce7] py-1 rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">{details.teams.home.name}</div>
              <div className="space-y-3">
                {homeLineup.map((player: any) => (
                  <div key={player.idLineup} className="flex items-center gap-3 text-sm">
                    {player.strCutout || player.strThumb ? (
                      <img src={player.strCutout || player.strThumb} alt={player.strPlayer} className="w-8 h-8 rounded-full object-cover border-2 border-black bg-white shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#fde047] border-2 border-black flex items-center justify-center text-xs font-black text-black shrink-0 shadow-sm">
                        {player.intSquadNumber || '-'}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-black text-black truncate">{player.strPlayer}</span>
                      <span className="text-xs text-zinc-600 font-bold truncate">{player.strPosition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-4">
              <div className="font-black text-center border-b-2 border-black pb-2 text-black bg-[#f3e8ff] py-1 rounded-xl border border-black shadow-[2px_2px_0px_0px_#000]">{details.teams.away.name}</div>
              <div className="space-y-3">
                {awayLineup.map((player: any) => (
                  <div key={player.idLineup} className="flex items-center gap-3 text-sm flex-row-reverse text-right">
                    {player.strCutout || player.strThumb ? (
                      <img src={player.strCutout || player.strThumb} alt={player.strPlayer} className="w-8 h-8 rounded-full object-cover border-2 border-black bg-white shrink-0 shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#fde047] border-2 border-black flex items-center justify-center text-xs font-black text-black shrink-0 shadow-sm">
                        {player.intSquadNumber || '-'}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-black text-black truncate">{player.strPlayer}</span>
                      <span className="text-xs text-zinc-600 font-bold truncate">{player.strPosition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_#000]">
        <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <MessageSquareQuote className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black text-black">Community Reviews</h3>
            <span className="text-xs bg-[#18181b] text-white border-2 border-black px-3 py-0.5 rounded-full font-black font-mono shadow-[2px_2px_0px_0px_#000]">
              {communityReviews.length}
            </span>
          </div>
          <span className="text-xs text-black font-black uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-black shadow-[1px_1px_0px_0px_#000]">What others thought</span>
        </div>

        <div className="space-y-4">
          {communityReviews.map((rev: any) => {
            const initials = (rev.user?.username || 'User').slice(0, 2).toUpperCase()

            return (
              <div 
                key={rev.id} 
                className="bg-white border-[2.5px] border-black rounded-3xl p-5 space-y-4 transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#000] group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#a3e635] border-2 border-black flex items-center justify-center text-black font-black text-sm shadow-[2px_2px_0px_0px_#000] shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="text-base font-black text-black flex items-center gap-1.5">
                        @{rev.user?.username || 'member'}
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] border border-black" title="Verified Fan" />
                      </div>
                      <div className="text-xs text-zinc-600 font-bold">
                        <FormattedDate date={rev.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-[#fef9c3] px-3 py-1.5 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFull = star <= rev.stars;
                      const isHalf = !isFull && (star - 1 < rev.stars);
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
                </div>

                {rev.review && (
                  <p className="text-sm text-black leading-relaxed bg-[#f3e8ff] p-4 rounded-2xl border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000]">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                )}

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {rev.tags.map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="text-xs font-black text-black bg-[#fde047] border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
