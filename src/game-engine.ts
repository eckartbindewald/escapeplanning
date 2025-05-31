import {
  Node,
  Edge,
  ItemAttribute,
  ItemStatus,
  CharacterStatus,
  ObjectStatus,
  DialogNode,
  Quest,
  GameState,
  NodeType
} from './types';
import { loadGameData } from './data-loader';

export class GameEngine {
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private itemAttributes: ItemAttribute[] = [];
  private itemStatus: ItemStatus[] = [];
  private characterStatus: CharacterStatus[] = [];
  private objectStatus: ObjectStatus[] = [];
  private dialogs: DialogNode[] = [];
  private quests: Quest[] = [];
  private state: GameState;
  private gameEnded: boolean = false;
  
  constructor() {
    this.state = {
      currentLocation: '',
      inventory: [],
      currentQuests: {},
      playerStats: { health: 100, energy: 100 },
      currentDialog: null,
      gameLog: []
    };
  }

  public async initialize(startLocation: string = 'loc_1'): Promise<void> {
    const data = loadGameData();
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.itemAttributes = data.itemAttributes;
    this.itemStatus = data.itemStatus;
    this.characterStatus = data.characterStatus || [];
    this.objectStatus = data.objectStatus || [];
    this.dialogs = data.dialogs || [];
    this.quests = data.quests || [];
    
    this.state.currentLocation = startLocation;
    this.addToLog(`You find yourself in ${this.getNodeById(startLocation)?.name || 'an unknown location'}.`);
    
    // Start the medallion quest automatically
    this.startQuest('quest_4');
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public saveGame(): string {
    return JSON.stringify(this.state);
  }

  public loadGame(savedState: string): void {
    try {
      this.state = JSON.parse(savedState);
    } catch (error) {
      console.error('Failed to load saved game', error);
    }
  }

  public addToLog(message: string): void {
    if (this.gameEnded) return; // Don't add more messages after game end
    this.state.gameLog.push(message);
    console.log(message);
  }

  public getNodeById(id: string): Node | undefined {
    return this.nodes.find(node => node.id === id);
  }

  public getConnectedLocations(): Node[] {
    if (this.gameEnded) return []; // No movement after game end
    const locationEdges = this.edges.filter(edge => 
      edge.source === this.state.currentLocation && 
      this.getNodeById(edge.target)?.type === 'location'
    );
    
    return locationEdges.map(edge => this.getNodeById(edge.target))
      .filter((node): node is Node => node !== undefined);
  }

  public moveToLocation(locationId: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    const connectedLocations = this.getConnectedLocations();
    const targetLocation = connectedLocations.find(loc => loc.id === locationId);
    
    if (!targetLocation) {
      this.addToLog("You can't go there from here.");
      return false;
    }
    
    this.state.currentLocation = locationId;
    this.addToLog(`You move to ${targetLocation.name}. ${targetLocation.description}`);
    return true;
  }

  public getItemsInLocation(): Node[] {
    const itemsHere = this.itemStatus
      .filter(status => status.attribute === 'location' && status.value === this.state.currentLocation)
      .map(status => this.getNodeById(status.item_id))
      .filter((node): node is Node => node !== undefined && node.type === 'item');
    
    return itemsHere;
  }

  public getCharactersInLocation(): Node[] {
    const charactersWithStatus = this.characterStatus
      .filter(status => status.attribute === 'location' && status.value === this.state.currentLocation)
      .map(status => this.getNodeById(status.character_id))
      .filter((node): node is Node => node !== undefined && node.type === 'character');
    
    const staticCharacters = this.nodes.filter(node => 
      node.type === 'character' && 
      !this.characterStatus.some(status => status.character_id === node.id)
    );
    
    const allCharacters = [...charactersWithStatus, ...staticCharacters];
    const uniqueCharacters = allCharacters.filter((char, index) => 
      allCharacters.findIndex(c => c.id === char.id) === index
    );
    
    return uniqueCharacters;
  }

  public getObjectsInLocation(): Node[] {
    return this.nodes.filter(node => 
      node.type === 'object' && 
      this.edges.some(edge => 
        edge.source === this.state.currentLocation && 
        edge.target === node.id
      )
    );
  }

  public lookAround(): string {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return "Game Over";
    }
    
    const location = this.getNodeById(this.state.currentLocation);
    if (!location) return "You're lost in an unknown place.";
    
    let description = `${location.name}: ${location.description}\n`;
    
    const exits = this.getConnectedLocations();
    if (exits.length > 0) {
      description += "\nExits lead to:\n";
      exits.forEach(exit => {
        description += `- ${exit.name}\n`;
      });
    } else {
      description += "\nThere are no visible exits.\n";
    }
    
    const items = this.getItemsInLocation();
    if (items.length > 0) {
      description += "\nYou can see:\n";
      items.forEach(item => {
        description += `- ${item.name}\n`;
      });
    }
    
    const characters = this.getCharactersInLocation();
    if (characters.length > 0) {
      description += "\nCharacters here:\n";
      characters.forEach(character => {
        description += `- ${character.name}\n`;
      });
    }
    
    const objects = this.getObjectsInLocation();
    if (objects.length > 0) {
      description += "\nObjects of interest:\n";
      objects.forEach(object => {
        description += `- ${object.name}\n`;
      });
    }
    
    this.addToLog(description);
    return description;
  }

