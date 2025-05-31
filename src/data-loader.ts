import { Node, Edge, ItemAttribute, ItemStatus, CharacterStatus, ObjectStatus, DialogNode, Quest } from './types';
import { nodes } from './data/nodes';
import { edges } from './data/edges';
import { itemAttributes } from './data/item_attributes';
import { itemStatus } from './data/item_status';
import { characterStatus } from './data/character_status';
import { objectStatus } from './data/object_status';
import { dialogs } from './data/dialogs';
import { quests } from './data/quests';

// Load game nodes (locations, characters, items, objects)
export function loadNodes(): Node[] {
  return nodes;
}

// Load edges (connections between nodes)
export function loadEdges(): Edge[] {
  return edges;
}

// Load item attributes
export function loadItemAttributes(): ItemAttribute[] {
  return itemAttributes;
}

// Load item status
export function loadItemStatus(): ItemStatus[] {
  return itemStatus;
}

// Load character status
export function loadCharacterStatus(): CharacterStatus[] {
  return characterStatus;
}

// Load object status
export function loadObjectStatus(): ObjectStatus[] {
  return objectStatus;
}

// Load dialog trees
export function loadDialogs(): DialogNode[] {
  return dialogs;
}

// Load quests
export function loadQuests(): Quest[] {
  return quests;
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
