import { GameEngine } from './game-engine';
import { CommandParser } from './command-parser';
import { BrowserRunner } from './browser-runner';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const runner = new BrowserRunner('game-output', 'game-input', 'game-button');
  runner.start();
});