  public takeItem(itemId: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    const itemsHere = this.getItemsInLocation();
    const item = itemsHere.find(i => i.id === itemId);
    
    if (!item) {
      this.addToLog("You don't see that item here.");
      return false;
    }
    
    const itemStatusIndex = this.itemStatus.findIndex(
      status => status.item_id === itemId && status.attribute === 'location'
    );
    
    if (itemStatusIndex >= 0) {
      this.itemStatus[itemStatusIndex].value = 'inventory';
    } else {
      this.itemStatus.push({
        item_id: itemId,
        player_id: 'player_1',
        attribute: 'location',
        value: 'inventory'
      });
    }
    
    if (!this.state.inventory.includes(itemId)) {
      this.state.inventory.push(itemId);
    }
    
    this.addToLog(`You pick up the ${item.name}.`);
    return true;
  }

  public dropItem(itemId: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    if (!this.state.inventory.includes(itemId)) {
      this.addToLog("You don't have that item.");
      return false;
    }
    
    const item = this.getNodeById(itemId);
    if (!item) {
      this.addToLog("That item doesn't exist.");
      return false;
    }
    
    const itemStatusIndex = this.itemStatus.findIndex(
      status => status.item_id === itemId && status.attribute === 'location'
    );
    
    if (itemStatusIndex >= 0) {
      this.itemStatus[itemStatusIndex].value = this.state.currentLocation;
    } else {
      this.itemStatus.push({
        item_id: itemId,
        player_id: 'player_1',
        attribute: 'location',
        value: this.state.currentLocation
      });
    }
    
    this.state.inventory = this.state.inventory.filter(id => id !== itemId);
    
    this.addToLog(`You drop the ${item.name}.`);
    return true;
  }

