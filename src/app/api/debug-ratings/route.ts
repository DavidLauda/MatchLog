import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const ratings = await prisma.rating.findMany({
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { watchedAt: 'desc' }
  })
  
  return NextResponse.json(
    ratings.map(r => ({
      match: `${r.match.homeTeam.name} vs ${r.match.awayTeam.name}`,
      stars: r.stars,
      type: typeof r.stars,
    }))
  )
}
