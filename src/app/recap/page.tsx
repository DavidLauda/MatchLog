import prisma from '@/lib/prisma'
import { SeasonRecap } from '@/components/SeasonRecap'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUserFromSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RecapPage() {
  const user = await getUserFromSession()
  if (!user) {
    redirect('/login')
  }

  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true
        }
      }
    },
    orderBy: { watchedAt: 'desc' }
  })

  if (ratings.length === 0) {
    return (
      <div className="min-h-screen bg-[#18181b] flex flex-col items-center justify-center p-6 space-y-6">
        <h1 className="text-3xl font-black text-white text-center">No Data to Recap Yet!</h1>
        <p className="text-zinc-400 max-w-sm text-center">You need to log some matches before generating your All-Time Recap.</p>
        <Link href="/" className="bg-[#a3e635] text-black font-black px-6 py-3 rounded-2xl border-2 border-black flex items-center gap-2 shadow-[4px_4px_0px_0px_#a3e635]">
          <ArrowLeft className="w-5 h-5" /> Go Back
        </Link>
      </div>
    )
  }

  // Aggregate Data
  const totalMatches = ratings.length
  let totalGoals = 0
  let total0_0s = 0
  let totalStars = 0

  const teamCounts: Record<string, { count: number, name: string, logo: string | null }> = {}
  const tagCounts: Record<string, number> = {}

  ratings.forEach(r => {
    const home = r.match.homeScore ?? 0
    const away = r.match.awayScore ?? 0
    totalGoals += (home + away)
    if (home === 0 && away === 0) total0_0s++
    
    totalStars += r.stars

    if (!teamCounts[r.match.homeTeam.id]) teamCounts[r.match.homeTeam.id] = { count: 0, name: r.match.homeTeam.name, logo: r.match.homeTeam.logoUrl }
    if (!teamCounts[r.match.awayTeam.id]) teamCounts[r.match.awayTeam.id] = { count: 0, name: r.match.awayTeam.name, logo: r.match.awayTeam.logoUrl }
    
    teamCounts[r.match.homeTeam.id].count++
    teamCounts[r.match.awayTeam.id].count++

    if (Array.isArray(r.tags)) {
      r.tags.forEach((t: string) => {
        const clean = t.trim().toLowerCase()
        if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1
      })
    }
  })

  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0])
  const topTeam = Object.values(teamCounts).sort((a, b) => b.count - a.count)[0]
  const avgRating = totalMatches > 0 ? totalStars / totalMatches : 0
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0'

  const highestRatedMatch = [...ratings].sort((a, b) => b.stars - a.stars)[0]

  // Determine Persona
  let persona = "The Groundhopper"
  let personaDesc = "You just love the beautiful game, watching whatever is on and soaking in the atmosphere."
  
  if (total0_0s > 2 && total0_0s / totalMatches > 0.1) {
    persona = "The Tactics Nerd"
    personaDesc = "You appreciate the dark arts. A 0-0 draw isn't boring, it's a defensive masterclass."
  } else if (avgRating >= 4.2) {
    persona = "The Optimist"
    personaDesc = "Every game is a classic in your eyes. You see the best in every 90 minutes."
  } else if (avgRating <= 2.5) {
    persona = "The Purist (or Hater)"
    personaDesc = "Standards are high. If it's not prime Barcelona 2011, you are NOT impressed."
  } else if (topTeam && topTeam.count > totalMatches * 0.4) {
    persona = "The Superfan"
    personaDesc = `You follow ${topTeam.name} religiously. Through thick and thin.`
  }

  const recapData = {
    totalMatches,
    totalGoals,
    avgGoals,
    topTeam: topTeam ? { name: topTeam.name, logo: topTeam.logo, count: topTeam.count } : null,
    topTags,
    highestRatedMatch: highestRatedMatch ? {
      homeTeam: highestRatedMatch.match.homeTeam.name,
      awayTeam: highestRatedMatch.match.awayTeam.name,
      stars: highestRatedMatch.stars,
      review: highestRatedMatch.review
    } : null,
    persona,
    personaDesc
  }

  return <SeasonRecap data={recapData} />
}