  public useItem(itemId: string, targetId?: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    if (!this.state.inventory.includes(itemId)) {
      this.addToLog("You don't have that item.");
      return false;
    }
    
    const item = this.getNodeById(itemId);
    if (!item) return false;
    
    const attributes = this.itemAttributes.filter(attr => attr.item_id === itemId);
    
    if (item.subtype === 'potion') {
      const healAmount = attributes.find(attr => attr.attribute === 'heal_amount');
      if (healAmount && typeof healAmount.value === 'number') {
        const currentHealth = Number(this.state.playerStats.health) || 0;
        this.state.playerStats.health = Math.min(100, currentHealth + healAmount.value);
        this.addToLog(`You drink the ${item.name} and feel revitalized. Health: ${this.state.playerStats.health}/100`);
        
        this.state.inventory = this.state.inventory.filter(id => id !== itemId);
        return true;
      }
    } else if (item.subtype === 'key' && targetId) {
      const target = this.getNodeById(targetId);
      if (!target) {
        this.addToLog("You don't see that here.");
        return false;
      }
      
      if (target.type === 'object' && target.subtype === 'door') {
        const canUnlock = attributes.find(attr => attr.attribute === 'unlock' && attr.value === true);
        if (canUnlock) {
          this.addToLog(`You use the ${item.name} to unlock the ${target.name}.`);
          
          const doorEdges = this.edges.filter(edge => edge.source === targetId || edge.target === targetId);
          if (doorEdges.length >= 2) {
            const room1 = doorEdges[0].source === targetId ? doorEdges[0].target : doorEdges[0].source;
            const room2 = doorEdges[1].source === targetId ? doorEdges[1].target : doorEdges[1].source;
            
            if (!this.edges.some(edge => edge.source === room1 && edge.target === room2)) {
              this.edges.push({
                id: `edge_${room1}_${room2}`,
                source: room1,
                target: room2,
                type: 'passage',
                description: `Path through ${target.name}`
              });
            }
            
            if (!this.edges.some(edge => edge.source === room2 && edge.target === room1)) {
              this.edges.push({
                id: `edge_${room2}_${room1}`,
                source: room2,
                target: room1,
                type: 'passage',
                description: `Path through ${target.name}`
              });
            }
            
            return true;
          }
        } else {
          this.addToLog(`The ${item.name} doesn't fit the ${target.name}.`);
        }
      }
    } else if (item.subtype === 'artifact' && targetId) {
      const target = this.getNodeById(targetId);
      if (!target) {
        this.addToLog("You don't see that here.");
        return false;
      }

      if (target.type === 'character' && target.id === 'char_2' && item.id === 'item_4') {
        this.addToLog(`You give the ${item.name} to ${target.name}.`);
        this.addToLog(`${target.name} examines the medallion with great interest.`);
        this.addToLog('"Incredible! You actually found it! As promised, here\'s your reward."');
        
        // Remove medallion from inventory
        this.state.inventory = this.state.inventory.filter(id => id !== itemId);
        
        // Complete the quest and end the game
        this.completeQuest('quest_4');
        this.endGame();
        
        return true;
      }
    } else if (item.subtype === 'weapon') {
      if (!targetId) {
        this.addToLog(`You brandish the ${item.name} menacingly, but there's nothing to attack.`);
        return false;
      }
      
      const target = this.getNodeById(targetId);
      if (!target || target.type !== 'character') {
        this.addToLog("That's not something you can attack.");
        return false;
      }
      
      const charactersHere = this.getCharactersInLocation();
      if (!charactersHere.some(char => char.id === targetId)) {
        this.addToLog("That character isn't here.");
        return false;
      }
      
      const attackBonus = attributes.find(attr => attr.attribute === 'attack_bonus');
      const damage = attackBonus && typeof attackBonus.value === 'number' ? attackBonus.value : 1;
      
      this.addToLog(`You attack ${target.name} with the ${item.name} for ${damage} damage!`);
      return true;
    }
    
    this.addToLog(`You're not sure how to use the ${item.name} here.`);
    return false;
  }

  public examine(id: string): string {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return "Game Over";
    }
    
    const node = this.getNodeById(id);
    if (!node) {
      this.addToLog("You don't see that here.");
      return "Not found";
    }
    
    if (node.type === 'item') {
      const inInventory = this.state.inventory.includes(id);
      const inLocation = this.getItemsInLocation().some(item => item.id === id);
      
      if (!inInventory && !inLocation) {
        this.addToLog("You don't see that here.");
        return "Not found";
      }
    }
    
    if (node.type === 'character' && !this.getCharactersInLocation().some(char => char.id === id)) {
      this.addToLog("You don't see them here.");
      return "Not found";
    }
    
    if (node.type === 'object' && !this.getObjectsInLocation().some(obj => obj.id === id)) {
      this.addToLog("You don't see that here.");
      return "Not found";
    }
    
    let description = `${node.name}: ${node.description}`;
    
    if (node.type === 'item') {
      const attributes = this.itemAttributes.filter(attr => attr.item_id === id);
      if (attributes.length > 0) {
        description += "\nAttributes:";
        attributes.forEach(attr => {
          description += `\n- ${attr.attribute}: ${attr.value}`;
        });
      }
    }
    
