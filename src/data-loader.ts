import fs from 'fs';
import path from 'path';
import { 
  Node, 
  Edge, 
  ItemAttribute, 
  ItemStatus, 
  CharacterStatus,
  ObjectStatus,
  DialogNode,
  Quest
} from './types';

// Helper function to parse TSV files
function parseTSV<T>(filePath: string): T[] {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split('\t');
    
    return lines.slice(1).map(line => {
      const values = line.split('\t');
      const obj: any = {};
      
      headers.forEach((header, index) => {
        // Try to parse numbers and booleans
        let value = values[index];
        if (value === 'true') obj[header] = true;
        else if (value === 'false') obj[header] = false;
        else if (!isNaN(Number(value)) && value !== '') obj[header] = Number(value);
        else obj[header] = value;
      });
      
      return obj as T;
    });
  } catch (error) {
    console.error(`Error parsing TSV file: ${filePath}`, error);
    return [];
  }
}

// Load game nodes (locations, characters, items, objects)
export function loadNodes(): Node[] {
  const dataPath = path.join(process.cwd(), 'data', 'nodes.tsv');
  return parseTSV<Node>(dataPath);
}

// Load edges (connections between nodes)
export function loadEdges(): Edge[] {
  const dataPath = path.join(process.cwd(), 'data', 'edges.tsv');
  return parseTSV<Edge>(dataPath);
}

// Load item attributes
export function loadItemAttributes(): ItemAttribute[] {
  const dataPath = path.join(process.cwd(), 'data', 'item_attributes.tsv');
  return parseTSV<ItemAttribute>(dataPath);
}

// Load item status
export function loadItemStatus(): ItemStatus[] {
  const dataPath = path.join(process.cwd(), 'data', 'item_status.tsv');
  return parseTSV<ItemStatus>(dataPath);
}

// Load character status
export function loadCharacterStatus(): CharacterStatus[] {
  const dataPath = path.join(process.cwd(), 'data', 'character_status.tsv');
  return parseTSV<CharacterStatus>(dataPath);
}

// Load object status
export function loadObjectStatus(): ObjectStatus[] {
  const dataPath = path.join(process.cwd(), 'data', 'object_status.tsv');
  return parseTSV<ObjectStatus>(dataPath);
}

// Load dialog trees
export function loadDialogs(): DialogNode[] {
  const dataPath = path.join(process.cwd(), 'data', 'dialogs.tsv');
  return parseTSV<DialogNode>(dataPath);
}

// Load quests
export function loadQuests(): Quest[] {
  const dataPath = path.join(process.cwd(), 'data', 'quests.tsv');
  return parseTSV<Quest>(dataPath);
}

// Function to load all game data at once
export function loadGameData() {
  return {
    nodes: loadNodes(),
    edges: loadEdges(),
    itemAttributes: loadItemAttributes(),
    itemStatus: loadItemStatus(),
    characterStatus: loadCharacterStatus(),
    objectStatus: loadObjectStatus(),
    dialogs: loadDialogs(),
    quests: loadQuests()
  };
}
