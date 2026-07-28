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
      <div className="text-center py-12 text-black font-bold">
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-[3px] border-black pb-6">
        <div>
          <Link href="/lists" className="inline-flex items-center gap-2 text-sm font-black text-black hover:underline transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            Back to Lists
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-black">{list.title}</h1>
          {list.description && (
            <p className="text-zinc-700 font-bold mt-2 text-lg">{list.description}</p>
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
          <div className="bg-white border-[3px] border-black rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-[5px_5px_0px_0px_#000]">
            <p className="text-black font-bold text-base max-w-md">
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
            <div key={item.id} className="bg-white border-[2.5px] border-black rounded-3xl p-4 flex items-center justify-between group shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_0px_#000] transition-all">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="text-2xl font-black text-black w-8 text-center shrink-0">
                  {index + 1}
                </div>
                
                <Link href={`/match/${item.match.externalId}`} className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4 hover:bg-[#fef9c3] p-2 rounded-2xl transition-colors min-w-0 border-2 border-transparent hover:border-black">
                  <div className="flex items-center justify-end gap-3 text-right min-w-0">
                    <span className="font-black text-black truncate">{item.match.homeTeam.name}</span>
                    <TeamLogo src={item.match.homeTeam.logoUrl} name={item.match.homeTeam.name} className="w-8 h-8 object-contain shrink-0" fallbackClassName="w-8 h-8 text-xs shrink-0 font-black" />
                  </div>
                  
                  <div className="bg-[#18181b] px-3.5 py-1 rounded-xl border-2 border-black font-mono font-black text-lg text-white shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    {item.match.homeScore ?? '-'} : {item.match.awayScore ?? '-'}
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamLogo src={item.match.awayTeam.logoUrl} name={item.match.awayTeam.name} className="w-8 h-8 object-contain shrink-0" fallbackClassName="w-8 h-8 text-xs shrink-0 font-black" />
                    <span className="font-black text-black truncate">{item.match.awayTeam.name}</span>
                  </div>
                </Link>
              </div>

              <div className="ml-4 pl-4 border-l-2 border-black opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <form action={async () => {
                  'use server'
                  await removeMatchFromList(list.id, item.match.id)
                }}>
                  <button type="submit" className="p-2 text-red-600 hover:bg-red-100 rounded-xl border-2 border-transparent hover:border-black transition-all cursor-pointer shadow-sm" title="Remove from list">
                    <Trash2 className="w-5 h-5 stroke-[2.5]" />
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
