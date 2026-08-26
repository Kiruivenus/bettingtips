import { Request, Response } from 'express';

// In-memory cache for ESPN API responses (30-second TTL)
const cache: Record<string, { data: any[]; timestamp: number }> = {};
const CACHE_TTL = 30 * 1000;

const ESPN_SOCCER_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

function formatDateYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function normalizeEspnEvent(event: any, leagueFallback: string = 'Football') {
  const comp = event.competitions?.[0] || {};
  const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home') || comp.competitors?.[0];
  const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away') || comp.competitors?.[1];

  const statusType = comp.status?.type || {};
  const state = statusType.state; // "pre", "in", "post"

  let shortStatus = 'NS';
  if (state === 'in') {
    const detail = (statusType.shortDetail || statusType.detail || '').toUpperCase();
    if (detail.includes('HT') || detail.includes('HALF')) shortStatus = 'HT';
    else if (comp.status?.period === 1) shortStatus = '1H';
    else shortStatus = '2H';
  } else if (state === 'post') {
    shortStatus = 'FT';
  } else {
    shortStatus = 'NS';
  }

  // ESPN clock is provided in SECONDS (e.g. 600.0s = 10 mins). Convert to minutes!
  const rawClockSeconds = comp.status?.clock;
  const elapsedMinutes = state === 'in'
    ? (rawClockSeconds !== undefined && rawClockSeconds !== null ? Math.floor(rawClockSeconds / 60) : null)
    : state === 'post' ? 90 : null;

  const displayClock = statusType.shortDetail || statusType.detail || (elapsedMinutes !== null ? `${elapsedMinutes}'` : '');

  const homeScore = state !== 'pre' && homeComp?.score !== undefined ? parseInt(homeComp.score, 10) : null;
  const awayScore = state !== 'pre' && awayComp?.score !== undefined ? parseInt(awayComp.score, 10) : null;

  // Extract clean league title
  let leagueName = comp.altGameNote || comp.notes?.[0]?.headline || event.season?.name || leagueFallback;
  if (!leagueName || leagueName === 'Football') {
    leagueName = event.league?.name || leagueFallback;
  }

  // Extract team and league logos cleanly
  const homeLogo = homeComp?.team?.logo || homeComp?.team?.logos?.[0]?.href || '';
  const awayLogo = awayComp?.team?.logo || awayComp?.team?.logos?.[0]?.href || '';
  const leagueLogo = event.league?.logo || event.league?.logos?.[0]?.href || comp.league?.logos?.[0]?.href || '';

  return {
    fixture: {
      id: String(event.id),
      status: {
        elapsed: elapsedMinutes,
        displayClock: displayClock,
        short: shortStatus,
        detail: displayClock,
        state: state
      },
      date: event.date || comp.date,
    },
    league: {
      name: leagueName,
      logo: leagueLogo,
    },
    teams: {
      home: {
        name: homeComp?.team?.displayName || homeComp?.team?.name || 'Home Team',
        logo: homeLogo,
      },
      away: {
        name: awayComp?.team?.displayName || awayComp?.team?.name || 'Away Team',
        logo: awayLogo,
      },
    },
    goals: {
      home: isNaN(homeScore as any) ? null : homeScore,
      away: isNaN(awayScore as any) ? null : awayScore,
    },
  };
}

async function fetchEspnScoreboard(endpoint: string): Promise<any[]> {
  try {
    const res = await fetch(`${ESPN_SOCCER_BASE}/${endpoint}`);
    if (!res.ok) return [];
    const data = await res.json();
    
    const leagueName = data.leagues?.[0]?.name || 'Football';
    const events = data.events || [];
    
    return events.map((evt: any) => normalizeEspnEvent(evt, leagueName));
  } catch (error) {
    console.error(`Error fetching ESPN endpoint (${endpoint}):`, error);
    return [];
  }
}

// Helper to fetch multiple dates/leagues in parallel and deduplicate by fixture ID
async function aggregateEspnFixtures(dateStrings: string[]): Promise<any[]> {
  const promises: Promise<any[]>[] = [];

  for (const dateStr of dateStrings) {
    // Universal scoreboard for date
    promises.push(fetchEspnScoreboard(`all/scoreboard?dates=${dateStr}&limit=500`));

    // Selective top leagues for date to ensure deep coverage
    for (const code of ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1', 'uefa.champions']) {
      promises.push(fetchEspnScoreboard(`${code}/scoreboard?dates=${dateStr}&limit=100`));
    }
  }

  const results = await Promise.all(promises);
  const map = new Map<string, any>();

  for (const list of results) {
    for (const match of list) {
      if (!map.has(match.fixture.id)) {
        map.set(match.fixture.id, match);
      }
    }
  }

  return Array.from(map.values());
}

export const getLiveMatches = async (req: Request, res: Response) => {
  const cacheKey = 'live_espn';
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  try {
    const todayStr = formatDateYYYYMMDD(new Date());
    const allToday = await aggregateEspnFixtures([todayStr]);

    // Live matches: state === "in"
    let liveMatches = allToday.filter(m => m.fixture.status.state === 'in');

    // If no live matches in-play at this moment, include today's closest upcoming/recent matches
    if (liveMatches.length === 0) {
      liveMatches = allToday.slice(0, 50);
    }

    cache[cacheKey] = { data: liveMatches, timestamp: now };
    return res.status(200).json(liveMatches);
  } catch (error: any) {
    console.error('ESPN Live Scores Error:', error);
    return res.status(500).json({ message: 'Failed to load live matches from ESPN', error: error.message });
  }
};

export const getUpcomingMatches = async (req: Request, res: Response) => {
  const cacheKey = 'upcoming_espn';
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  try {
    const dates: string[] = [];
    const today = new Date();

    // Upcoming: today + next 6 days
    for (let i = 0; i <= 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(formatDateYYYYMMDD(d));
    }

    const allUpcoming = await aggregateEspnFixtures(dates);
    const upcomingFiltered = allUpcoming
      .filter(m => m.fixture.status.state === 'pre')
      .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());

    cache[cacheKey] = { data: upcomingFiltered, timestamp: now };
    return res.status(200).json(upcomingFiltered);
  } catch (error: any) {
    console.error('ESPN Upcoming Matches Error:', error);
    return res.status(500).json({ message: 'Failed to load upcoming matches', error: error.message });
  }
};

export const getPastResults = async (req: Request, res: Response) => {
  const cacheKey = 'results_espn';
  const now = Date.now();

  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.status(200).json(cache[cacheKey].data);
  }

  try {
    const dates: string[] = [];
    const today = new Date();

    // Results: past 5 days
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(formatDateYYYYMMDD(d));
    }

    const allResults = await aggregateEspnFixtures(dates);
    const resultsFiltered = allResults
      .filter(m => m.fixture.status.state === 'post')
      .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

    cache[cacheKey] = { data: resultsFiltered, timestamp: now };
    return res.status(200).json(resultsFiltered);
  } catch (error: any) {
    console.error('ESPN Past Results Error:', error);
    return res.status(500).json({ message: 'Failed to load past match results', error: error.message });
  }
};
