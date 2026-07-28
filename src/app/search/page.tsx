import { searchFixturesByTeamName } from '@/lib/thesportsdb'
import { TeamLogo } from '@/components/TeamLogo'
import { FormattedDate } from '@/components/FormattedDate'
import Link from 'next/link'
import { Search } from 'lucide-react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || ''

  let results: any[] = []

  if (q) {
    results = await searchFixturesByTeamName(q)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Log a Match</h1>
      
      <div className="glass-panel p-6">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                name="q"
                defaultValue={q}
                placeholder="Search team name (e.g. Arsenal, Real Madrid, Brazil)..." 
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Search
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {results.map((fixture: any) => (
          <Link 
            key={fixture.fixture.id} 
            href={`/match/${fixture.fixture.id}`}
            className="block glass-panel p-4 hover:border-indigo-500/50 transition-all hover:shadow-indigo-500/10 group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-400 font-medium text-center sm:text-left">
                <div><FormattedDate date={fixture.fixture.date} fallbackFormat="short" /></div>
                <div className="text-xs text-slate-500 mt-1">{fixture.league.name}</div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-right">
                  <span className="font-semibold text-slate-200">{fixture.teams.home.name}</span>
                  <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs" />
                </div>
                
                <div className="font-mono font-bold bg-slate-800/80 px-3 py-1 rounded-lg text-slate-300">
                  {fixture.goals.home ?? '-'} : {fixture.goals.away ?? '-'}
                </div>
                
                <div className="flex items-center gap-3 text-left">
                  <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs" />
                  <span className="font-semibold text-slate-200">{fixture.teams.away.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {results.length === 0 && q && (
          <div className="text-center py-12 text-slate-400">
            No matches found for your search.
          </div>
        )}
      </div>
    </div>
  )
}
