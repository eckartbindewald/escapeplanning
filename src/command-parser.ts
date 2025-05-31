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
      
      // Get connected locations
      const locations = this.engine.getConnectedLocations();
      
      // Try to match by direction or name
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
      
      // Try to find the item/character/object to look at
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
      
      // Parse "use X on Y" or "use X"
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

    // Dialog response
    this.registerCommand('say', async (args) => {
      if (args.length === 0) {
        this.engine.addToLog("Say what?");
        return;
      }
      
      const dialog = this.engine.getState().currentDialog;
      if (!dialog) {
        this.engine.addToLog("You're not in a conversation.");
        return;
      }

      const input = args.join(' ').toLowerCase();
      
      // First try to match by number
      if (/^\d+$/.test(input)) {
        const responseIndex = parseInt(input) - 1;
        if (responseIndex >= 0 && responseIndex < dialog.responses.length) {
          await this.engine.respondToDialog(responseIndex);
          return;
        }
      }
      
      // Then try to match by text
      const responseIndex = dialog.responses.findIndex(response => 
        response.text.toLowerCase().includes(input)
      );
      
      if (responseIndex >= 0) {
        await this.engine.respondToDialog(responseIndex);
      } else {
        this.engine.addToLog("That's not a valid response. Try using the number of the response you want to give.");
      }
    });
    this.registerAlias('respond', 'say');
    this.registerAlias('answer', 'say');

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
- say/respond [number/text]: Choose a dialog response by number or text
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

    // Check for direct command
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

    // Try to parse full sentence commands
    // For example: "pick up the sword" -> "take sword"
    const fullCommand = tokens.join(' ');
    
    if (fullCommand.match(/^(pick|take|get)\s+up\s+/i)) {
      const item = fullCommand.replace(/^(pick|take|get)\s+up\s+/i, '').replace(/^the\s+/i, '');
      const handler = this.commands.get('take')!;
      await handler([item]);
      return;
    }
    
    if (fullCommand.match(/^(look|examine|inspect)\s+at\s+/i)) {
      const target = fullCommand.replace(/^(look|examine|inspect)\s+at\s+/i, '').replace(/^the\s+/i, '');
      const handler = this.commands.get('look')!;
      await handler([target]);
      return;
    }
    
    if (fullCommand.match(/^talk\s+to\s+/i)) {
      const character = fullCommand.replace(/^talk\s+to\s+/i, '').replace(/^the\s+/i, '');
      const handler = this.commands.get('talk')!;
      await handler([character]);
      return;
    }

    // If in a dialog, try to handle as a dialog response
    const currentDialog = this.engine.getState().currentDialog;
    if (currentDialog) {
      const handler = this.commands.get('say')!;
      await handler(tokens);
      return;
    }

    this.engine.addToLog(`I don't understand '${input}'. Type 'help' for a list of commands.`);
  }
}