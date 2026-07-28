import prisma from './src/lib/prisma'
import { getFixtureDetails } from './src/lib/thesportsdb'

async function main() {
  const matchId = '2521780' // Girona vs Arsenal
  const details = await getFixtureDetails(matchId)
  if (!details) throw new Error('Match not found from API')

  console.log("DETAILS:", JSON.stringify(details, null, 2))

  const homeTeamApi = details.teams.home
  const awayTeamApi = details.teams.away

  const homeTeam = await prisma.team.upsert({
    where: { externalId: homeTeamApi.id.toString() },
    update: {},
    create: {
      externalId: homeTeamApi.id.toString(),
      name: homeTeamApi.name || 'Unknown',
      logoUrl: homeTeamApi.logo || '',
    }
  })

  const awayTeam = await prisma.team.upsert({
    where: { externalId: awayTeamApi.id.toString() },
    update: {},
    create: {
      externalId: awayTeamApi.id.toString(),
      name: awayTeamApi.name || 'Unknown',
      logoUrl: awayTeamApi.logo || '',
    }
  })

  const match = await prisma.match.create({
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

  console.log("SUCCESS!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
