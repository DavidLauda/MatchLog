import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { removeMatchFromList } from '@/app/actions'
import { DeleteListButton } from '@/components/DeleteListButton'
import { AddFromDiaryModal } from '@/components/AddFromDiaryModal'
import { TeamLogo } from '@/components/TeamLogo'

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [list, user] = await Promise.all([
    prisma.matchList.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            match: {
              include: { homeTeam: true, awayTeam: true }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    }),
    prisma.user.findFirst()
  ])

  if (!list) {
    return (
      <div className="text-center py-12 text-zinc-400">
        List not found.
      </div>
    )
  }

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

  const existingMatchIds = list.items.map(i => i.matchId)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <Link href="/lists" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Lists
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">{list.title}</h1>
          {list.description && (
            <p className="text-zinc-400 mt-2 text-lg">{list.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <AddFromDiaryModal
            listId={list.id}
            listTitle={list.title}
            diaryMatches={diaryMatches}
            existingMatchIds={existingMatchIds}
            triggerVariant="header-button"
          />
          <DeleteListButton
            listId={list.id}
            listTitle={list.title}
            redirectAfterDelete={true}
          />
        </div>
      </div>

      <div className="space-y-4">
        {list.items.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-zinc-400 text-base max-w-md">
              This list is currently empty. Add your favorite matches from your diary directly, or search for any match to add it!
            </p>
            <AddFromDiaryModal
              listId={list.id}
              listTitle={list.title}
              diaryMatches={diaryMatches}
              existingMatchIds={existingMatchIds}
              triggerVariant="empty-state"
            />
          </div>
        ) : (
          list.items.map((item, index) => (
            <div key={item.id} className="glass-panel p-4 flex items-center justify-between group hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="text-2xl font-black text-zinc-800 w-8 text-center shrink-0">
                  {index + 1}
                </div>
                
                <Link href={`/match/${item.match.externalId}`} className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4 hover:bg-zinc-800/50 p-2 rounded-lg transition-colors min-w-0">
                  <div className="flex items-center justify-end gap-3 text-right min-w-0">
                    <span className="font-bold text-zinc-200 truncate">{item.match.homeTeam.name}</span>
                    <TeamLogo src={item.match.homeTeam.logoUrl} name={item.match.homeTeam.name} className="w-8 h-8 object-contain shrink-0" fallbackClassName="w-8 h-8 text-xs shrink-0" />
                  </div>
                  
                  <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 font-mono font-bold text-lg text-zinc-100 shrink-0">
                    {item.match.homeScore ?? '-'} : {item.match.awayScore ?? '-'}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo src={item.match.awayTeam.logoUrl} name={item.match.awayTeam.name} className="w-8 h-8 object-contain shrink-0" fallbackClassName="w-8 h-8 text-xs shrink-0" />
                    <span className="font-bold text-zinc-200 truncate">{item.match.awayTeam.name}</span>
                  </div>
                </Link>
              </div>

              <div className="ml-4 pl-4 border-l border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <form action={async () => {
                  'use server'
                  await removeMatchFromList(list.id, item.match.id)
                }}>
                  <button type="submit" className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer" title="Remove from list">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
