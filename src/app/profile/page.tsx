import prisma from '@/lib/prisma'
import { getFollowedEntities } from '@/app/actions'
import { ProfileDashboard } from '@/components/ProfileDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile & Analytics — MatchLog',
  description: 'Your football match watching diary, star rating analytics, and favorite clubs.',
}

export default async function ProfilePage() {
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: { username: 'demo_user', email: 'demo@example.com' }
    })
  }

  const [ratings, lists, followedEntities] = await Promise.all([
    prisma.rating.findMany({
      where: { userId: user.id },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      },
      orderBy: { watchedAt: 'desc' }
    }),
    prisma.matchList.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    getFollowedEntities()
  ])

  const serializedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }

  return (
    <ProfileDashboard
      user={serializedUser}
      ratings={ratings}
      lists={lists}
      followedEntities={followedEntities}
    />
  )
}
