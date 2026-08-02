export async function fetchApi(endpoint: string, params: Record<string, string> = {}) {
  const API_KEY = process.env.THESPORTSDB_API_KEY || '123';
  const API_HOST = `www.thesportsdb.com/api/v1/json/${API_KEY}`;
  const url = new URL(`https://${API_HOST}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 } 
    });

    if (response.status === 429) {
      console.warn(`TheSportsDB rate limited (429) on ${endpoint}. Returning cached/empty fallback.`);
      return null;
    }

    if (!response.ok) {
      console.error(`TheSportsDB error (${response.status}): ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Network error fetching from TheSportsDB (${endpoint}):`, err);
    return null;
  }
}

const KNOWN_TEAM_BADGES: Record<string, string> = {
  '133738': 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png',
  'Real Madrid': 'https://r2.thesportsdb.com/images/media/team/badge/vwvwrw1473502969.png',
  '133739': 'https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png',
  'Barcelona': 'https://r2.thesportsdb.com/images/media/team/badge/wq9sir1639406443.png',
  '133604': 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
  'Arsenal': 'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png',
  '133613': 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
  'Manchester City': 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
  'Man City': 'https://r2.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png',
  '133664': 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png',
  'Bayern Munich': 'https://r2.thesportsdb.com/images/media/team/badge/01ogkh1716960412.png',
  '133601': 'https://www.thesportsdb.com/images/media/team/badge/97mehy1784645865.png',
  'Liverpool': 'https://www.thesportsdb.com/images/media/team/badge/97mehy1784645865.png',
  '133612': 'https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png',
  'Manchester United': 'https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png',
  'Man United': 'https://r2.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png',
  '133602': 'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png',
  'Chelsea': 'https://r2.thesportsdb.com/images/media/team/badge/kfaher1737969724.png',
  '133676': 'https://r2.thesportsdb.com/images/media/team/badge/uxf0gr1742983727.png',
  'Juventus': 'https://r2.thesportsdb.com/images/media/team/badge/uxf0gr1742983727.png',
  '133714': 'https://r2.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png',
  'Paris Saint-Germain': 'https://r2.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png',
  'PSG': 'https://r2.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png',
  '133667': 'https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png',
  'AC Milan': 'https://r2.thesportsdb.com/images/media/team/badge/wvspur1448806617.png',
  '133666': 'https://r2.thesportsdb.com/images/media/team/badge/3x9k851726760113.png',
  'Inter Milan': 'https://r2.thesportsdb.com/images/media/team/badge/3x9k851726760113.png',
  '133681': 'https://r2.thesportsdb.com/images/media/team/badge/ryhu6d1617113103.png',
  '133665': 'https://r2.thesportsdb.com/images/media/team/badge/fhm9v51552134916.png',
  'Borussia Dortmund': 'https://r2.thesportsdb.com/images/media/team/badge/fhm9v51552134916.png',
  '133729': 'https://r2.thesportsdb.com/images/media/team/badge/0ulh3q1719984315.png',
  'Atletico Madrid': 'https://r2.thesportsdb.com/images/media/team/badge/0ulh3q1719984315.png',
  '133616': 'https://r2.thesportsdb.com/images/media/team/badge/dfyfhl1604094109.png',
  'Tottenham Hotspur': 'https://r2.thesportsdb.com/images/media/team/badge/dfyfhl1604094109.png',
  'Tottenham': 'https://r2.thesportsdb.com/images/media/team/badge/dfyfhl1604094109.png',
};

function mapEventToApiFootballFormat(event: any, customLogos: Record<string, string> = {}) {
  let dateStr = event.strTimestamp;
  if (!dateStr) {
    const d = event.dateEvent || new Date().toISOString().split('T')[0];
    const t = event.strTime || '00:00:00';
    dateStr = `${d}T${t}`;
  }
  
  let status = event.strStatus;
  if (status === 'Match Finished') status = 'FT';
  else if (status === 'Not Started' || !status) status = 'NS';
  else if (status === 'Postponed') status = 'PST';

  const homeId = String(event.idHomeTeam || 'unknown-home');
  const homeName = event.strHomeTeam || 'Unknown';
  const homeLogo = customLogos[homeId] || customLogos[homeName] || KNOWN_TEAM_BADGES[homeId] || KNOWN_TEAM_BADGES[homeName] || event.strHomeTeamBadge || '';

  const awayId = String(event.idAwayTeam || 'unknown-away');
  const awayName = event.strAwayTeam || 'Unknown';
  const awayLogo = customLogos[awayId] || customLogos[awayName] || KNOWN_TEAM_BADGES[awayId] || KNOWN_TEAM_BADGES[awayName] || event.strAwayTeamBadge || '';

  return {
    fixture: {
      id: event.idEvent || event.id || '',
      date: dateStr,
      status: {
        short: status
      },
      venue: {
        name: event.strVenue || 'Unknown Venue',
        city: event.strCity || ''
      },
      referee: event.strOfficial || 'Unknown'
    },
    league: {
      name: event.strLeague || 'Unknown',
      season: event.strSeason || ''
    },
    teams: {
      home: {
        id: homeId,
        name: homeName,
        logo: homeLogo
      },
      away: {
        id: awayId,
        name: awayName,
        logo: awayLogo
      }
    },
    goals: {
      home: event.intHomeScore != null && event.intHomeScore !== "" && !isNaN(parseInt(event.intHomeScore, 10)) ? parseInt(event.intHomeScore, 10) : null,
      away: event.intAwayScore != null && event.intAwayScore !== "" && !isNaN(parseInt(event.intAwayScore, 10)) ? parseInt(event.intAwayScore, 10) : null
    }
  };
}

export async function searchFixturesByTeamName(teamName: string) {
  const teamsResponse = await fetchApi('searchteams.php', { t: teamName });
  if (!teamsResponse || !teamsResponse.teams || teamsResponse.teams.length === 0) return [];
  
  const teamId = teamsResponse.teams[0].idTeam;
  
  const [lastResponse, nextResponse] = await Promise.all([
    fetchApi('eventslast.php', { id: teamId }),
    fetchApi('eventsnext.php', { id: teamId })
  ]);
  
  const allEvents = [];
  if (lastResponse && lastResponse.results) {
    allEvents.push(...lastResponse.results);
  }
  if (nextResponse && nextResponse.events) {
    allEvents.push(...nextResponse.events);
  }
  
  const mapped = allEvents.map(e => mapEventToApiFootballFormat(e));
  return mapped.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
}

export async function getFixtureDetails(fixtureId: string) {
  const response = await fetchApi('lookupevent.php', { id: fixtureId });
  if (!response || !response.events || response.events.length === 0) return null;
  return mapEventToApiFootballFormat(response.events[0]);
}

export async function getEventStats(fixtureId: string) {
  const response = await fetchApi('lookupeventstats.php', { id: fixtureId });
  if (!response || !response.eventstats) return [];
  return response.eventstats;
}

export async function getLineups(fixtureId: string) {
  const response = await fetchApi('lookuplineup.php', { id: fixtureId });
  if (!response || !response.lineup) return [];
  return response.lineup;
}

export async function fetchFollowedFixtures(followedEntities: any[]) {
  if (!followedEntities || followedEntities.length === 0) {
    return { recent: [], upcoming: [] };
  }

  const allEvents: any[] = [];
  
  // Country mapping to National Team IDs ONLY (no leagues fetched to prevent unwanted tournaments like Mexican Primera League)
  const countryTeamMap: Record<string, string> = {
    'England': '133602',
    'Spain': '133614',
    'Germany': '133612',
    'Italy': '133613',
    'France': '133610',
    'Brazil': '133601',
    'Argentina': '133600',
    'USA': '133615',
    'Portugal': '133611',
    'Netherlands': '133608'
  };

  const customLogos: Record<string, string> = {};
  for (const e of followedEntities) {
    if (e.logoUrl) {
      customLogos[String(e.externalId)] = e.logoUrl;
      if (e.name) customLogos[e.name] = e.logoUrl;
    }
  }

  // Process in sequential chunks of 2 to avoid triggering HTTP 429 (Too Many Requests) on free API tier
  const chunkSize = 2;
  for (let i = 0; i < followedEntities.length; i += chunkSize) {
    const chunk = followedEntities.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (entity) => {
        try {
          if (entity.type === 'club' || entity.type === 'team') {
            const [last, next] = await Promise.all([
              fetchApi('eventslast.php', { id: entity.externalId }),
              fetchApi('eventsnext.php', { id: entity.externalId })
            ]);
            if (last?.results) allEvents.push(...last.results);
            if (next?.events) allEvents.push(...next.events);
          } else if (entity.type === 'league') {
            const [last, next] = await Promise.all([
              fetchApi('eventspastleague.php', { id: entity.externalId }),
              fetchApi('eventsnextleague.php', { id: entity.externalId })
            ]);
            if (last?.events) allEvents.push(...last.events);
            if (next?.events) allEvents.push(...next.events);
          } else if (entity.type === 'country') {
            const teamId = countryTeamMap[entity.name] || countryTeamMap[entity.externalId];
            if (teamId) {
              const [lastT, nextT] = await Promise.all([
                fetchApi('eventslast.php', { id: teamId }),
                fetchApi('eventsnext.php', { id: teamId })
              ]);
              if (lastT?.results) allEvents.push(...lastT.results);
              if (nextT?.events) allEvents.push(...nextT.events);
            }
          }
        } catch (err) {
          console.error(`Error fetching events for ${entity.name}:`, err);
        }
      })
    );
    if (i + chunkSize < followedEntities.length) {
      await new Promise(res => setTimeout(res, 150));
    }
  }

  const seen = new Set<string>();
  const uniqueEvents: any[] = [];
  for (const ev of allEvents) {
    const id = ev?.idEvent || ev?.id;
    if (id && !seen.has(id)) {
      seen.add(id);
      uniqueEvents.push(ev);
    }
  }

  const mapped = uniqueEvents.map(e => mapEventToApiFootballFormat(e, customLogos));
  const now = new Date().getTime();

  const recent: any[] = [];
  const upcoming: any[] = [];

  for (const m of mapped) {
    const matchTime = new Date(m.fixture.date).getTime();
    if (m.fixture.status.short === 'FT' || m.fixture.status.short === 'AET' || m.fixture.status.short === 'PEN' || matchTime < now) {
      recent.push(m);
    } else {
      upcoming.push(m);
    }
  }

  recent.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());
  upcoming.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());

  return { recent, upcoming };
}

export async function searchTeamsForFollow(query: string) {
  if (!query || query.trim().length === 0) return [];
  const res = await fetchApi('searchteams.php', { t: query.trim() });
  if (!res || !res.teams) return [];
  return res.teams
    .filter((t: any) => t.strSport === 'Soccer' || !t.strSport)
    .map((t: any) => ({
      externalId: t.idTeam,
      name: t.strTeam,
      logoUrl: t.strTeamBadge || t.strTeamLogo || KNOWN_TEAM_BADGES[t.idTeam] || KNOWN_TEAM_BADGES[t.strTeam] || null,
      country: t.strCountry || null,
      type: 'club'
    }));
}
