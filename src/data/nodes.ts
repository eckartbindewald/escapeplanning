import { Node } from '../types';
export const nodes: Node[] = [
  { id: 'loc_1', type: 'location', subtype: 'outdoor', name: 'Town Square', description: 'The bustling center of the village, filled with merchants and townsfolk.' },
  { id: 'loc_2', type: 'location', subtype: 'outdoor', name: 'Forest Edge', description: 'The edge of a dark, mysterious forest.' },
  { id: 'loc_3', type: 'location', subtype: 'indoor', name: 'Old Tavern', description: 'A cozy tavern where adventurers gather.' },
  { id: 'loc_5', type: 'location', subtype: 'indoor', name: 'Tavern Cellar', description: 'A dark, musty cellar beneath the tavern. Old crates and barrels line the walls.' },
  { id: 'char_1', type: 'character', subtype: 'npc', name: 'Elara', description: 'The village healer, known for her kindness.' },
  { id: 'char_2', type: 'character', subtype: 'npc', name: 'Grim', description: 'The grumpy tavern keeper.' },
  { id: 'char_3', type: 'character', subtype: 'animal', name: 'Shadowpaw', description: 'A stealthy cat lurking near the forest.' },
  { id: 'item_1', type: 'item', subtype: 'potion', name: 'Healing Potion', description: 'A small vial that restores health.' },
  { id: 'item_2', type: 'item', subtype: 'weapon', name: 'Rusty Sword', description: 'An old, worn sword found in the tavern.' },
  { id: 'item_3', type: 'item', subtype: 'key', name: 'Mysterious Key', description: 'A key with unknown origins, found at the forest edge.' },
  { id: 'door_1', type: 'object', subtype: 'door', name: 'Cellar Door', description: 'A heavy wooden door between the tavern and the cellar.' }
];