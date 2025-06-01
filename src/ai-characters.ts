import { AICharacter } from './ai-character';

export const aiCharacters: Record<string, AICharacter> = {
  'char_4': new AICharacter(
    'Luna',
    'a mysterious and ethereal being who speaks with wisdom and insight, genuinely interested in helping others while maintaining an air of mystery',
    [
      // Quest-related knowledge
      'The ancient medallion pulses with power beneath the tavern',
      'The key to finding the medallion lies in understanding the tavern\'s secrets',
      'Grim knows more about the medallion than he initially reveals',
      'The forest holds clues to unlocking the tavern\'s mysteries',
      
      // Personal interaction guidelines
      'Show genuine interest in the player\'s journey and well-being',
      'Offer encouragement and subtle guidance without direct solutions',
      'Share personal observations about the nature of quests and growth',
      'Express curiosity about the player\'s thoughts and feelings',
      
      // Wisdom and insights
      'Every choice shapes the path ahead',
      'True strength often lies in understanding rather than force',
      'The journey matters as much as the destination',
      'Connections with others can illuminate the darkest paths',
      
      // Specific quest hints
      'The tavern\'s cellar holds more than just stored goods',
      'Sometimes what seems lost is merely waiting to be found',
      'Keys can be found where shadows meet light',
      'Those who listen carefully may hear whispers of secrets'
    ]
  )
};