# MatchLog — Project Brief
*A Letterboxd-style webapp for logging and rating football matches you've watched*

## 1. Overview

A personal web app where I can log football matches I've watched, rate them (1–5 stars), write short reviews, and view full match stats (score, scorers, cards, lineups). Single-user for now, but the data model should support multiple users later without a rebuild.

**Core loop:** search for a match → log it as watched → rate it → see it in my diary, with the match's full stats available on its own page.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Frontend + API routes in one project |
| Database | PostgreSQL (hosted on Supabase or Neon, free tier) | Relational data fits matches/ratings well |
| ORM | Prisma | Type-safe queries, easy migrations |
| Styling | Tailwind CSS | Fast to build with, easy for an agent to generate |
| Auth | None for MVP (single user) | Add NextAuth.js / Supabase Auth later if needed |
| Hosting | Vercel (free tier) | One-click deploy from GitHub, native Next.js support |
| Sports data | API-Football (api-sports.io), free tier ~100 req/day | Best stats depth on a free plan |

## 3. MVP Feature List

### Must-have
- [ ] Search for a match (by team/date/competition) via the sports API
- [ ] Log a match as "watched" with a star rating (1–5) and optional short review text
- [ ] Match detail page: final score, scorers, cards, lineups, competition, date
- [ ] Diary view: chronological list of everything I've logged
- [ ] Edit/delete a logged rating

### Nice-to-have (post-MVP)
- [ ] Lists (e.g. "Best comebacks", "Matches I watched live")
- [ ] Tags/vibes (thriller, blowout, controversial)
- [ ] Yearly recap / stats summary (most-watched team, avg rating, etc.)
- [ ] Multi-user support (auth, following, public profiles)

## 4. Data Model

Using Prisma schema syntax. This is sport-agnostic where possible (generic `Match` + JSON `stats` blob) so it isn't locked to football forever, but the MVP only implements football.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  createdAt DateTime @default(now())

  ratings   Rating[]
  lists     MatchList[]
}

model Team {
  id         String  @id @default(cuid())
  externalId String  @unique // ID from the sports API
  name       String
  logoUrl    String?
  country    String?

  homeMatches Match[] @relation("HomeTeam")
  awayMatches Match[] @relation("AwayTeam")
}

model Match {
  id          String   @id @default(cuid())
  externalId  String   @unique // ID from the sports API, used to avoid re-fetching
  sport       String   @default("football")
  competition String
  season      String?
  matchDate   DateTime

  homeTeamId  String
  homeTeam    Team     @relation("HomeTeam", fields: [homeTeamId], references: [id])
  awayTeamId  String
  awayTeam    Team     @relation("AwayTeam", fields: [awayTeamId], references: [id])

  homeScore   Int?
  awayScore   Int?

  // Full raw stats payload from the API (lineups, cards, xG, etc.)
  // Keeping this as JSON means adding new stat types never requires a migration.
  statsJson   Json?

  createdAt   DateTime @default(now())

  ratings     Rating[]
  listItems   MatchListItem[]

  @@index([matchDate])
}

model Rating {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  matchId   String
  match     Match    @relation(fields: [matchId], references: [id])

  stars     Int      // 1–5 (consider storing as 1–10 internally if you want half-stars)
  review    String?
  watchedAt DateTime @default(now()) // date the user logged/watched it, distinct from matchDate

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, matchId]) // one rating per user per match
}

model MatchList {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  title       String
  description String?
  createdAt   DateTime @default(now())

  items       MatchListItem[]
}

model MatchListItem {
  id        String    @id @default(cuid())
  listId    String
  list      MatchList @relation(fields: [listId], references: [id])
  matchId   String
  match     Match     @relation(fields: [matchId], references: [id])
  order     Int       @default(0)

  @@unique([listId, matchId])
}
```

**Notes:**
- `statsJson` holds whatever the API returns for lineups/cards/possession/etc. — parse only what you need in the UI, no need to normalize every field into columns.
- `externalId` on `Team` and `Match` is the join key back to API-Football — always check this before re-fetching a match, so you don't burn API calls on data you already have.
- `Rating.watchedAt` vs `Match.matchDate`: these are different — you might log a match you watched on a delayed replay, weeks after it aired.

## 5. Sports Data Integration Notes

- **Provider:** API-Football via api-sports.io — free tier is ~100 requests/day
- **Caching rule:** once a match has ended, its stats never change. Fetch once, store the full response in `statsJson`, and never re-fetch that match again. This makes the 100/day limit effectively "100 new matches logged per day," which is plenty for personal use.
- **Auth:** API key goes in `x-apisports-key` header, kept server-side only (in a `.env` file, never exposed to the frontend)
- **Typical flow:**
  1. User searches for a team/date → call API's fixtures endpoint → show results to pick from
  2. User selects a match → check DB for existing `externalId` → if not found, fetch full match + stats from API, store it
  3. User rates the match → write to `Rating` table

## 6. Suggested Build Order (for Antigravity)

1. Scaffold Next.js + TypeScript + Tailwind project
2. Set up Prisma with the schema above, connect to Supabase/Neon Postgres, run first migration
3. Build API route(s) to search/fetch matches from API-Football and upsert into the DB
4. Build the match detail page (stats display)
5. Build the "log a match" flow (rating + review form)
6. Build the diary view (list of all logged ratings, newest first)
7. Polish: search UI, empty states, basic styling pass

## 7. Environment Variables Needed

```
DATABASE_URL=            # from Supabase/Neon
API_FOOTBALL_KEY=        # from api-sports.io dashboard
```
