'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Star, StarHalf, Hash, TrendingUp, ArrowRight, Sparkles, 
  Calendar, Clock, Flame, Shield, Globe, User, Edit3, 
  Share2, Check, Filter, Award, Zap, Bookmark, List as ListIcon,
  MessageSquare, Heart, CheckCircle2, X
} from 'lucide-react'
import Link from 'next/link'
import { TeamLogo } from './TeamLogo'
import { FormattedDate } from './FormattedDate'
import { FollowButton } from './FollowButton'

interface ProfileDashboardProps {
  user: {
    id: string;
    username: string;
    email: string | null;
    createdAt: string;
  };
  ratings: any[];
  lists: any[];
  followedEntities: any[];
}

export function ProfileDashboard({ user, ratings, lists, followedEntities }: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'diary' | 'following' | 'lists'>('overview')
  const [activityFilter, setActivityFilter] = useState<'all' | 5 | 4 | 3>('all')
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [displayName, setDisplayName] = useState(user.username === 'demo_user' ? 'David' : user.username)
  const [bio, setBio] = useState('Tactical analyst & groundhopper. Logging every 90 minutes of magic, heartbreaks, and screamers.')
  const [favoriteClub, setFavoriteClub] = useState('Arsenal')

  useEffect(() => {
    const savedName = localStorage.getItem('matchlog_profile_name')
    const savedBio = localStorage.getItem('matchlog_profile_bio')
    const savedClub = localStorage.getItem('matchlog_profile_club')
    if (savedName) setDisplayName(savedName)
    if (savedBio) setBio(savedBio)
    if (savedClub) setFavoriteClub(savedClub)
  }, [])

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('matchlog_profile_name', displayName)
    localStorage.setItem('matchlog_profile_bio', bio)
    localStorage.setItem('matchlog_profile_club', favoriteClub)
    setIsEditing(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  // --- Stats Calculations ---
  const totalMatches = ratings.length
  const totalLists = lists.length
  const totalFollowed = followedEntities.length

  const avgRating = totalMatches > 0 
    ? (ratings.reduce((acc, r) => acc + r.stars, 0) / totalMatches).toFixed(1) 
    : '0.0'

  const totalGoalsWatched = ratings.reduce((acc, r) => {
    const home = r.match.homeScore ?? 0
    const away = r.match.awayScore ?? 0
    return acc + home + away
  }, 0)

  // Rating distribution (0.5 to 5 stars)
  const starCounts = { 5: 0, 4.5: 0, 4: 0, 3.5: 0, 3: 0, 2.5: 0, 2: 0, 1.5: 0, 1: 0, 0.5: 0 } as Record<number, number>
  ratings.forEach(r => {
    let s = Math.round(r.stars * 2) / 2
    if (s > 5) s = 5
    if (s < 0.5) s = 0.5
    starCounts[s] = (starCounts[s] || 0) + 1
  })

  // Most watched team
  const teamCounts: Record<string, { count: number, name: string, logoUrl: string | null, totalStars: number }> = {}
  ratings.forEach(r => {
    const home = r.match.homeTeam
    const away = r.match.awayTeam
    if (!teamCounts[home.id]) teamCounts[home.id] = { count: 0, name: home.name, logoUrl: home.logoUrl, totalStars: 0 }
    if (!teamCounts[away.id]) teamCounts[away.id] = { count: 0, name: away.name, logoUrl: away.logoUrl, totalStars: 0 }
    teamCounts[home.id].count++
    teamCounts[home.id].totalStars += r.stars
    teamCounts[away.id].count++
    teamCounts[away.id].totalStars += r.stars
  })
  const mostWatchedTeam = Object.values(teamCounts).sort((a, b) => b.count - a.count)[0]

  // Most watched competition
  const compCounts: Record<string, number> = {}
  ratings.forEach(r => {
    const c = r.match.competition || 'Friendly'
    compCounts[c] = (compCounts[c] || 0) + 1
  })
  const topCompetition = Object.entries(compCounts).sort((a, b) => b[1] - a[1])[0]

  // Most used tags
  const tagCounts: Record<string, number> = {}
  ratings.forEach(r => {
    if (Array.isArray(r.tags)) {
      r.tags.forEach((t: string) => {
        const clean = t.trim().toLowerCase()
        if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1
      })
    }
  })
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Highest rated match
  const topRatedMatch = [...ratings].sort((a, b) => b.stars - a.stars || new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())[0]

  const filteredRatings = ratings.filter(r => {
    if (activityFilter === 'all') return true
    return Math.round(r.stars) === activityFilter
  })

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HERO PROFILE BANNER (NEO-BRUTALIST STYLE) */}
      <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-[6px_6px_0px_0px_#000]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            
            {/* Avatar with status indicator */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#a3e635] border-[3px] border-black p-1 shadow-[4px_4px_0px_0px_#000]">
                <div className="w-full h-full bg-[#18181b] rounded-[20px] flex items-center justify-center font-black font-mono text-3xl sm:text-4xl text-white tracking-tighter">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#fde047] text-black p-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]" title="Online & Logging">
                <Sparkles className="w-4 h-4 fill-current stroke-[2.5]" />
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-2.5 max-w-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">{displayName}</h1>
                <span className="text-sm font-black text-black bg-[#fde047] px-3 py-0.5 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] font-mono">
                  @{user.username}
                </span>
                <span className="text-xs font-black uppercase tracking-wider bg-[#f3e8ff] text-black px-3 py-1 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-black stroke-[2.5]" /> Groundhopper VIP
                </span>
              </div>
              
              <p className="text-black font-bold text-sm sm:text-base leading-relaxed">
                {bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-black text-zinc-700 pt-1">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
                  <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Member since <FormattedDate date={user.createdAt} options={{ month: 'long', year: 'numeric' }} /></span>
                </div>
                {favoriteClub && (
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500 stroke-[2.5]" />
                    <span>Supports <strong className="text-black">{favoriteClub}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 text-black px-4 py-2.5 rounded-2xl text-sm font-black border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#000]"
            >
              <Edit3 className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-[#a3e635] hover:bg-[#84cc16] text-black px-4 py-2.5 rounded-2xl text-sm font-black border-2 border-black transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#000] relative"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_#000] relative space-y-6"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-4">
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-black stroke-[2.5]" /> Customize Profile
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-black hover:bg-white p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Bio / Football Motto</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">Favorite Club / Competition</label>
                  <input
                    type="text"
                    value={favoriteClub}
                    onChange={(e) => setFavoriteClub(e.target.value)}
                    placeholder="e.g. Arsenal, Real Madrid, Premier League"
                    className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-2xl text-sm font-black text-black bg-white hover:bg-zinc-100 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="retro-btn-primary px-6 py-2.5"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. STATS RIBBON (THE ELEVATED CORE METRICS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#fef9c3] border-[2.5px] border-black rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000] transition-all">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black">{totalMatches}</div>
            <div className="text-xs font-black text-zinc-700 uppercase tracking-wider">Matches Logged</div>
          </div>
        </div>

        <div className="bg-[#f3e8ff] border-[2.5px] border-black rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000] transition-all">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-black stroke-[2]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black">{avgRating} ★</div>
            <div className="text-xs font-black text-zinc-700 uppercase tracking-wider">Average Rating</div>
          </div>
        </div>

        <div className="bg-[#fce7f3] border-[2.5px] border-black rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000] transition-all">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] text-rose-500 fill-rose-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black">{totalGoalsWatched}</div>
            <div className="text-xs font-black text-zinc-700 uppercase tracking-wider">Goals Watched</div>
          </div>
        </div>

        <div className="bg-[#dcfce7] border-[2.5px] border-black rounded-3xl p-5 sm:p-6 flex items-center gap-4 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000] transition-all">
          <div className="bg-white p-3.5 rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-black">{totalFollowed}</div>
            <div className="text-xs font-black text-zinc-700 uppercase tracking-wider">Clubs Followed</div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE NAVIGATION TABS */}
      <div className="border-b-[3px] border-black pb-3">
        <nav className="flex gap-3 sm:gap-4 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp, count: null },
            { id: 'diary', label: 'Match Diary', icon: Calendar, count: totalMatches },
            { id: 'following', label: 'Followed Hub', icon: Shield, count: totalFollowed },
            { id: 'lists', label: 'My Lists', icon: ListIcon, count: totalLists },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2.5 px-4 font-black text-sm border-2 border-black rounded-2xl transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? 'bg-[#fde047] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]' 
                    : 'bg-white hover:bg-zinc-100 text-black shadow-[2px_2px_0px_0px_#000]'
                }`}
              >
                <Icon className={`w-4 h-4 text-black stroke-[2.5]`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-black border border-black ${
                    isActive ? 'bg-black text-white shadow-[1px_1px_0px_0px_#000]' : 'bg-[#fef9c3] text-black shadow-[1px_1px_0px_0px_#000]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 4. TAB CONTENT AREA */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: OVERVIEW & ANALYTICS (ELEVATED STATS VIEW) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Star Rating Distribution */}
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 lg:col-span-2 space-y-6 shadow-[5px_5px_0px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black pb-4">
                  <div>
                    <h3 className="text-xl font-black text-black flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 stroke-[2.5] stroke-black" />
                      Rating Distribution
                    </h3>
                    <p className="text-xs font-bold text-zinc-600 mt-0.5">Breakdown of star ratings you&apos;ve awarded across all logged matches</p>
                  </div>
                  <span className="text-xs font-black text-black bg-[#fef9c3] border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#000]">
                    Total: {totalMatches}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(star => {
                    const count = starCounts[star] || 0
                    const percentage = totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0
                    const barColor = star >= 4.5 ? 'bg-[#fde047]' :
                                     star >= 3.5 ? 'bg-[#a3e635]' :
                                     star >= 2.5 ? 'bg-[#f3e8ff]' :
                                     star >= 1.5 ? 'bg-[#dcfce7]' : 'bg-[#fda4af]'
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-10 shrink-0 font-black text-xs text-black">
                          <span>{star.toFixed(1)}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-black stroke-[2]" />
                        </div>

                        <div className="flex-1 bg-zinc-100 h-3 rounded-full overflow-hidden border-2 border-black p-[1px] shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${barColor} border border-black`}
                          />
                        </div>

                        <div className="w-20 text-right font-mono text-[11px] font-black text-black">
                          {count} <span className="text-zinc-600 font-bold">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right 1 Col: Most Watched Club Highlight Card */}
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-[5px_5px_0px_0px_#000]">
                <div>
                  <h3 className="text-xl font-black text-black flex items-center gap-2 border-b-2 border-black pb-4">
                    <TrendingUp className="w-5 h-5 text-black stroke-[2.5]" />
                    Most Watched
                  </h3>

                  {mostWatchedTeam ? (
                    <div className="mt-6 flex flex-col items-center text-center bg-[#fef9c3] border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_#000]">
                      <div className="w-16 h-16 rounded-2xl bg-white border-2 border-black p-2 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_#000]">
                        <TeamLogo src={mostWatchedTeam.logoUrl} name={mostWatchedTeam.name} className="w-12 h-12 object-contain" fallbackClassName="w-12 h-12 text-base font-black" />
                      </div>
                      <h4 className="text-xl font-black text-black line-clamp-1">{mostWatchedTeam.name}</h4>
                      <div className="mt-2 inline-flex items-center gap-2 bg-white border-2 border-black px-3 py-1 rounded-full shadow-[1px_1px_0px_0px_#000]">
                        <span className="text-xs font-black text-black uppercase tracking-wider">{mostWatchedTeam.count} Matches Logged</span>
                      </div>
                      <div className="mt-4 text-xs font-black text-black bg-white/80 px-3 py-1 rounded-xl border border-black">
                        Avg Rating: <strong className="text-black">{(mostWatchedTeam.totalStars / mostWatchedTeam.count).toFixed(1)} ★</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-12 text-center text-zinc-500 font-bold py-8">Not enough match data yet</div>
                  )}
                </div>

                {topCompetition && (
                  <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs font-black">
                    <span className="text-zinc-600 uppercase tracking-wider">Top Competition:</span>
                    <span className="text-black bg-[#f3e8ff] px-3 py-1 rounded-xl border-2 border-black shadow-[1px_1px_0px_0px_#000] font-black">{topCompetition[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Top Tags & Spotlight */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Top Tags Cloud */}
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 space-y-4 shadow-[5px_5px_0px_0px_#000]">
                <h3 className="text-xl font-black text-black flex items-center gap-2 border-b-2 border-black pb-4">
                  <Hash className="w-5 h-5 text-black stroke-[2.5]" />
                  Top Tags & Vibes
                </h3>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {topTags.length > 0 ? (
                    topTags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center gap-2 bg-[#fde047] border-2 border-black px-3.5 py-2 rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                        <span className="font-black text-sm text-black">#{tag}</span>
                        <span className="text-xs bg-white text-black font-mono font-black px-2 py-0.5 rounded-lg border border-black">{count}x</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 font-bold text-sm py-4 italic">No custom tags added to your reviews yet. Add tags when logging matches!</div>
                  )}
                </div>
              </div>

              {/* Highest Rated Match Spotlight */}
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-6 space-y-4 shadow-[5px_5px_0px_0px_#000]">
                <h3 className="text-xl font-black text-black flex items-center gap-2 border-b-2 border-black pb-4">
                  <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
                  Top Rated Highlight
                </h3>

                {topRatedMatch ? (
                  <Link
                    href={`/match/${topRatedMatch.match.externalId}`}
                    className="block bg-[#f3e8ff] border-[2.5px] border-black rounded-3xl p-5 transition-all group shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-black bg-[#fef9c3] px-3 py-1 rounded-full border-2 border-black uppercase tracking-wider flex items-center gap-1 shadow-[1px_1px_0px_0px_#000]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-black stroke-[2]" /> 5-Star Masterpiece
                      </span>
                      <span className="text-xs text-black font-black bg-white px-2.5 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
                        <FormattedDate date={topRatedMatch.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo src={topRatedMatch.match.homeTeam.logoUrl} name={topRatedMatch.match.homeTeam.name} className="w-7 h-7 object-contain" />
                        <span className="font-black text-black">{topRatedMatch.match.homeTeam.name}</span>
                      </div>
                      <div className="font-mono font-black text-lg text-white bg-[#18181b] px-3.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        {topRatedMatch.match.homeScore ?? '-'} : {topRatedMatch.match.awayScore ?? '-'}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-black text-black">{topRatedMatch.match.awayTeam.name}</span>
                        <TeamLogo src={topRatedMatch.match.awayTeam.logoUrl} name={topRatedMatch.match.awayTeam.name} className="w-7 h-7 object-contain" />
                      </div>
                    </div>

                    {topRatedMatch.review && (
                      <p className="text-xs text-black font-bold italic line-clamp-2 mt-3 bg-white p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        &ldquo;{topRatedMatch.review}&rdquo;
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="text-zinc-500 font-bold text-sm py-4 italic">No 5-star ratings logged yet. Find a classic and rate it 5 stars!</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MATCH DIARY (LOGGED RATINGS FEED) */}
        {activeTab === 'diary' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-white border-[2.5px] border-black p-4 rounded-3xl shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
                <Filter className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Filter Diary:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'All Matches', value: 'all' },
                  { label: (
                    <span className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-black stroke-[2] drop-shadow-[1px_1px_0px_#000]" />)}
                      </div>
                      (5 Star)
                    </span>
                  ), value: 5 },
                  { label: (
                    <span className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-black stroke-[2] drop-shadow-[1px_1px_0px_#000]" />)}
                      </div>
                      (4 Star)
                    </span>
                  ), value: 4 },
                  { label: (
                    <span className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1,2,3].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-black stroke-[2] drop-shadow-[1px_1px_0px_#000]" />)}
                      </div>
                      (3 Star)
                    </span>
                  ), value: 3 },
                ].map(item => (
                  <button
                    key={String(item.value)}
                    onClick={() => setActivityFilter(item.value as any)}
                    className={`px-3.5 py-1.5 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                      activityFilter === item.value
                        ? 'bg-[#fde047] text-black shadow-[2px_2px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                        : 'bg-white text-black hover:bg-zinc-100 shadow-[1px_1px_0px_0px_#000]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredRatings.length === 0 ? (
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[5px_5px_0px_0px_#000]">
                <div className="bg-[#fef9c3] p-4 rounded-2xl border-2 border-black mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <Calendar className="w-8 h-8 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black mb-2">No matches found in this filter</h3>
                <p className="text-zinc-600 font-bold text-sm max-w-sm mb-6">
                  {activityFilter === 'all' ? "You haven't logged any football matches yet." : `You haven't awarded any ${activityFilter}-star ratings yet.`}
                </p>
                <Link
                  href="/search"
                  className="retro-btn-primary"
                >
                  Log a match <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredRatings.map(rating => (
                  <Link
                    key={rating.id}
                    href={`/match/${rating.match.externalId}`}
                    className="bg-white border-[2.5px] border-black rounded-3xl overflow-hidden hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col group shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]"
                  >
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TeamLogo src={rating.match.homeTeam.logoUrl} name={rating.match.homeTeam.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                          <span className="font-black text-black line-clamp-1 text-base">{rating.match.homeTeam.name}</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white px-3 py-0.5 rounded-xl bg-[#18181b] border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
                          {rating.match.homeScore ?? '-'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TeamLogo src={rating.match.awayTeam.logoUrl} name={rating.match.awayTeam.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                          <span className="font-black text-black line-clamp-1 text-base">{rating.match.awayTeam.name}</span>
                        </div>
                        <div className="font-mono text-xl font-black text-white px-3 py-0.5 rounded-xl bg-[#18181b] border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
                          {rating.match.awayScore ?? '-'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#fef9c3] p-4 border-t-[2.5px] border-black flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-1 bg-white px-2.5 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
                            {[1, 2, 3, 4, 5].map(star => {
                              const isFull = star <= rating.stars;
                              const isHalf = !isFull && (star - 1 < rating.stars);
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
                          <span className="text-xs font-black text-black bg-white px-2.5 py-1 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000]">
                            <FormattedDate date={rating.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} />
                          </span>
                        </div>

                        {rating.review && (
                          <p className="text-xs text-black font-bold line-clamp-2 italic bg-white p-2.5 rounded-xl border border-black shadow-[1px_1px_0px_0px_#000] mt-2 leading-relaxed">
                            &ldquo;{rating.review}&rdquo;
                          </p>
                        )}
                      </div>

                      {Array.isArray(rating.tags) && rating.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {rating.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#fde047] text-black border border-black shadow-[1px_1px_0px_0px_#000] uppercase tracking-wider">
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

        {/* TAB 3: FOLLOWED HUB */}
        {activeTab === 'following' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <Shield className="w-6 h-6 text-black stroke-[2.5]" />
                  Your Followed Clubs, Competitions & Countries
                </h3>
                <p className="text-xs font-bold text-zinc-600 mt-0.5">Manage your favorite teams and leagues to personalize your home feed</p>
              </div>
            </div>

            {followedEntities.length === 0 ? (
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[5px_5px_0px_0px_#000]">
                <div className="bg-[#fef9c3] p-4 rounded-2xl border-2 border-black mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <Shield className="w-8 h-8 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black mb-2">You aren&apos;t following any clubs or leagues yet</h3>
                <p className="text-zinc-600 font-bold text-sm max-w-sm mb-6">
                  Follow teams and competitions to get personalized live updates and fixtures on your home page.
                </p>
                <Link
                  href="/"
                  className="retro-btn-primary"
                >
                  Explore Teams <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {followedEntities.map(entity => (
                  <div
                    key={`${entity.type}-${entity.externalId}`}
                    className="bg-white border-[2.5px] border-black rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#000] transition-all group"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(entity.name)}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <TeamLogo src={entity.logoUrl} name={entity.name} className="w-10 h-10 object-contain" fallbackClassName="w-10 h-10 text-xs font-black" />
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-black truncate">{entity.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#fef9c3] px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]">
                          {entity.type}
                        </span>
                      </div>
                    </Link>

                    <div className="shrink-0">
                      <FollowButton
                        externalId={entity.externalId}
                        name={entity.name}
                        type={entity.type}
                        logoUrl={entity.logoUrl}
                        initialIsFollowing={true}
                        size="sm"
                        variant="pill"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY LISTS */}
        {activeTab === 'lists' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h3 className="text-xl font-black text-black flex items-center gap-2">
                  <ListIcon className="w-6 h-6 text-black stroke-[2.5]" />
                  Curated Match Lists
                </h3>
                <p className="text-xs font-bold text-zinc-600 mt-0.5">Your personal playlists and thematic collections of classic matches</p>
              </div>
              <Link
                href="/lists"
                className="retro-btn-primary py-2 px-4 text-xs"
              >
                <span>Manage Lists</span> <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>

            {lists.length === 0 ? (
              <div className="bg-white border-[2.5px] border-black rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[5px_5px_0px_0px_#000]">
                <div className="bg-[#fef9c3] p-4 rounded-2xl border-2 border-black mb-4 shadow-[2px_2px_0px_0px_#000]">
                  <ListIcon className="w-8 h-8 text-black stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-black text-black mb-2">No lists created yet</h3>
                <p className="text-zinc-600 font-bold text-sm max-w-sm mb-6">
                  Create lists like &quot;Best Comebacks&quot;, &quot;Derby Classics&quot;, or &quot;Live at the Stadium&quot;.
                </p>
                <Link
                  href="/lists"
                  className="retro-btn-primary"
                >
                  Create your first list <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {lists.map(list => (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    className="bg-white border-[2.5px] border-black rounded-3xl p-6 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex flex-col justify-between group shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-[#fef9c3] p-2.5 rounded-2xl border-2 border-black text-black shadow-[2px_2px_0px_0px_#000]">
                          <ListIcon className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <h4 className="text-lg font-black text-black truncate">{list.title}</h4>
                      </div>
                      {list.description && (
                        <p className="text-xs font-bold text-zinc-600 line-clamp-2 leading-relaxed mb-4">{list.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs font-black">
                      <span className="bg-[#f3e8ff] border-2 border-black text-black px-3 py-1 rounded-full font-mono shadow-[1px_1px_0px_0px_#000]">
                        {list._count.items} match{list._count.items !== 1 ? 'es' : ''}
                      </span>
                      <span className="text-black flex items-center gap-1 font-black">
                        View List <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
