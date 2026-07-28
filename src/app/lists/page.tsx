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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 uppercase">Your Lists</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-center border-dashed border-2 border-zinc-800 hover:border-indigo-500/50 transition-colors">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-zinc-200">
            <Plus className="w-5 h-5 text-indigo-500" />
            Create New List
          </h2>
          <form action={createList} className="space-y-4">
            <div>
              <input 
                type="text" 
                name="title" 
                placeholder="List Title (e.g. Best Comebacks)" 
                required
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <textarea 
                name="description" 
                placeholder="Description (optional)" 
                rows={2}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer">
              Create List
            </button>
          </form>
        </div>

        {lists.map(list => (
          <div 
            key={list.id} 
            className="glass-panel p-6 hover:bg-zinc-800/80 transition-all flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <Link href={`/lists/${list.id}`} className="flex items-center gap-3 group-hover:text-white transition-colors flex-1 min-w-0">
                  <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 shrink-0">
                    <ListIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 truncate">{list.title}</h3>
                </Link>
                
                <div className="flex items-center gap-1 shrink-0 z-10">
                  <DeleteListButton listId={list.id} listTitle={list.title} variant="icon" />
                </div>
              </div>
              {list.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{list.description}</p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-sm font-medium gap-2">
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full text-xs shrink-0">
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
                <Link href={`/lists/${list.id}`} className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-xs font-semibold">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
