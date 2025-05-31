import * as readline from 'readline';
import { GameEngine } from './game-engine';
import { CommandParser } from './command-parser';

export class GameRunner {
  private engine: GameEngine;
  private parser: CommandParser;
  private rl: readline.Interface;
  private running: boolean = false;

  constructor() {
    this.engine = new GameEngine();
    this.parser = new CommandParser(this.engine);
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public async start(): Promise<void> {
    try {
      console.log('Loading game data...');
      await this.engine.initialize();
      
      console.log('======================================');
      console.log('Welcome to Escape Planning!');
      console.log('A text adventure game');
      console.log('Type "help" for a list of commands');
      console.log('======================================');
      
      // Initial look around
      this.engine.lookAround();
      
      this.running = true;
      this.promptUser();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  private promptUser(): void {
    this.rl.question('> ', (input) => {
      if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        this.stop();
        return;
      }
      
      this.parser.parseCommand(input);
      
      if (this.running) {
        this.promptUser();
      }
    });
  }

  public stop(): void {
    this.running = false;
    console.log('Thanks for playing!');
    this.rl.close();
  }
}

// Run the game if this file is executed directly
if (require.main === module) {
  const runner = new GameRunner();
  runner.start().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
