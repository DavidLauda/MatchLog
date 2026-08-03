export async function fetchApiFootball(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    console.warn("No API_FOOTBALL_KEY found in .env");
    return null;
  }

  const url = new URL(`https://v3.football.api-sports.io/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
        'x-rapidapi-key': apiKey
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error("API-Football error", res.status);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("API-Football network error:", err);
    return null;
  }
}

export async function findFixtureByDateAndTeams(dateIso: string, homeTeam: string, awayTeam: string) {
  console.log(`[API-Football] Searching for match: ${homeTeam} vs ${awayTeam} on ${dateIso}`);
  const date = dateIso.split('T')[0]; // YYYY-MM-DD
  const season = date.split('-')[0];
  
  // 1. Find the API-Football team ID for the home team
  const teamData = await fetchApiFootball('teams', { search: homeTeam });
  if (!teamData || !teamData.response || teamData.response.length === 0) {
    console.log(`[API-Football] Could not find team ID for ${homeTeam}`);
    return null;
  }
  
  const teamId = teamData.response[0].team.id;
  console.log(`[API-Football] Found team ID for ${homeTeam}: ${teamId}`);
  
  // 2. Fetch fixtures for this team in the guessed season
  let fixturesData = await fetchApiFootball('fixtures', { team: teamId.toString(), season });
  
  let match = fixturesData?.response?.find((f: any) => f.fixture.date.startsWith(date));
  
  // 3. If match not found, it might belong to the previous season (e.g. Feb 2024 is season 2023)
  if (!match) {
    console.log(`[API-Football] Match not found in season ${season}, trying previous season...`);
    const prevSeason = (parseInt(season) - 1).toString();
    fixturesData = await fetchApiFootball('fixtures', { team: teamId.toString(), season: prevSeason });
    match = fixturesData?.response?.find((f: any) => f.fixture.date.startsWith(date));
  }
  
  // If still not found, check timezone shift (date before or after)
  if (!match && fixturesData?.response) {
    console.log(`[API-Football] Date mismatch, doing fuzzy search on away team (${awayTeam})...`);
    // Just find the match where away team matches
    const aSearch = awayTeam.toLowerCase();
    match = fixturesData.response.find((f: any) => {
       const hApi = f.teams.home.name.toLowerCase();
       const aApi = f.teams.away.name.toLowerCase();
       const hSearch = homeTeam.toLowerCase();
       return (hApi.includes(hSearch) || hSearch.includes(hApi)) && 
              (aApi.includes(aSearch) || aSearch.includes(aApi));
    });
  }

  if (match) {
     console.log(`[API-Football] FOUND MATCH! ID: ${match.fixture.id}`);
  } else {
     console.log(`[API-Football] MATCH STILL NOT FOUND!`);
  }

  return match || null;
}

export async function getDetailedMatchStats(dateIso: string, homeTeam: string, awayTeam: string) {
  const fixture = await findFixtureByDateAndTeams(dateIso, homeTeam, awayTeam);
  if (!fixture) return null;
  
  console.log(`[API-Football] Fetching stats for fixture ${fixture.fixture.id}`);
  const statsData = await fetchApiFootball('fixtures/statistics', { fixture: fixture.fixture.id.toString() });
  if (!statsData || !statsData.response || statsData.response.length === 0) {
      console.log(`[API-Football] NO STATS AVAILABLE FOR THIS FIXTURE!`);
      return [];
  }
  
  console.log(`[API-Football] Successfully fetched stats!`);
  return statsData.response; // Array of 2 objects (home stats, away stats)
}
