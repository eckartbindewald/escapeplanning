import { GameEngine } from './game-engine';
import { CommandParser } from './command-parser';

// Simple browser-based runner using HTML input/output
export class BrowserRunner {
  private engine: GameEngine;
  private parser: CommandParser;
  private outputEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private buttonEl: HTMLButtonElement;

  constructor(outputId: string, inputId: string, buttonId: string) {
    this.engine = new GameEngine();
    this.parser = new CommandParser(this.engine);
    this.outputEl = document.getElementById(outputId)!;
    this.inputEl = document.getElementById(inputId)! as HTMLInputElement;
    this.buttonEl = document.getElementById(buttonId)! as HTMLButtonElement;
    this.buttonEl.onclick = () => this.handleInput();
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleInput();
    });
    // Look Around button
    const lookBtn = document.getElementById('look-button');
    if (lookBtn) lookBtn.onclick = () => this.handleLookAround();
  }

  public async start(): Promise<void> {
    await this.engine.initialize();
    this.print('Welcome to Escape Planning! Type "help" for commands.');
    this.renderLocation();
    this.renderLog();
  }

  private handleInput(): void {
    const input = this.inputEl.value.trim();
    if (!input) return;
    this.inputEl.value = '';
    this.parser.parseCommand(input);
    this.renderLocation();
    this.renderLog();
  }

  private print(msg: string): void {
    this.outputEl.innerHTML += `<div>${msg}</div>`;
  }

  private handleLookAround(): void {
    // TEST: Always print a visible test message
    this.outputEl.innerHTML += `<pre style='color: red; font-size: 2em;'>TEST MESSAGE</pre>`;
    // Print location, characters, and items
    const desc = this.engine.lookAround();
    this.outputEl.innerHTML += `<pre>${desc}</pre>`;
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }

  private renderLocation(): void {
    const state = this.engine.getState();
    const location = this.engine.getNodeById(state.currentLocation);
    // Debug logging
    console.log('Current location ID:', state.currentLocation, 'Location object:', location);
    if (!location) {
      this.outputEl.innerHTML = `<div><strong>ERROR:</strong> No valid location for "${state.currentLocation}"</div>`;
      return;
    }
    let desc = `<div><strong>Location:</strong> ${location.name}</div>`;
    desc += `<div>${location.description}</div>`;
    // Exits
    const exits = this.engine.getConnectedLocations();
    if (exits.length > 0) {
      desc += '<div><strong>Exits:</strong> ' + exits.map(e => e.name).join(', ') + '</div>';
    }
    // Items
    const items = this.engine.getItemsInLocation();
    if (items.length > 0) {
      desc += '<div><strong>Items here:</strong> ' + items.map(i => i.name).join(', ') + '</div>';
    }
    this.outputEl.innerHTML = desc + '<hr>' + this.outputEl.innerHTML;
  }

  private renderLog(): void {
    // Show the last 20 messages from the game log
    const log = this.engine.getState().gameLog.slice(-20);
    this.outputEl.innerHTML = log.map(line => `<div>${line}</div>`).join('');
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

// If running in browser, auto-initialize
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const runner = new BrowserRunner('game-output', 'game-input', 'game-button');
    runner.start();
  });
}
