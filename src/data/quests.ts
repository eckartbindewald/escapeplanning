import { Quest } from '../types';
export const quests: Quest[] = [
  { id: 'quest_1', title: 'Find the Lost Cat', description: 'Shadowpaw the cat has gone missing. Elara asks you to find and return her pet.', giver: 'char_1', requirements: 'Go to Forest Edge; Find Shadowpaw', victory_condition: 'Shadowpaw is present in Town Square', rewards: 'Healing Potion; 50 XP', status: 'not_started' },
  { id: 'quest_2', title: 'Retrieve the Rusty Sword', description: 'Grim wants you to find the Rusty Sword lost in the tavern and bring it to him.', giver: 'char_2', requirements: 'Find Rusty Sword in Old Tavern; Bring to Grim', victory_condition: 'Player gives Rusty Sword to Grim', rewards: '5 Gold; 30 XP', status: 'not_started' },
  { id: 'quest_3', title: 'Unlock the Forest Gate', description: 'A mysterious key is said to unlock a hidden gate at the Forest Edge.', giver: 'char_3', requirements: 'Find Mysterious Key; Use at Forest Edge', victory_condition: 'Player uses Mysterious Key at Forest Edge', rewards: 'Access to new area; 100 XP', status: 'not_started' }
];
