import { Edge } from '../types';
export const edges: Edge[] = [
  { id: 'edge_1', source: 'loc_1', target: 'loc_3', type: 'path', description: 'A cobblestone path leads from the Town Square to the Old Tavern.' },
  { id: 'edge_2', source: 'loc_2', target: 'loc_1', type: 'path', description: 'A narrow trail leads back to the Town Square.' },
  { id: 'edge_3', source: 'loc_3', target: 'door_1', type: 'connects', description: 'The tavern side of the cellar door.' },
  { id: 'edge_4', source: 'loc_5', target: 'door_1', type: 'connects', description: 'The cellar side of the cellar door.' },
  { id: 'edge_5', source: 'loc_3', target: 'loc_1', type: 'path', description: 'A cobblestone path leads back to the Town Square.' },
  { id: 'edge_6', source: 'loc_1', target: 'loc_2', type: 'path', description: 'A narrow trail leads to the Forest Edge.' },
  { id: 'edge_7', source: 'loc_3', target: 'loc_5', type: 'passage', description: 'Stairs lead down to the tavern cellar.' },
  { id: 'edge_8', source: 'loc_5', target: 'loc_3', type: 'passage', description: 'Stairs lead up to the tavern.' }
];