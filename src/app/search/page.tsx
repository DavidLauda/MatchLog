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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-16">
      <div className="border-b-[3px] border-black pb-4">
        <h1 className="text-3xl font-black tracking-tight text-black uppercase">Log a Match</h1>
        <p className="text-sm font-bold text-zinc-600 mt-1">Search any historical or recent fixture from global competitions to rate and review.</p>
      </div>
      
      <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000]">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-black stroke-[2.5] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                name="q"
                defaultValue={q}
                placeholder="Search team name (e.g. Arsenal, Real Madrid, Brazil)..." 
                className="w-full bg-white border-2 border-black rounded-2xl pl-12 pr-4 py-3 text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="retro-btn-primary flex items-center justify-center gap-2 font-black px-8 py-3 text-base"
          >
            Search
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {results.map((fixture: any) => (
          <Link 
            key={fixture.fixture.id} 
            href={`/match/${fixture.fixture.id}`}
            className="block bg-white border-[2.5px] border-black rounded-3xl p-5 transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#000] group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm font-black text-black text-center sm:text-left">
                <div><FormattedDate date={fixture.fixture.date} fallbackFormat="short" /></div>
                <div className="text-xs font-black text-black bg-[#fef9c3] px-2.5 py-0.5 rounded-md border border-black inline-block mt-1.5 shadow-[1px_1px_0px_0px_#000]">{fixture.league.name}</div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-right">
                  <span className="font-black text-black text-base">{fixture.teams.home.name}</span>
                  <TeamLogo src={fixture.teams.home.logo} name={fixture.teams.home.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                </div>
                
                <div className="font-mono font-black bg-[#18181b] px-3.5 py-1 rounded-xl text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-lg">
                  {fixture.goals.home ?? '-'} : {fixture.goals.away ?? '-'}
                </div>
                
                <div className="flex items-center gap-3 text-left">
                  <TeamLogo src={fixture.teams.away.logo} name={fixture.teams.away.name} className="w-8 h-8 object-contain" fallbackClassName="w-8 h-8 text-xs font-black" />
                  <span className="font-black text-black text-base">{fixture.teams.away.name}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {results.length === 0 && q && (
          <div className="bg-white border-[3px] border-black rounded-3xl p-12 text-center text-black font-bold shadow-[5px_5px_0px_0px_#000]">
            No matches found for &ldquo;{q}&rdquo;.
          </div>
        )}
      </div>
    </div>
  )
}
