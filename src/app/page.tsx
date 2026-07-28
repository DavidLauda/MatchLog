import prisma from '@/lib/prisma'
import { getFollowedEntities } from '@/app/actions'
import { fetchFollowedFixtures } from '@/lib/thesportsdb'
import { HomeFeed } from '@/components/HomeFeed'

export default async function Home() {
  const [followedEntities, ratings] = await Promise.all([
    getFollowedEntities(),
    prisma.rating.findMany({
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

