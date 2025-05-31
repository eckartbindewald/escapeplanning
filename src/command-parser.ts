import { GameEngine } from './game-engine';

type CommandHandler = (args: string[]) => Promise<void>;

export class CommandParser {
  private engine: GameEngine;
  private commands: Map<string, CommandHandler>;
  private aliases: Map<string, string>;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.commands = new Map();
    this.aliases = new Map();
    this.registerCommands();
  }

  private registerCommands(): void {
    // Movement commands
    this.registerCommand('go', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Go where? Try 'go north' or specify a location.");
        return;
      }
      
      const locations = this.engine.getConnectedLocations();
      const direction = args.join(' ').toLowerCase();
      const targetLocation = locations.find(loc => 
        loc.name.toLowerCase().includes(direction) || 
        loc.id.toLowerCase() === direction
      );
      
      if (targetLocation) {
        this.engine.moveToLocation(targetLocation.id);
      } else {
        this.engine.addToLog(`You can't go to ${direction} from here.`);
      }
    });
    this.registerAlias('move', 'go');
    this.registerAlias('walk', 'go');
    this.registerAlias('north', 'go north');
    this.registerAlias('south', 'go south');
    this.registerAlias('east', 'go east');
    this.registerAlias('west', 'go west');
    this.registerAlias('n', 'go north');
    this.registerAlias('s', 'go south');
    this.registerAlias('e', 'go east');
    this.registerAlias('w', 'go west');

    // Look command
    this.registerCommand('look', async (args) => {
      if (args.length === 0) {
        this.engine.lookAround();
        return;
      }
      
      const target = args.join(' ').toLowerCase();
      
      // Check inventory
      const inventoryItems = this.engine.getState().inventory
        .map(id => this.engine.getNodeById(id))
        .filter(item => item !== undefined);
      
      const inventoryMatch = inventoryItems.find(item => 
        item!.name.toLowerCase().includes(target) || item!.id.toLowerCase() === target
      );
      
      if (inventoryMatch) {
        this.engine.examine(inventoryMatch.id);
        return;
      }
      
      // Check items in location
      const itemsHere = this.engine.getItemsInLocation();
      const itemMatch = itemsHere.find(item => 
        item.name.toLowerCase().includes(target) || item.id.toLowerCase() === target
      );
      
      if (itemMatch) {
        this.engine.examine(itemMatch.id);
        return;
      }
      
      // Check characters in location
      const charactersHere = this.engine.getCharactersInLocation();
      const characterMatch = charactersHere.find(char => 
        char.name.toLowerCase().includes(target) || char.id.toLowerCase() === target
      );
      
      if (characterMatch) {
        this.engine.examine(characterMatch.id);
        return;
      }
      
      // Check objects in location
      const objectsHere = this.engine.getObjectsInLocation();
      const objectMatch = objectsHere.find(obj => 
        obj.name.toLowerCase().includes(target) || obj.id.toLowerCase() === target
      );
      
      if (objectMatch) {
        this.engine.examine(objectMatch.id);
        return;
      }
      
      this.engine.addToLog(`You don't see ${target} here.`);
    });
    this.registerAlias('examine', 'look');
    this.registerAlias('inspect', 'look');
    this.registerAlias('l', 'look');
    this.registerAlias('x', 'look');

    // Take command
    this.registerCommand('take', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Take what?");
        return;
      }
      
      const itemName = args.join(' ').toLowerCase();
      const itemsHere = this.engine.getItemsInLocation();
      const item = itemsHere.find(item => 
        item.name.toLowerCase().includes(itemName) || item.id.toLowerCase() === itemName
      );
      
      if (item) {
        this.engine.takeItem(item.id);
      } else {
        this.engine.addToLog(`You don't see ${itemName} here.`);
      }
    });
    this.registerAlias('get', 'take');
    this.registerAlias('pickup', 'take');

    // Drop command
    this.registerCommand('drop', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Drop what?");
        return;
      }
      
      const itemName = args.join(' ').toLowerCase();
      const inventory = this.engine.getState().inventory
        .map(id => this.engine.getNodeById(id))
        .filter(item => item !== undefined);
      
      const item = inventory.find(item => 
        item!.name.toLowerCase().includes(itemName) || item!.id.toLowerCase() === itemName
      );
      
      if (item) {
        this.engine.dropItem(item.id);
      } else {
        this.engine.addToLog(`You don't have ${itemName}.`);
      }
    });

    // Use command
    this.registerCommand('use', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Use what?");
        return;
      }
      
      let itemName = args[0].toLowerCase();
      let targetName = null;
      
      const onIndex = args.findIndex(arg => arg.toLowerCase() === 'on' || arg.toLowerCase() === 'with');
      if (onIndex > 0) {
        itemName = args.slice(0, onIndex).join(' ').toLowerCase();
        targetName = args.slice(onIndex + 1).join(' ').toLowerCase();
      } else {
        itemName = args.join(' ').toLowerCase();
      }
      
      // Find the item in inventory
      const inventory = this.engine.getState().inventory
        .map(id => this.engine.getNodeById(id))
        .filter(item => item !== undefined);
      
      const item = inventory.find(item => 
        item!.name.toLowerCase().includes(itemName) || item!.id.toLowerCase() === itemName
      );
      
      if (!item) {
        this.engine.addToLog(`You don't have ${itemName}.`);
        return;
      }
      
      // If no target specified, just use the item
      if (!targetName) {
        this.engine.useItem(item.id);
        return;
      }
      
      // Find the target
      // Check items in location
      const itemsHere = this.engine.getItemsInLocation();
      const itemTarget = itemsHere.find(i => 
        i.name.toLowerCase().includes(targetName) || i.id.toLowerCase() === targetName
      );
      
      if (itemTarget) {
        this.engine.useItem(item.id, itemTarget.id);
        return;
      }
      
      // Check characters in location
      const charactersHere = this.engine.getCharactersInLocation();
      const characterTarget = charactersHere.find(char => 
        char.name.toLowerCase().includes(targetName) || char.id.toLowerCase() === targetName
      );
      
      if (characterTarget) {
        this.engine.useItem(item.id, characterTarget.id);
        return;
      }
      
      // Check objects in location
      const objectsHere = this.engine.getObjectsInLocation();
      const objectTarget = objectsHere.find(obj => 
        obj.name.toLowerCase().includes(targetName) || obj.id.toLowerCase() === targetName
      );
      
      if (objectTarget) {
        this.engine.useItem(item.id, objectTarget.id);
        return;
      }
      
      this.engine.addToLog(`You don't see ${targetName} here.`);
    });

    // Talk command
    this.registerCommand('talk', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Talk to whom?");
        return;
      }
      
      const characterName = args.join(' ').toLowerCase();
      const charactersHere = this.engine.getCharactersInLocation();
      const character = charactersHere.find(char => 
        char.name.toLowerCase().includes(characterName) || char.id.toLowerCase() === characterName
      );
      
      if (character) {
        await this.engine.talkTo(character.id);
      } else {
        this.engine.addToLog(`You don't see ${characterName} here.`);
      }
    });
    this.registerAlias('speak', 'talk');

    // Exit dialog command
    this.registerCommand('exit', async (args) => {
      if (this.engine.getState().currentDialog) {
        this.engine.endDialog();
        return;
      }
      this.engine.addToLog("You're not in a conversation.");
    });
    this.registerAlias('bye', 'exit');
    this.registerAlias('goodbye', 'exit');
    this.registerAlias('leave', 'exit');

    // Inventory command
    this.registerCommand('inventory', async (args) => {
      this.engine.getInventory();
    });
    this.registerAlias('i', 'inventory');
    this.registerAlias('inv', 'inventory');

    // Quests command
    this.registerCommand('quests', async (args) => {
      this.engine.getQuests();
    });
    this.registerAlias('q', 'quests');

    // Help command
    this.registerCommand('help', async (args) => {
      const helpText = `
Available commands:
- go/move/walk [direction/location]: Move to a new location
- look/examine/inspect [target]: Look around or examine something specific
- take/get [item]: Pick up an item
- drop [item]: Drop an item from your inventory
- use [item] (on/with [target]): Use an item, optionally on a target
- talk/speak [character]: Start a conversation with a character
- inventory/i/inv: Check your inventory
- quests/q: View your active quests
- help: Show this help text
      `;
      this.engine.addToLog(helpText);
    });

    // Save command
    this.registerCommand('save', async (args) => {
      const savedState = this.engine.saveGame();
      console.log('Game saved:', savedState);
      this.engine.addToLog("Game saved.");
    });

    // Load command
    this.registerCommand('load', async (args) => {
      this.engine.addToLog("Load game not implemented in this demo.");
    });

    // Quit command
    this.registerCommand('quit', async (args) => {
      this.engine.addToLog("Thanks for playing!");
    });
    this.registerAlias('exit', 'quit');
  }

  private registerCommand(name: string, handler: CommandHandler): void {
    this.commands.set(name.toLowerCase(), handler);
  }

  private registerAlias(alias: string, command: string): void {
    this.aliases.set(alias.toLowerCase(), command.toLowerCase());
  }

  public async parseCommand(input: string): Promise<void> {
    if (!input || input.trim() === '') {
      this.engine.addToLog("Type a command, or 'help' for a list of commands.");
      return;
    }

    const tokens = input.trim().toLowerCase().split(/\s+/);
    const command = tokens[0];
    const args = tokens.slice(1);

    // Check for exit commands in dialog
    if (this.engine.getState().currentDialog && 
        ['exit', 'bye', 'goodbye', 'leave'].includes(command)) {
      this.engine.endDialog();
      return;
    }

    // If in a dialog, treat input as dialog response
    if (this.engine.getState().currentDialog) {
      await this.engine.respondToDialog(input);
      return;
    }

    // Handle regular commands
    if (this.commands.has(command)) {
      const handler = this.commands.get(command)!;
      await handler(args);
      return;
    }

    // Check for alias
    if (this.aliases.has(command)) {
      const aliasCommand = this.aliases.get(command)!.split(/\s+/);
      const actualCommand = aliasCommand[0];
      const aliasArgs = aliasCommand.slice(1).concat(args);
      
      if (this.commands.has(actualCommand)) {
        const handler = this.commands.get(actualCommand)!;
        await handler(aliasArgs);
        return;
      }
    }

    this.engine.addToLog(`I don't understand '${input}'. Type 'help' for a list of commands.`);
  }
}