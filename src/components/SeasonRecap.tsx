'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Trophy, Flame, Hash, Sparkles, Star, ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { TeamLogo } from './TeamLogo'

interface RecapData {
  totalMatches: number
  totalGoals: number
  avgGoals: string
  topTeam: { name: string, logo: string | null, count: number } | null
  topTags: string[]
  highestRatedMatch: { homeTeam: string, awayTeam: string, stars: number, review: string | null } | null
  persona: string
  personaDesc: string
}

export function SeasonRecap({ data }: { data: RecapData }) {
  const [slide, setSlide] = useState(0)

  const nextSlide = () => {
    if (slide < 5) setSlide(s => s + 1)
  }

  const prevSlide = () => {
    if (slide > 0) setSlide(s => s - 1)
  }

  // Slide definitions
  const slides = [
    // Slide 0: Intro
    (
      <div key="slide-0" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, delay: 0.2 }}
          className="w-24 h-24 bg-[#a3e635] border-[3px] border-black rounded-3xl shadow-[4px_4px_0px_0px_#000] flex items-center justify-center mb-4"
        >
          <Trophy className="w-12 h-12 text-black stroke-[2]" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-6xl font-black text-black leading-tight"
        >
          Your All-Time<br/>MatchLog
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl font-bold text-black bg-white px-6 py-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000]"
        >
          You logged <span className="text-[#ec4899] font-black text-3xl mx-1">{data.totalMatches}</span> matches.
        </motion.p>
      </div>
    ),
    // Slide 1: Goals
    (
      <div key="slide-1" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-6">
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-[#fde047] border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_#000] flex items-center justify-center"
        >
          <Flame className="w-10 h-10 text-black stroke-[2.5]" />
        </motion.div>
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-5xl font-black text-black"
        >
          That&apos;s a lot of nets bulging.
        </motion.h2>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white border-[3px] border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_#000] w-full max-w-sm"
        >
          <div className="text-6xl font-black text-[#ec4899] mb-2">{data.totalGoals}</div>
          <div className="text-lg font-black uppercase tracking-widest text-black mb-4">Total Goals</div>
          <div className="bg-[#f3e8ff] px-4 py-2 rounded-xl border-2 border-black inline-block font-bold text-black shadow-[2px_2px_0px_0px_#000]">
            Avg {data.avgGoals} goals/game
          </div>
        </motion.div>
      </div>
    ),
    // Slide 2: Top Team
    (
      <div key="slide-2" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-6">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black text-black"
        >
          You couldn&apos;t look away from...
        </motion.h2>
        
        {data.topTeam ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="bg-[#dcfce7] border-[3px] border-black rounded-[3rem] p-10 shadow-[8px_8px_0px_0px_#000] flex flex-col items-center w-full max-w-sm"
          >
            <div className="bg-white p-4 rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-6">
              <TeamLogo src={data.topTeam.logo} name={data.topTeam.name} className="w-24 h-24 object-contain" />
            </div>
            <div className="text-4xl font-black text-black mb-3">{data.topTeam.name}</div>
            <div className="text-sm font-black text-black uppercase tracking-wider bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              Watched {data.topTeam.count} times
            </div>
          </motion.div>
        ) : (
          <div className="text-2xl font-black text-black">No top team yet!</div>
        )}
      </div>
    ),
    // Slide 3: Vibe/Tags & Top Match
    (
      <div key="slide-3" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-6 w-full max-w-2xl mx-auto">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-black text-black mb-4"
        >
          The absolute peak.
        </motion.h2>

        {data.highestRatedMatch && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000] w-full relative"
          >
            <div className="absolute -top-4 -right-4 bg-[#fde047] border-2 border-black p-2 rounded-2xl shadow-[2px_2px_0px_0px_#000] rotate-12">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Highest Rated Match</div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-xl md:text-2xl font-black text-black">{data.highestRatedMatch.homeTeam}</span>
              <span className="text-sm font-black text-white bg-black px-2 py-1 rounded border-2 border-black">VS</span>
              <span className="text-xl md:text-2xl font-black text-black">{data.highestRatedMatch.awayTeam}</span>
            </div>

            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-6 h-6 stroke-[2] ${i < data.highestRatedMatch!.stars ? 'fill-amber-400 text-black drop-shadow-[2px_2px_0px_#000]' : 'fill-white text-zinc-300'}`} />
              ))}
            </div>

            {data.highestRatedMatch.review && (
              <p className="text-sm md:text-base font-bold text-black italic bg-zinc-100 p-4 rounded-xl border-2 border-black">
                &ldquo;{data.highestRatedMatch.review}&rdquo;
              </p>
            )}
          </motion.div>
        )}

        {data.topTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            <span className="text-sm font-black w-full mb-1 text-black">Your top tags:</span>
            {data.topTags.map((tag, i) => (
              <span key={tag} className="bg-[#c4b5fd] text-black font-black px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase text-sm flex items-center gap-1 rotate-[random(-2,2)deg]">
                <Hash className="w-4 h-4" /> {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    ),
    // Slide 4: Persona
    (
      <div key="slide-4" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-xs font-black uppercase tracking-widest text-black bg-white px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000] mb-4"
        >
          Your Football Persona
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tighter"
        >
          {data.persona}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl font-bold text-black bg-white p-6 rounded-3xl border-[3px] border-black shadow-[6px_6px_0px_0px_#000] max-w-md"
        >
          {data.personaDesc}
        </motion.p>
      </div>
    ),
    // Slide 5: Summary Card
    (
      <div key="slide-5" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#fef9c3] border-[4px] border-black rounded-[2rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_#000] w-full max-w-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-4 bg-[#a3e635] border-b-[4px] border-black"></div>
          
          <h2 className="text-3xl font-black text-black mb-6 uppercase tracking-tight mt-2">MatchLog Recap</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <span className="font-bold text-zinc-600">Matches</span>
              <span className="font-black text-xl text-black">{data.totalMatches}</span>
            </div>
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <span className="font-bold text-zinc-600">Goals</span>
              <span className="font-black text-xl text-black">{data.totalGoals}</span>
            </div>
            {data.topTeam && (
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-bold text-zinc-600">Top Club</span>
                <span className="font-black text-lg text-black">{data.topTeam.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-zinc-600">Persona</span>
              <span className="font-black text-lg text-[#ec4899]">{data.persona}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link href="/profile" className="text-black font-black flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:bg-zinc-100 transition-all active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_#000]">
            Exit Recap <X className="w-5 h-5 stroke-[3]" />
          </Link>
        </motion.div>
      </div>
    )
  ]

  const bgColors = [
    'bg-[#f3e8ff]', // purple-ish
    'bg-[#dcfce7]', // green-ish
    'bg-[#fef9c3]', // yellow-ish
    'bg-[#fda4af]', // rose-ish
    'bg-[#93c5fd]', // blue-ish
    'bg-white'      // white end
  ]

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${bgColors[slide]} transition-colors duration-700`}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full flex gap-1 p-4 z-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden border border-black/20">
            <motion.div 
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: slide >= i ? '100%' : '0%' }}
              transition={{ duration: slide === i ? 0.3 : 0 }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-8 right-6 z-10">
        <Link href="/profile" className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:bg-zinc-100">
          <X className="w-5 h-5 text-black stroke-[2.5]" />
        </Link>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative cursor-pointer" onClick={nextSlide}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {slides[slide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hint */}
      {slide < 5 && (
        <div className="absolute bottom-8 left-0 w-full flex justify-center text-black/50 font-black text-sm uppercase tracking-widest gap-2 animate-pulse pointer-events-none">
          Tap to continue <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}
