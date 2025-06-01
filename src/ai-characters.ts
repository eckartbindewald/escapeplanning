import { AICharacter } from './ai-character';

export const aiCharacters: Record<string, AICharacter> = {
  'char_4': new AICharacter(
    'Luna',
    'a mysterious and ethereal being who speaks with wisdom and insight',
    [
      // Core knowledge about the medallion quest
      'The ancient medallion lies hidden in the tavern\'s cellar',
      'A mysterious key can be found at the forest edge',
      'The medallion holds great power and significance',
      'Grim seeks the medallion for his collection',
      
      // Wisdom and guidance
      'Every journey has its purpose',
      'Knowledge comes to those who seek with patience',
      'The path reveals itself to the observant',
      'Sometimes the simplest solution requires the most courage',
      
      // Character traits
      'Deeply interested in helping others grow',
      'Sees patterns in the threads of fate',
      'Values genuine connection and understanding',
      'Believes in the power of personal discovery'
    ]
  )
};