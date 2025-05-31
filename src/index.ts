import { GameRunner } from './game-runner';

// Create and start the game
const game = new GameRunner();
game.start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
