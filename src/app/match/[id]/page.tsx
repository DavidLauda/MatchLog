import { getFixtureDetails, getEventStats, getLineups } from '@/lib/thesportsdb'
import prisma from '@/lib/prisma'
import { logMatchRating, deleteMatchRating, addMatchToList, checkIsFollowing } from '@/app/actions'
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
      ratings: {
        include: { user: true },
        orderBy: { watchedAt: 'desc' }
      } 
    } 
  })

  const user = await prisma.user.findFirst()
  const lists = user ? await prisma.matchList.findMany({ where: { userId: user.id } }) : []

  const [details, stats, lineups, isHomeFollowed, isAwayFollowed] = await Promise.all([
    getFixtureDetails(id),
    getEventStats(id),
    getLineups(id),
    getFixtureDetails(id).then(d => d ? checkIsFollowing(d.teams.home.id, 'club') : false),
    getFixtureDetails(id).then(d => d ? checkIsFollowing(d.teams.away.id, 'club') : false)
  ])
  
  if (!details) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Match not found</h1>
        <Link href="/search" className="text-indigo-400 hover:underline">
          Search for matches
        </Link>
      </div>
    )
  }

  const homeLineup = lineups.filter((l: any) => l.strHome === "Yes").sort((a: any, b: any) => parseInt(a.intSquadNumber || '0') - parseInt(b.intSquadNumber || '0'))
  const awayLineup = lineups.filter((l: any) => l.strHome === "No").sort((a: any, b: any) => parseInt(a.intSquadNumber || '0') - parseInt(b.intSquadNumber || '0'))

  const existingRating = match?.ratings?.find((r: any) => r.userId === user?.id)
  const realOtherRatings = match?.ratings?.filter((r: any) => r.userId !== user?.id) || []
  const communityReviews = getCommunityReviews(id, details, realOtherRatings)

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Diary
        </Link>
      </div>
      
      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo src={details.teams.home.logo} name={details.teams.home.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl" fallbackClassName="w-24 h-24 sm:w-32 sm:h-32 text-3xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-center">{details.teams.home.name}</h2>
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
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              {details.fixture.status.short}
            </div>
            <div className="text-4xl sm:text-6xl font-black font-mono tracking-tighter bg-gradient-to-br from-white to-slate-400 text-transparent bg-clip-text">
              {details.goals.home ?? '-'} : {details.goals.away ?? '-'}
            </div>
            <div className="text-sm text-slate-400 font-medium">
              <FormattedDate date={details.fixture.date} fallbackFormat="short" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 flex-1">
            <TeamLogo src={details.teams.away.logo} name={details.teams.away.name} className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl" fallbackClassName="w-24 h-24 sm:w-32 sm:h-32 text-3xl" />
            <h2 className="text-xl sm:text-2xl font-bold text-center">{details.teams.away.name}</h2>
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
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4">{existingRating ? 'Your Rating' : 'Log Match'}</h3>
            
            <form action={logMatchRating} className="space-y-4">
              <input type="hidden" name="matchId" value={id} />
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
                <StarRating initialRating={existingRating?.stars || 0} />
              </div>
              
              <div>
                <label htmlFor="review" className="block text-sm font-medium text-slate-400 mb-2">Review (optional)</label>
                <textarea 
                  name="review" 
                  id="review"
                  rows={3}
                  defaultValue={existingRating?.review || ''}
                  placeholder="What did you think of the match?"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                ></textarea>
              </div>
              
              <div>
                <TagSelector initialTags={existingRating?.tags || []} />
              </div>

              
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                  {existingRating ? 'Update Rating' : 'Log Match'}
                </button>
              </div>
            </form>

            {existingRating && (
              <form action={async () => {
                'use server'
                await deleteMatchRating(existingRating.id)
              }} className="mt-3">
                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-medium py-2 px-4 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Remove Log
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold mb-4">Match Details</h3>
            
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Competition</span>
              <span className="font-medium text-right">{details.league.name}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Season</span>
              <span className="font-medium text-right">{details.league.season}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Venue</span>
              <span className="font-medium text-right">{details.fixture.venue?.name}, {details.fixture.venue?.city}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Referee</span>
              <span className="font-medium text-right">{details.fixture.referee || 'Unknown'}</span>
            </div>
          </div>

          {stats && stats.length > 0 && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-lg font-bold mb-4">Match Statistics</h3>
              <div className="space-y-3">
                {stats.map((stat: any) => (
                  <div key={stat.idStatistic} className="flex items-center justify-between py-2 border-b border-slate-800 text-sm">
                    <span className="w-12 text-center font-bold">{stat.intHome}</span>
                    <span className="flex-1 text-center text-slate-400">{stat.strStat}</span>
                    <span className="w-12 text-center font-bold">{stat.intAway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {match && lists.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-4">Add to List</h3>
              <form action={async (formData) => {
                'use server'
                const listId = formData.get('listId') as string
                if (listId) await addMatchToList(listId, match.id)
              }} className="flex gap-2">
                <select name="listId" className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                  <option value="">Select a list...</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.title}</option>
                  ))}
                </select>
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 rounded-xl transition-colors">
                  Add
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {lineups && lineups.length > 0 && (
        <div className="glass-panel p-6 space-y-6">
          <h3 className="text-lg font-bold">Lineups</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team */}
            <div className="space-y-4">
              <div className="font-bold text-center border-b border-slate-800 pb-2">{details.teams.home.name}</div>
              <div className="space-y-3">
                {homeLineup.map((player: any) => (
                  <div key={player.idLineup} className="flex items-center gap-3 text-sm">
                    {player.strCutout || player.strThumb ? (
                      <img src={player.strCutout || player.strThumb} alt={player.strPlayer} className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {player.intSquadNumber || '-'}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-slate-200 truncate">{player.strPlayer}</span>
                      <span className="text-xs text-slate-500 truncate">{player.strPosition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-4">
              <div className="font-bold text-center border-b border-slate-800 pb-2">{details.teams.away.name}</div>
              <div className="space-y-3">
                {awayLineup.map((player: any) => (
                  <div key={player.idLineup} className="flex items-center gap-3 text-sm flex-row-reverse text-right">
                    {player.strCutout || player.strThumb ? (
                      <img src={player.strCutout || player.strThumb} alt={player.strPlayer} className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                        {player.intSquadNumber || '-'}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-slate-200 truncate">{player.strPlayer}</span>
                      <span className="text-xs text-slate-500 truncate">{player.strPosition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">Community Reviews</h3>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold font-mono">
              {communityReviews.length}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">What others thought</span>
        </div>

        <div className="space-y-4">
          {communityReviews.map((rev: any) => {
            const avatarBg = rev.user?.avatarBg || 'from-indigo-500 to-purple-600'
            const initials = (rev.user?.username || 'User').slice(0, 2).toUpperCase()

            return (
              <div 
                key={rev.id} 
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-sm group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 border border-white/10`}>
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                        @{rev.user?.username || 'member'}
                        <span className="w-1 h-1 rounded-full bg-emerald-500" title="Verified Fan" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <FormattedDate date={rev.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} fallbackFormat="short" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800/80 shadow-inner">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.stars
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                            : 'fill-slate-800 text-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.review && (
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 font-normal">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                )}

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {rev.tags.map((tag: string, i: number) => (
                      <span 
                        key={i} 
                        className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg hover:bg-indigo-500/20 transition-colors"
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

