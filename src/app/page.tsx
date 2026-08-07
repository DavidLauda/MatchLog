import prisma from '@/lib/prisma'
import { getFollowedEntities } from '@/app/actions'
import { fetchFollowedFixtures } from '@/lib/thesportsdb'
import { HomeFeed } from '@/components/HomeFeed'
import { getUserFromSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const user = await getUserFromSession()
  if (!user) {
    redirect('/login')
  }

  const [followedEntities, ratings] = await Promise.all([
    getFollowedEntities(),
    prisma.rating.findMany({
      where: { userId: user.id },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: { watchedAt: 'desc' }
    })
  ])

  const { recent, upcoming } = await fetchFollowedFixtures(followedEntities)

  return (
    <HomeFeed
      followedEntities={followedEntities}
      recentMatches={recent}
      upcomingMatches={upcoming}
      ratings={ratings}
    />
  )
}

