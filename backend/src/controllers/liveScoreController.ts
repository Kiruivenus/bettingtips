import { Request, Response } from 'express';

// Simple in-memory cache
let cache: { 
  data: any, 
  timestamp: number 
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 60 * 1000; // 60 seconds

// Mock Data for fallback
const mockMatches = [
  {
    fixture: { id: 1, status: { elapsed: 65, short: '2H' }, date: new Date().toISOString() },
    league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    teams: {
      home: { name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
      away: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' }
    },
    goals: { home: 2, away: 2 }
  },
  {
    fixture: { id: 2, status: { elapsed: 12, short: '1H' }, date: new Date().toISOString() },
    league: { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
    teams: {
      home: { name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
      away: { name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' }
    },
    goals: { home: 1, away: 0 }
  }
];

export const getLiveMatches = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    // Check cache
    const now = Date.now();
    if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
      return res.status(200).json(cache.data);
    }

    if (!apiKey || apiKey === 'your_api_key_here') {
      console.log('Using mock data for live scores (no API key)');
      return res.status(200).json(mockMatches);
    }

    const response = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch from Football API');
    }

    const data = await response.json();
    const matches = data.response || [];

    // Update cache
    cache = { data: matches, timestamp: now };

    res.status(200).json(matches);
  } catch (error: any) {
    console.error('Live Scores Error:', error.message);
    res.status(500).json({ message: 'Error fetching live scores', error: error.message });
  }
};

export const getUpcomingMatches = async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.FOOTBALL_API_KEY;
      const date = new Date().toISOString().split('T')[0];

      if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(200).json(mockMatches.map(m => ({ ...m, fixture: { ...m.fixture, status: { short: 'NS' } } })));
      }

      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
  
      if (!response.ok) {
          throw new Error('Failed to fetch from Football API');
      }
  
      const data = await response.json();
      res.status(200).json(data.response || []);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching upcoming matches', error: error.message });
    }
};

export const getPastResults = async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.FOOTBALL_API_KEY;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const date = yesterday.toISOString().split('T')[0];

      if (!apiKey || apiKey === 'your_api_key_here') {
        return res.status(200).json(mockMatches.map(m => ({ ...m, fixture: { ...m.fixture, status: { short: 'FT' } } })));
      }

      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}&status=FT`, {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
          'x-rapidapi-host': 'v3.football.api-sports.io'
        }
      });
  
      if (!response.ok) {
          throw new Error('Failed to fetch from Football API');
      }
  
      const data = await response.json();
      res.status(200).json(data.response || []);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching past results', error: error.message });
    }
};
