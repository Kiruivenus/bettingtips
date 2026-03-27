import { Request, Response } from 'express';

// In-memory cache to stay within rate limits (10 req/min)
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

const FOOTBALL_DATA_BASE = 'https://api.football-data.org/v4';

// Normalize Football-Data.org response to our frontend format
function normalizeMatch(match: any) {
  return {
    fixture: {
      id: match.id,
      status: {
        elapsed: match.minute || null,
        short: mapStatus(match.status),
      },
      date: match.utcDate,
    },
    league: {
      name: match.competition?.name || 'Unknown',
      logo: match.competition?.emblem || '',
    },
    teams: {
      home: {
        name: match.homeTeam?.shortName || match.homeTeam?.name || 'TBD',
        logo: match.homeTeam?.crest || '',
      },
      away: {
        name: match.awayTeam?.shortName || match.awayTeam?.name || 'TBD',
        logo: match.awayTeam?.crest || '',
      },
    },
    goals: {
      home: match.score?.fullTime?.home ?? match.score?.halfTime?.home ?? null,
      away: match.score?.fullTime?.away ?? match.score?.halfTime?.away ?? null,
    },
  };
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    SCHEDULED: 'NS',
    TIMED: 'NS',
    IN_PLAY: '2H',
    PAUSED: 'HT',
    FINISHED: 'FT',
    SUSPENDED: 'SUSP',
    POSTPONED: 'PST',
    CANCELLED: 'CANC',
    AWARDED: 'FT',
    LIVE: '1H',
  };
  return statusMap[status] || status;
}

async function fetchFromAPI(endpoint: string, cacheKey: string) {
  const apiKey = process.env.FOOTBALL_API_KEY;

  // Check cache first
  const now = Date.now();
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
    return cache[cacheKey].data;
  }

  if (!apiKey || apiKey === 'your_api_key_here') {
    return null; // Will trigger mock data fallback
  }

  const response = await fetch(`${FOOTBALL_DATA_BASE}${endpoint}`, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const normalized = (data.matches || []).map(normalizeMatch);

  cache[cacheKey] = { data: normalized, timestamp: now };
  return normalized;
}

// Mock data fallback
const mockMatches = [
  {
    fixture: { id: 1, status: { elapsed: 65, short: '2H' }, date: new Date().toISOString() },
    league: { name: 'Premier League', logo: 'https://crests.football-data.org/PL.png' },
    teams: {
      home: { name: 'Man City', logo: 'https://crests.football-data.org/65.png' },
      away: { name: 'Liverpool', logo: 'https://crests.football-data.org/64.png' },
    },
    goals: { home: 2, away: 2 },
  },
  {
    fixture: { id: 2, status: { elapsed: 12, short: '1H' }, date: new Date().toISOString() },
    league: { name: 'La Liga', logo: 'https://crests.football-data.org/PD.png' },
    teams: {
      home: { name: 'Real Madrid', logo: 'https://crests.football-data.org/86.png' },
      away: { name: 'Barcelona', logo: 'https://crests.football-data.org/81.png' },
    },
    goals: { home: 1, away: 0 },
  },
];

export const getLiveMatches = async (req: Request, res: Response) => {
  try {
    // Football-Data.org uses status=LIVE for in-play matches
    const data = await fetchFromAPI('/matches?status=LIVE', 'live');
    if (!data) return res.status(200).json(mockMatches);
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Live Scores Error:', error.message);
    res.status(200).json(mockMatches); // Graceful fallback
  }
};

export const getUpcomingMatches = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const data = await fetchFromAPI(`/matches?status=SCHEDULED,TIMED&dateFrom=${today}&dateTo=${nextWeek}`, 'upcoming');
    if (!data) return res.status(200).json(mockMatches.map(m => ({ ...m, fixture: { ...m.fixture, status: { short: 'NS', elapsed: null } }, goals: { home: null, away: null } })));
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Upcoming Matches Error:', error.message);
    res.status(500).json({ message: 'Error fetching upcoming matches', error: error.message });
  }
};

export const getPastResults = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const data = await fetchFromAPI(`/matches?status=FINISHED&dateFrom=${lastWeek}&dateTo=${today}`, 'results');
    if (!data) return res.status(200).json(mockMatches.map(m => ({ ...m, fixture: { ...m.fixture, status: { short: 'FT', elapsed: 90 } } })));
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Past Results Error:', error.message);
    res.status(500).json({ message: 'Error fetching past results', error: error.message });
  }
};
