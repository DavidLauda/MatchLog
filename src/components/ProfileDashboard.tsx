'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Star, Hash, TrendingUp, ArrowRight, Sparkles, 
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

  // Customizable user profile details (stored in localStorage for seamless personalization without DB migrations)
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

  // Rating distribution (1 to 5 stars)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
  ratings.forEach(r => {
    const s = Math.min(Math.max(Math.round(r.stars), 1), 5)
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
    const comp = r.match.competition || 'Other'
    compCounts[comp] = (compCounts[comp] || 0) + 1
  })
  const topCompetition = Object.entries(compCounts).sort((a, b) => b[1] - a[1])[0]

  // Top tags
  const tagCounts: Record<string, number> = {}
  ratings.forEach(r => {
    if (Array.isArray(r.tags)) {
      r.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // Highest rated match
  const topRatedMatch = ratings.find(r => r.stars === 5) || ratings[0]

  // Filtered diary activity
  const filteredRatings = activityFilter === 'all' 
    ? ratings 
    : ratings.filter(r => r.stars === activityFilter)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. HERO PROFILE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zinc-900 to-zinc-950 border border-indigo-500/30 p-6 sm:p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            
            {/* Avatar with status indicator */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-xl shadow-indigo-600/30">
                <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center font-black font-mono text-3xl sm:text-4xl text-white tracking-tighter">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-zinc-950 p-1 rounded-full border-2 border-zinc-950 shadow-md" title="Online & Logging">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-2 max-w-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{displayName}</h1>
                <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-mono">
                  @{user.username}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-400" /> Groundhopper VIP
                </span>
              </div>
              
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                {bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Member since <FormattedDate date={user.createdAt} options={{ month: 'long', year: 'numeric' }} /></span>
                </div>
                {favoriteClub && (
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Heart className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                    <span>Supports <strong className="text-white">{favoriteClub}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold border border-zinc-700/80 transition-all cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/20 relative"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-400" /> Customize Profile
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Bio / Football Motto</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Favorite Club / Competition</label>
                  <input
                    type="text"
                    value={favoriteClub}
                    onChange={(e) => setFavoriteClub(e.target.value)}
                    placeholder="e.g. Arsenal, Real Madrid, Premier League"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
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
        <div className="glass-panel p-5 sm:p-6 flex items-center gap-4 group hover:border-indigo-500/50 transition-all">
          <div className="bg-indigo-500/20 p-3.5 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalMatches}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Matches Logged</div>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 flex items-center gap-4 group hover:border-amber-500/50 transition-all">
          <div className="bg-amber-500/20 p-3.5 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{avgRating} ★</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Average Rating</div>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 flex items-center gap-4 group hover:border-rose-500/50 transition-all">
          <div className="bg-rose-500/20 p-3.5 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
            <Flame className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalGoalsWatched}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Goals Watched</div>
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 flex items-center gap-4 group hover:border-emerald-500/50 transition-all">
          <div className="bg-emerald-500/20 p-3.5 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalFollowed}</div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Clubs Followed</div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE NAVIGATION TABS */}
      <div className="border-b border-zinc-800">
        <nav className="flex gap-2 sm:gap-6 overflow-x-auto pb-px">
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
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-bold text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5 rounded-t-xl' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
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
              <div className="glass-panel p-6 lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      Rating Distribution
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Breakdown of star ratings you've awarded across all logged matches</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
                    Total: {totalMatches}
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = starCounts[star] || 0
                    const percentage = totalMatches > 0 ? Math.round((count / totalMatches) * 100) : 0
                    const barColor = star === 5 ? 'from-amber-400 to-orange-500' :
                                     star === 4 ? 'from-indigo-400 to-indigo-600' :
                                     star === 3 ? 'from-emerald-400 to-teal-600' :
                                     star === 2 ? 'from-blue-400 to-cyan-600' : 'from-rose-500 to-pink-600'
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12 shrink-0 font-bold text-sm text-zinc-300">
                          <span>{star}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>

                        <div className="flex-1 bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                          />
                        </div>

                        <div className="w-16 text-right font-mono text-xs font-semibold text-zinc-400">
                          {count} <span className="text-zinc-600">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right 1 Col: Most Watched Club Highlight Card */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-4">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    Most Watched
                  </h3>

                  {mostWatchedTeam ? (
                    <div className="mt-6 flex flex-col items-center text-center bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 p-2 flex items-center justify-center mb-4 shadow-xl">
                        <TeamLogo src={mostWatchedTeam.logoUrl} name={mostWatchedTeam.name} className="w-12 h-12 object-contain" fallbackClassName="w-12 h-12 text-base" />
                      </div>
                      <h4 className="text-xl font-extrabold text-white line-clamp-1">{mostWatchedTeam.name}</h4>
                      <div className="mt-2 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{mostWatchedTeam.count} Matches Logged</span>
                      </div>
                      <div className="mt-4 text-xs font-semibold text-zinc-500">
                        Avg Rating: <strong className="text-amber-400">{(mostWatchedTeam.totalStars / mostWatchedTeam.count).toFixed(1)} ★</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-12 text-center text-zinc-500 py-8">Not enough match data yet</div>
                  )}
                </div>

                {topCompetition && (
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-500 uppercase tracking-wider">Top Competition:</span>
                    <span className="text-zinc-200 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 font-bold">{topCompetition[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Top Tags & Spotlight */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Top Tags Cloud */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-4">
                  <Hash className="w-5 h-5 text-rose-400" />
                  Top Tags & Vibes
                </h3>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {topTags.length > 0 ? (
                    topTags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl transition-all">
                        <span className="font-bold text-sm text-zinc-200">#{tag}</span>
                        <span className="text-xs bg-indigo-500/20 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded-md">{count}x</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-500 text-sm py-4 italic">No custom tags added to your reviews yet. Add tags when logging matches!</div>
                  )}
                </div>
              </div>

              {/* Highest Rated Match Spotlight */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-4">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Top Rated Highlight
                </h3>

                {topRatedMatch ? (
                  <Link
                    href={`/match/${topRatedMatch.match.externalId}`}
                    className="block bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> 5-Star Masterpiece
                      </span>
                      <span className="text-xs text-zinc-500 font-semibold">
                        <FormattedDate date={topRatedMatch.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2.5">
                        <TeamLogo src={topRatedMatch.match.homeTeam.logoUrl} name={topRatedMatch.match.homeTeam.name} className="w-6 h-6 object-contain" />
                        <span className="font-bold text-white group-hover:text-amber-300 transition-colors">{topRatedMatch.match.homeTeam.name}</span>
                      </div>
                      <div className="font-mono font-black text-lg text-white bg-zinc-950 px-3 py-0.5 rounded-lg border border-zinc-800">
                        {topRatedMatch.match.homeScore ?? '-'} : {topRatedMatch.match.awayScore ?? '-'}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white group-hover:text-amber-300 transition-colors">{topRatedMatch.match.awayTeam.name}</span>
                        <TeamLogo src={topRatedMatch.match.awayTeam.logoUrl} name={topRatedMatch.match.awayTeam.name} className="w-6 h-6 object-contain" />
                      </div>
                    </div>

                    {topRatedMatch.review && (
                      <p className="text-xs text-zinc-400 italic line-clamp-2 mt-2 border-l-2 border-amber-500/40 pl-3">
                        "{topRatedMatch.review}"
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="text-zinc-500 text-sm py-4 italic">No 5-star ratings logged yet. Find a classic and rate it 5 stars!</div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: MATCH DIARY (LOGGED RATINGS FEED) */}
        {activeTab === 'diary' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-indigo-400" />
                <span>Filter Diary:</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: 'All Matches', value: 'all' },
                  { label: '⭐⭐⭐⭐⭐ (5 Star)', value: 5 },
                  { label: '⭐⭐⭐⭐ (4 Star)', value: 4 },
                  { label: '⭐⭐⭐ (3 Star)', value: 3 },
                ].map(item => (
                  <button
                    key={String(item.value)}
                    onClick={() => setActivityFilter(item.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activityFilter === item.value
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredRatings.length === 0 ? (
              <div className="glass-panel p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-zinc-800">
                <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No matches found in this filter</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  {activityFilter === 'all' ? "You haven't logged any football matches yet." : `You haven't awarded any ${activityFilter}-star ratings yet.`}
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Log a match <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredRatings.map(rating => (
                  <Link
                    key={rating.id}
                    href={`/match/${rating.match.externalId}`}
                    className="glass-panel overflow-hidden hover:border-zinc-700 hover:bg-zinc-800/80 transition-all flex flex-col group shadow-sm hover:shadow-xl"
                  >
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TeamLogo src={rating.match.homeTeam.logoUrl} name={rating.match.homeTeam.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                          <span className="font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{rating.match.homeTeam.name}</span>
                        </div>
                        <div className="font-mono text-xl font-black text-zinc-100 px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
                          {rating.match.homeScore ?? '-'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TeamLogo src={rating.match.awayTeam.logoUrl} name={rating.match.awayTeam.name} className="w-7 h-7 object-contain" fallbackClassName="w-7 h-7 text-xs" />
                          <span className="font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{rating.match.awayTeam.name}</span>
                        </div>
                        <div className="font-mono text-xl font-black text-zinc-100 px-2.5 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 shrink-0">
                          {rating.match.awayScore ?? '-'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111114] p-4 border-t border-zinc-800/80 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${star <= rating.stars ? 'fill-amber-400 text-amber-400' : 'fill-zinc-800 text-zinc-800'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">
                            <FormattedDate date={rating.watchedAt} options={{ month: 'short', day: 'numeric', year: 'numeric' }} />
                          </span>
                        </div>

                        {rating.review && (
                          <p className="text-xs text-zinc-400 line-clamp-2 italic border-l-2 border-indigo-500/40 pl-2.5 py-0.5 leading-relaxed">
                            "{rating.review}"
                          </p>
                        )}
                      </div>

                      {Array.isArray(rating.tags) && rating.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {rating.tags.map((tag: string) => (
                            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
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
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Your Followed Clubs, Competitions & Countries
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Manage your favorite teams and leagues to personalize your home feed</p>
              </div>
            </div>

            {followedEntities.length === 0 ? (
              <div className="glass-panel p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-zinc-800">
                <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">You aren't following any clubs or leagues yet</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  Follow teams and competitions to get personalized live updates and fixtures on your home page.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Explore Teams <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {followedEntities.map(entity => (
                  <div
                    key={`${entity.type}-${entity.externalId}`}
                    className="glass-panel p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all group"
                  >
                    <Link
                      href={`/match/${entity.externalId}`}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <TeamLogo src={entity.logoUrl} name={entity.name} className="w-9 h-9 object-contain" fallbackClassName="w-9 h-9 text-xs" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">{entity.name}</h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/80">
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
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ListIcon className="w-5 h-5 text-indigo-400" />
                  Curated Match Lists
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Your personal playlists and thematic collections of classic matches</p>
              </div>
              <Link
                href="/lists"
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Manage Lists</span> <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {lists.length === 0 ? (
              <div className="glass-panel p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-zinc-800">
                <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
                  <ListIcon className="w-8 h-8 text-zinc-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No lists created yet</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">
                  Create lists like "Best Comebacks", "Derby Classics", or "Live at the Stadium".
                </p>
                <Link
                  href="/lists"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Create your first list <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {lists.map(list => (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    className="glass-panel p-6 hover:bg-zinc-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-500/20 p-2.5 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                          <ListIcon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">{list.title}</h4>
                      </div>
                      {list.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">{list.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-semibold">
                      <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-mono">
                        {list._count.items} match{list._count.items !== 1 ? 'es' : ''}
                      </span>
                      <span className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                        View List <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
