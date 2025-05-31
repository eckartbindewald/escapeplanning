// Types representing the game data structure

export type NodeType = 'location' | 'character' | 'item' | 'object';
export type CharacterSubtype = 'npc' | 'aic' | 'pc' | 'animal' | 'merchant';

export interface Node {
  id: string;
  type: NodeType;
  subtype: string;
  name: string;
  description: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  description: string;
}

export interface CharacterStatus {
  character_id: string;
  player_id: string;
  attribute: string;
  value: string | number;
}

export interface ItemStatus {
  item_id: string;
  player_id: string;
  attribute: string;
  value: string | number;
}

export interface ItemAttribute {
  item_id: string;
  attribute: string;
  value: string | number | boolean;
}

export interface ObjectStatus {
  object_id: string;
  player_id: string;
  attribute: string;
  value: string | number | boolean;
}

export interface DialogNode {
  id: string;
  npc_id: string;
  parent_id: string | null;
  text: string;
  responses: Array<{
    text: string;
    next_id: string;
  }>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string;
  requirements: string;
  victory_condition: string;
  rewards: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
}

export interface GameState {
  currentLocation: string;
  inventory: string[];
  currentQuests: Record<string, Quest>;
  playerStats: Record<string, number | string>;
  currentDialog: DialogNode | null;
  gameLog: string[];
}