import { DialogNode } from '../types';
export const dialogs: DialogNode[] = [
  { id: 'dialog_1', npc_id: 'char_1', parent_id: null, text: "Hello there! I'm Elara, the village healer. Are you feeling unwell?", responses: [
    { text: "Yes, I'm not feeling well", next_id: "dialog_2" },
    { text: "No, just browsing", next_id: "dialog_3" }
  ] },
  { id: 'dialog_2', npc_id: 'char_1', parent_id: 'dialog_1', text: "I see. I have some healing potions that might help. Would you like one?", responses: [
    { text: "Yes, please", next_id: "dialog_4" },
    { text: "No, thank you", next_id: "dialog_3" }
  ] },
  { id: 'dialog_3', npc_id: 'char_1', parent_id: 'dialog_1', text: "Well, let me know if you need anything else. Stay safe on your adventures!", responses: [] },
  { id: 'dialog_4', npc_id: 'char_1', parent_id: 'dialog_2', text: "Here you go. This should help restore your health. That will be 10 gold pieces.", responses: [
    { text: "Thank you", next_id: "dialog_3" }
  ] },
  { id: 'dialog_5', npc_id: 'char_2', parent_id: null, text: "*grumbles* What do you want? I'm busy.", responses: [
    { text: "I'd like a drink", next_id: "dialog_6" },
    { text: "Tell me about this place", next_id: "dialog_7" },
    { text: "I have the Ancient Medallion", next_id: "dialog_12" },
    { text: "I heard about a medallion", next_id: "dialog_10" },
    { text: "Nothing, sorry to bother you", next_id: "dialog_8" }
  ] },
  { id: 'dialog_6', npc_id: 'char_2', parent_id: 'dialog_5', text: "Fine. That'll be 5 gold. Don't cause any trouble in my tavern.", responses: [
    { text: "Thanks", next_id: "dialog_8" }
  ] },
  { id: 'dialog_7', npc_id: 'char_2', parent_id: 'dialog_5', text: "This tavern's been in my family for generations. Not much to tell except we get all sorts passing through. Some say there's a secret in the cellar, but that's just nonsense.", responses: [
    { text: "Tell me about the cellar", next_id: "dialog_9" },
    { text: "Thanks for the information", next_id: "dialog_8" }
  ] },
  { id: 'dialog_8', npc_id: 'char_2', parent_id: 'dialog_5', text: "*goes back to cleaning mugs*", responses: [] },
  { id: 'dialog_9', npc_id: 'char_2', parent_id: 'dialog_7', text: "The cellar? It's just storage. Though, come to think of it, I lost the key some time ago. Last person who went down there was some traveler heading to the forest. Odd fellow.", responses: [
    { text: "Thank you for the information", next_id: "dialog_8" }
  ] },
  { id: 'dialog_10', npc_id: 'char_2', parent_id: 'dialog_5', text: "Ah, so you've heard the rumors. Yes, there's supposed to be an ancient medallion hidden in my cellar. If you can find it and bring it to me, I'll make it worth your while.", responses: [
    { text: "I'll find it for you", next_id: "dialog_11" },
    { text: "Maybe another time", next_id: "dialog_8" }
  ] },
  { id: 'dialog_11', npc_id: 'char_2', parent_id: 'dialog_10', text: "Good. You'll need to find the key first - I lost it somewhere. Last I heard, someone near the forest found something interesting...", responses: [
    { text: "I'll start looking", next_id: "dialog_8" }
  ] },
  { id: 'dialog_12', npc_id: 'char_2', parent_id: 'dialog_5', text: "You found it? Let me see! *examines the medallion* Incredible! You actually found it! As promised, here's your reward - 100 gold pieces and my eternal gratitude!", responses: [
    { text: "Thank you", next_id: "dialog_13" }
  ] },
  { id: 'dialog_13', npc_id: 'char_2', parent_id: 'dialog_12', text: "*carefully wraps the medallion* This will make a fine addition to my collection. You've done well, adventurer.", responses: [] },
  { id: 'dialog_14', npc_id: 'char_3', parent_id: null, text: "*Shadowpaw's eyes gleam with intelligence* Meow... You seek the key to the cellar, don't you?", responses: [
    { text: "Yes, I'm looking for it", next_id: "dialog_15" },
    { text: "How did you know?", next_id: "dialog_16" },
    { text: "Just passing by", next_id: "dialog_17" }
  ] },
  { id: 'dialog_15', npc_id: 'char_3', parent_id: 'dialog_14', text: "I've seen it glinting in the moonlight. Look around the forest's edge, where shadows meet light.", responses: [
    { text: "Thank you for the hint", next_id: "dialog_18" }
  ] },
  { id: 'dialog_16', npc_id: 'char_3', parent_id: 'dialog_14', text: "*purrs mysteriously* We cats see many things. The tavern keeper's troubles echo in whispers through the village.", responses: [
    { text: "Can you help me find it?", next_id: "dialog_15" },
    { text: "Interesting...", next_id: "dialog_17" }
  ] },
  { id: 'dialog_17', npc_id: 'char_3', parent_id: 'dialog_14', text: "*flicks tail knowingly* Sometimes the most valuable treasures are found when we're 'just passing by'...", responses: [
    { text: "Tell me more", next_id: "dialog_15" },
    { text: "Goodbye", next_id: "dialog_18" }
  ] },
  { id: 'dialog_18', npc_id: 'char_3', parent_id: 'dialog_14', text: "*disappears into the shadows, leaving you with much to ponder*", responses: [] }
];