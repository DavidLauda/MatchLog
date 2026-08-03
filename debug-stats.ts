import { PrismaClient } from '@prisma/client'
import { getOrFetchMatchStats } from './src/app/actions'
import { getFixtureDetails } from './src/lib/thesportsdb'
import dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function debug() {
  const match = await prisma.match.findFirst({
      include: { homeTeam: true, awayTeam: true }
  })
  
  if (!match) {
      console.log("No matches in DB!");
      return;
  }
  
  console.log(`Found match in DB: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
  
  const details = await getFixtureDetails(match.externalId);
  if (!details) return;
  
  console.log(`TheSportsDB details: date=${details.fixture.date}`);
  console.log(`DB statsJson:`, JSON.stringify(match.statsJson).substring(0, 100));
  
  const stats = await getOrFetchMatchStats(
      match.externalId, 
      details.fixture.date, 
      details.teams.home.name, 
      details.teams.away.name
  );
  
  console.log("Returned stats length:", stats ? stats.length : 0);
  if (stats && stats.length > 0) {
      console.log("Sample stat:", stats[0].statistics[0]);
  } else {
      console.log("STATS FETCH FAILED.");
  }
}

debug().catch(console.error).finally(() => prisma.$disconnect())
