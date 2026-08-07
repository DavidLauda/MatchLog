'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'

interface StattyProps {
  ratings: any[]
}

export function Statty({ ratings }: StattyProps) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const message = useMemo(() => {
    if (ratings.length === 0) {
      return "Fweet! I'm Statty! Start logging matches and I'll analyze your watching habits right here!"
    }

    let totalGoals = 0
    let totalStars = 0
    let teamCounts: Record<string, number> = {}

    ratings.forEach((r) => {
      // Sum goals
      const homeScore = r.match.homeScore || 0
      const awayScore = r.match.awayScore || 0
      totalGoals += (homeScore + awayScore)

      // Sum stars
      totalStars += r.stars

      // Count teams
      const homeName = r.match.homeTeam?.name
      const awayName = r.match.awayTeam?.name
      
      if (homeName) teamCounts[homeName] = (teamCounts[homeName] || 0) + 1
      if (awayName) teamCounts[awayName] = (teamCounts[awayName] || 0) + 1
    })

    const avgRating = (totalStars / ratings.length).toFixed(1)
    
    let favoriteTeam = ''
    let maxTeamCount = 0
    Object.entries(teamCounts).forEach(([team, count]) => {
      if (count > maxTeamCount) {
        maxTeamCount = count
        favoriteTeam = team
      }
    })

    // Randomize messages if there's enough data
    const messages = []

    if (ratings.length > 0) {
      messages.push(`Fweet! You've logged ${ratings.length} matches! Keep up the good work!`)
    }

    if (ratings.length >= 2) {
      messages.push(`Fweet! Your average match rating is ${avgRating} stars! ${parseFloat(avgRating) >= 4.0 ? 'You really know how to pick an absolute cinema of a match!' : 'Are you watching boring games lately?'}`)
      
      messages.push(`Fweet! In ${ratings.length} matches, you've witnessed ${totalGoals} goals! That's an average of ${(totalGoals / ratings.length).toFixed(1)} goals per game!`)
    }

    if (maxTeamCount >= 2) {
      messages.push(`Fweet! You've watched ${favoriteTeam} ${maxTeamCount} times! Are you trying to get scouted by them?`)
    }

    // Stable rendering for SSR
    if (!isClient) return messages[0];
    
    return messages[Math.floor(Math.random() * messages.length)]
  }, [ratings, isClient])

  if (ratings.length === 0) return null;

  return (
    <div className="bg-[#fde047] border-[3px] border-black rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_#000] flex flex-col sm:flex-row items-center gap-6 sm:gap-10 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Mascot Image */}
      <div className="relative w-36 h-36 sm:w-48 sm:h-48 shrink-0 hover:scale-110 hover:-rotate-3 transition-transform cursor-pointer drop-shadow-[5px_5px_0px_rgba(0,0,0,1)] -ml-2 sm:-ml-4">
        <Image
          src="/mascot.png"
          alt="Statty the Whistle Mascot"
          fill
          className="object-contain scale-[1.75] sm:scale-[2.0]"
          onError={(e) => {
            // Fallback if image doesn't exist
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1 w-full">
        {/* Triangle for speech bubble tail */}
        <div className="hidden sm:block absolute -left-4 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[12px] border-y-transparent border-r-[16px] border-r-black z-0"></div>
        <div className="hidden sm:block absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[10px] border-y-transparent border-r-[14px] border-r-white z-10"></div>
        
        {/* Mobile tail */}
        <div className="sm:hidden absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-x-transparent border-b-[16px] border-b-black z-0"></div>
        <div className="sm:hidden absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-b-[14px] border-b-white z-10"></div>

        <div className="bg-white border-[3px] border-black rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000] relative z-20">
          <p className="text-black font-black text-lg sm:text-xl leading-snug">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
