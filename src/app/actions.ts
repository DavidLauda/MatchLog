'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getFixtureDetails } from '@/lib/thesportsdb'

export async function logMatchRating(formData: FormData) {
  const matchId = formData.get('matchId') as string
  const starsRaw = formData.get('stars') as string
  const stars = parseFloat(starsRaw)
  console.log(">>> LOG MATCH RATING CALLED: raw:", starsRaw, "parsed:", stars)
  
  const review = formData.get('review') as string
  const tagsString = formData.get('tags') as string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : []
  
  if (!matchId || isNaN(stars)) {
    throw new Error('Missing matchId or stars')
  }

  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: { username: 'demo_user', email: 'demo@example.com' }
    })
  }

  let match = await prisma.match.findUnique({ where: { externalId: matchId } })
  
  if (!match) {
    const details = await getFixtureDetails(matchId)
    if (!details) throw new Error('Match not found from API')

    const homeTeamApi = details.teams.home
    const awayTeamApi = details.teams.away

    const homeTeam = await prisma.team.upsert({
      where: { externalId: String(homeTeamApi.id) },
      update: {},
      create: {
        externalId: String(homeTeamApi.id),
        name: homeTeamApi.name || 'Unknown',
        logoUrl: homeTeamApi.logo || '',
      }
    })

    const awayTeam = await prisma.team.upsert({
      where: { externalId: String(awayTeamApi.id) },
      update: {},
      create: {
        externalId: String(awayTeamApi.id),
        name: awayTeamApi.name || 'Unknown',
        logoUrl: awayTeamApi.logo || '',
      }
    })

    match = await prisma.match.create({
      data: {
        externalId: matchId,
        competition: details.league.name || 'Unknown',
        season: details.league.season?.toString(),
        matchDate: new Date(details.fixture.date),
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeScore: details.goals.home,
        awayScore: details.goals.away,
        statsJson: details, 
      }
    })
  }

  await prisma.rating.upsert({
    where: {
      userId_matchId: { userId: user.id, matchId: match.id }
    },
    update: { stars, review, tags },
    create: {
      userId: user.id,
      matchId: match.id,
      stars,
      review,
      tags,
    }
  })

  revalidatePath('/')
  revalidatePath('/profile')
  revalidatePath(`/match/${matchId}`)
}

export async function deleteMatchRating(ratingId: string) {
  await prisma.rating.delete({
    where: { id: ratingId }
  })
  revalidatePath('/')
  revalidatePath('/profile')
}

export async function createList(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  if (!title) throw new Error('Title is required')

  const user = await prisma.user.findFirst()
  if (!user) throw new Error('User not found')

  await prisma.matchList.create({
    data: {
      title,
      description,
      userId: user.id,
    }
  })
  revalidatePath('/lists')
}

export async function addMatchToList(listId: string, matchId: string) {
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('User not found')

  const list = await prisma.matchList.findUnique({ where: { id: listId } })
  if (!list || list.userId !== user.id) throw new Error('List not found')

  // Get max order
  const maxItem = await prisma.matchListItem.findFirst({
    where: { listId },
    orderBy: { order: 'desc' }
  })
  const order = maxItem ? maxItem.order + 1 : 0

  await prisma.matchListItem.upsert({
    where: {
      listId_matchId: { listId, matchId }
    },
    update: {},
    create: {
      listId,
      matchId,
      order,
    }
  })

  revalidatePath(`/lists/${listId}`)
  revalidatePath(`/match/${matchId}`)
  revalidatePath('/lists')
}

export async function removeMatchFromList(listId: string, matchId: string) {
  await prisma.matchListItem.delete({
    where: {
      listId_matchId: { listId, matchId }
    }
  })
  revalidatePath(`/lists/${listId}`)
  revalidatePath(`/match/${matchId}`)
  revalidatePath('/lists')
}

export async function toggleFollow(externalId: string, name: string, type: string, logoUrl?: string) {
  if (!prisma.followedEntity) {
    throw new Error('Database client has not loaded the followedEntity model. Please restart npm run dev.')
  }
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: { username: 'demo_user', email: 'demo@example.com' }
    })
  }

  const existing = await prisma.followedEntity.findUnique({
    where: {
      userId_externalId_type: {
        userId: user.id,
        externalId: String(externalId),
        type,
      }
    }
  })

  let isFollowed = false;
  if (existing) {
    await prisma.followedEntity.delete({
      where: { id: existing.id }
    })
    isFollowed = false;
  } else {
    await prisma.followedEntity.create({
      data: {
        userId: user.id,
        externalId: String(externalId),
        name,
        type,
        logoUrl: logoUrl || null,
      }
    })
    isFollowed = true;
  }

  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath(`/match/${externalId}`)
  return isFollowed;
}

export async function getFollowedEntities() {
  if (!prisma.followedEntity) return []
  const user = await prisma.user.findFirst()
  if (!user) return []
  return prisma.followedEntity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
}

export async function checkIsFollowing(externalId: string, type: string) {
  if (!prisma.followedEntity) return false
  const user = await prisma.user.findFirst()
  if (!user) return false
  const existing = await prisma.followedEntity.findUnique({
    where: {
      userId_externalId_type: {
        userId: user.id,
        externalId: String(externalId),
        type,
      }
    }
  })
  return !!existing
}

export async function searchTeamsAction(query: string) {
  const { searchTeamsForFollow } = await import('@/lib/thesportsdb')
  return searchTeamsForFollow(query)
}

export async function deleteList(listId: string) {
  const user = await prisma.user.findFirst()
  if (!user) throw new Error('User not found')

  const list = await prisma.matchList.findUnique({ where: { id: listId } })
  if (!list || list.userId !== user.id) throw new Error('List not found')

  await prisma.matchListItem.deleteMany({ where: { listId } })
  await prisma.matchList.delete({ where: { id: listId } })
  revalidatePath('/lists')
}

export async function getOrFetchMatchStats(matchExternalId: string, dateIso: string, homeTeam: string, awayTeam: string) {
  const match = await prisma.match.findUnique({
    where: { externalId: matchExternalId }
  })
  
  // Check if we have valid API-Football stats cached (API-Football stats are an array)
  if (match?.statsJson && Array.isArray(match.statsJson) && match.statsJson.length > 0 && (match.statsJson[0] as any).team) {
    return match.statsJson;
  }
  
  // Fetch from API-Football
  const { getDetailedMatchStats } = await import('@/lib/api-football')
  const stats = await getDetailedMatchStats(dateIso, homeTeam, awayTeam)
  
  if (stats && stats.length > 0) {
    // Cache it if the match exists in the DB
    if (match) {
      await prisma.match.update({
        where: { id: match.id },
        data: { statsJson: stats }
      })
    }
    return stats;
  }
  
  return [];
}
