import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, List as ListIcon, ArrowRight } from 'lucide-react'
import { createList } from '@/app/actions'
import { DeleteListButton } from '@/components/DeleteListButton'
import { AddFromDiaryModal } from '@/components/AddFromDiaryModal'

export default async function ListsPage() {
  const [lists, user] = await Promise.all([
    prisma.matchList.findMany({
      include: {
        _count: {
          select: { items: true }
        },
        items: {
          select: { matchId: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findFirst()
  ])

  const diaryRatings = user ? await prisma.rating.findMany({
    where: { userId: user.id },
    include: {
      match: {
        include: { homeTeam: true, awayTeam: true }
      }
    },
    orderBy: { watchedAt: 'desc' }
  }) : []

  const diaryMatches = diaryRatings.map(r => ({
    id: r.match.id,
    externalId: r.match.externalId,
    competition: r.match.competition,
    matchDate: r.match.matchDate.toISOString(),
    homeScore: r.match.homeScore,
    awayScore: r.match.awayScore,
    homeTeam: {
      name: r.match.homeTeam.name,
      logoUrl: r.match.homeTeam.logoUrl
    },
    awayTeam: {
      name: r.match.awayTeam.name,
      logoUrl: r.match.awayTeam.logoUrl
    },
    stars: r.stars,
    review: r.review
  }))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-16">
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4">
        <h1 className="text-3xl font-black tracking-tight text-black uppercase">Your Lists</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#fef9c3] border-[3px] border-black rounded-3xl p-6 flex flex-col justify-center shadow-[5px_5px_0px_0px_#000]">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-black">
            <div className="bg-white p-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Plus className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            Create New List
          </h2>
          <form action={createList} className="space-y-4">
            <div>
              <input 
                type="text" 
                name="title" 
                placeholder="List Title (e.g. Best Comebacks)" 
                required
                className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all text-sm"
              />
            </div>
            <div>
              <textarea 
                name="description" 
                placeholder="Description (optional)" 
                rows={2}
                className="w-full bg-white border-2 border-black rounded-2xl p-3 text-black font-bold placeholder-zinc-400 focus:outline-none focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_0px_#000] shadow-[3px_3px_0px_0px_#000] transition-all resize-none text-sm"
              ></textarea>
            </div>
            <button type="submit" className="retro-btn-primary w-full py-2.5">
              Create List
            </button>
          </form>
        </div>

        {lists.map(list => (
          <div 
            key={list.id} 
            className="bg-white border-[2.5px] border-black rounded-3xl p-6 transition-all flex flex-col justify-between group shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_0px_#000] relative"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Link href={`/lists/${list.id}`} className="flex items-center gap-3 transition-colors flex-1 min-w-0">
                  <div className="bg-[#f3e8ff] p-2.5 rounded-2xl border-2 border-black text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <ListIcon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-black text-black truncate">{list.title}</h3>
                </Link>
                
                <div className="flex items-center gap-1 shrink-0 z-10">
                  <DeleteListButton listId={list.id} listTitle={list.title} variant="icon" />
                </div>
              </div>
              {list.description && (
                <p className="text-sm font-bold text-zinc-600 line-clamp-2 mb-4">{list.description}</p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between text-sm font-black gap-2">
              <span className="bg-[#fef9c3] border-2 border-black text-black px-3 py-1 rounded-full text-xs font-black shrink-0 shadow-[1px_1px_0px_0px_#000]">
                {list._count.items} match{list._count.items !== 1 ? 'es' : ''}
              </span>

              <div className="flex items-center gap-3 shrink-0">
                <AddFromDiaryModal
                  listId={list.id}
                  listTitle={list.title}
                  diaryMatches={diaryMatches}
                  existingMatchIds={list.items.map(i => i.matchId)}
                  triggerVariant="card-button"
                />
                <Link href={`/lists/${list.id}`} className="text-black flex items-center gap-1 text-xs font-black">
                  View <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
