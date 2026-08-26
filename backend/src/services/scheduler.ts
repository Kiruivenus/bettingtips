import { runPredictionGenerationService, settleAndLockFixtures } from '../controllers/aiPredictionController';

let isRunning = false;

export function initPredictionScheduler() {
  console.log('[Scheduler] Initializing automated prediction & settlement background service...');

  // Run initial pass after 10 seconds of startup
  setTimeout(async () => {
    runBackgroundPass();
  }, 10000);

  // Run background pass every 15 minutes (900000 ms)
  setInterval(async () => {
    runBackgroundPass();
  }, 15 * 60 * 1000);
}

async function runBackgroundPass() {
  if (isRunning) return;
  isRunning = true;

  try {
    console.log('[Scheduler] Starting automated prediction generation pass...');
    const genResult = await runPredictionGenerationService();
    console.log('[Scheduler]', genResult.message);

    console.log('[Scheduler] Running match cutoff lock and auto-settlement pass...');
    await settleAndLockFixtures();
    console.log('[Scheduler] Settlement pass completed.');
  } catch (err) {
    console.error('[Scheduler Error]', err);
  } finally {
    isRunning = false;
  }
}