    this.addToLog(description);
    return description;
  }

  public talkTo(characterId: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    const character = this.getNodeById(characterId);
    if (!character || character.type !== 'character') {
      this.addToLog("You don't see them here.");
      return false;
    }
    
    const charactersHere = this.getCharactersInLocation();
    if (!charactersHere.some(char => char.id === characterId)) {
      this.addToLog("That character isn't here.");
      return false;
    }

    // Handle AI-driven characters differently
    if (character.subtype === 'aic') {
      this.handleAICharacterDialog(character);
      return true;
    }
    
    // Regular NPC dialog handling
    const startingDialog = this.dialogs.find(dialog => 
      dialog.npc_id === characterId && dialog.parent_id === null
    );
    
    if (!startingDialog) {
      this.addToLog(`${character.name} doesn't seem interested in talking.`);
      return false;
    }
    
    this.state.currentDialog = startingDialog;
    this.addToLog(`${character.name}: "${startingDialog.text}"`);
    
    if (startingDialog.responses && startingDialog.responses.length > 0) {
      this.addToLog("You can respond with:");
      startingDialog.responses.forEach((response, index) => {
        this.addToLog(`${index + 1}. ${response.text}`);
      });
    }
    
    return true;
  }

  private handleAICharacterDialog(character: Node): void {
    // Get relevant game state for context
    const hasKey = this.state.inventory.includes('item_3');
    const hasMedallion = this.state.inventory.includes('item_4');
    const isAtForestEdge = this.state.currentLocation === 'loc_2';
    const isInTavern = this.state.currentLocation === 'loc_3';
    const isInCellar = this.state.currentLocation === 'loc_5';
    const questStarted = this.state.currentQuests['quest_4'];

    switch (character.id) {
      case 'char_3': // Shadowpaw
        if (hasKey && isAtForestEdge) {
          this.addToLog(`${character.name} eyes the key in your possession with knowing satisfaction.`);
          this.addToLog(`"The key you found... it leads to hidden treasures. The tavern keeper's cellar holds more than just dust and cobwebs."`);
        } else if (isAtForestEdge && !hasKey) {
          this.addToLog(`${character.name} stretches lazily, but their eyes gleam with intelligence.`);
          this.addToLog(`"Seeking something? *flicks tail* Sometimes what we search for lies in plain sight, where shadow meets light."`);
          if (questStarted) {
            this.addToLog(`"The tavern keeper's troubles echo through these woods. A lost key, perhaps?"`);
          }
        } else {
          this.addToLog(`${character.name} watches you with mysterious interest, but offers no words.`);
        }
        break;

      case 'char_4': // Luna
        if (hasMedallion) {
          this.addToLog(`${character.name} gazes at the medallion with ancient wisdom in her eyes.`);
          this.addToLog(`"The artifact you carry resonates with forgotten power. Its journey is nearly complete."`);
        } else if (isInCellar) {
          this.addToLog(`${character.name}'s form shimmers in the dim light.`);
          this.addToLog(`"Secrets lie in darkness, waiting to be uncovered. Search thoroughly."`);
        } else {
          this.addToLog(`${character.name} appears briefly, sharing a cryptic smile.`);
          this.addToLog(`"The path you seek may not be straight, but every step has purpose."`);
        }
        break;

      case 'char_5': // Zephyr
        if (isInTavern && !hasKey) {
          this.addToLog(`${character.name} materializes like morning mist.`);
          this.addToLog(`"The forest holds many secrets. Some are meant to be found."`);
        } else if (isInCellar) {
          this.addToLog(`${character.name}'s ethereal form illuminates the darkness.`);
          this.addToLog(`"What you seek lies hidden in shadow. Let your instincts guide you."`);
        } else {
          this.addToLog(`${character.name} appears momentarily, their presence both calming and mysterious.`);
          this.addToLog(`"Trust in the journey. Each discovery leads to the next."`);
        }
        break;

      default:
        this.addToLog(`${character.name} acknowledges your presence but remains silent.`);
    }
  }

  public respondToDialog(responseIndex: number): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    if (!this.state.currentDialog || !this.state.currentDialog.responses) {
      this.addToLog("You're not in a conversation.");
      return false;
    }
    
    if (responseIndex < 0 || responseIndex >= this.state.currentDialog.responses.length) {
      this.addToLog("That's not a valid response option.");
      return false;
    }
    
    const selectedResponse = this.state.currentDialog.responses[responseIndex];
    this.addToLog(`You: "${selectedResponse.text}"`);
    
    // Check if this is the medallion completion dialog
    if (selectedResponse.next_id === 'dialog_12' && !this.state.inventory.includes('item_4')) {
      this.addToLog("You don't have the Ancient Medallion.");
      return false;
    }
    
    // Find next dialog node
    const nextDialog = this.dialogs.find(dialog => dialog.id === selectedResponse.next_id);
    if (!nextDialog) {
      this.addToLog("The conversation ends.");
      this.state.currentDialog = null;
      return true;
    }
    
    // Handle medallion quest completion through dialog
    if (nextDialog.id === 'dialog_12' && this.state.inventory.includes('item_4')) {
      // Remove medallion from inventory
      this.state.inventory = this.state.inventory.filter(id => id !== 'item_4');
      
      // Complete the quest and end the game
      this.completeQuest('quest_4');
      this.endGame();
    }
    
    // Get character name
    const character = this.getNodeById(nextDialog.npc_id);
    if (character) {
      this.addToLog(`${character.name}: "${nextDialog.text}"`);
    } else {
      this.addToLog(`"${nextDialog.text}"`);
    }
    
    // Update current dialog
    this.state.currentDialog = nextDialog;
    
    // Show response options
    if (nextDialog.responses && nextDialog.responses.length > 0) {
      this.addToLog("You can respond with:");
      nextDialog.responses.forEach((response, index) => {
        this.addToLog(`${index + 1}. ${response.text}`);
      });
    } else {
      // End conversation if no responses
      this.state.currentDialog = null;
      this.addToLog("The conversation ends.");
    }
    
    return true;
  }

  public getInventory(): string {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return "Game Over";
    }
    
    if (this.state.inventory.length === 0) {
      this.addToLog("Your inventory is empty.");
      return "Inventory: Empty";
    }
    
    let result = "Inventory:";
    for (const itemId of this.state.inventory) {
      const item = this.getNodeById(itemId);
      if (item) {
        result += `\n- ${item.name}`;
      }
    }
    
    this.addToLog(result);
    return result;
  }

  public getQuests(): string {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return "Game Over";
    }
    
    const activeQuests = Object.values(this.state.currentQuests);
    
    if (activeQuests.length === 0) {
      this.addToLog("You don't have any active quests.");
      return "Quests: None";
    }
    
    let result = "Active Quests:";
    for (const quest of activeQuests) {
      result += `\n- ${quest.title} (${quest.status})`;
      result += `\n  ${quest.description}`;
    }
    
    this.addToLog(result);
    return result;
  }

  public startQuest(questId: string): boolean {
    if (this.gameEnded) {
      this.addToLog("The game has ended. Thanks for playing!");
      return false;
    }
    
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) {
      this.addToLog("That quest doesn't exist.");
      return false;
    }
    
    if (this.state.currentQuests[questId]) {
      this.addToLog(`You've already started the quest "${quest.title}".`);
      return false;
    }
    
    this.state.currentQuests[questId] = {
      ...quest,
      status: 'in_progress'
    };
    
    this.addToLog(`New quest started: ${quest.title}`);
    this.addToLog(quest.description);
    return true;
  }

  public completeQuest(questId: string): boolean {
    if (!this.state.currentQuests[questId]) {
      this.addToLog("You haven't started that quest.");
      return false;
    }
    
    this.state.currentQuests[questId].status = 'completed';
    this.addToLog(`Quest completed: ${this.state.currentQuests[questId].title}`);
    this.addToLog(`Rewards: ${this.state.currentQuests[questId].rewards}`);
    
    return true;
  }

  private endGame(): void {
    this.gameEnded = true;
    this.addToLog('\n=== Congratulations! ===');
    this.addToLog('You have completed the Ancient Medallion quest!');
    this.addToLog('You receive: 100 Gold and 200 XP');
    this.addToLog('\nThanks for playing! The game is now complete.\n');
    this.addToLog('Type "quit" to exit or refresh the page to play again.');
  }
}