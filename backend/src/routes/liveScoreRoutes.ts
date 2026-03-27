import { Router } from 'express';
import { getLiveMatches, getUpcomingMatches, getPastResults } from '../controllers/liveScoreController';

const router = Router();

// These are public routes to allow all visitors to see live scores
router.get('/live', getLiveMatches);
router.get('/upcoming', getUpcomingMatches);
router.get('/results', getPastResults);

export default router;
