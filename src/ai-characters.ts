import { AICharacter } from './ai-character';

export const aiCharacters: Record<string, AICharacter> = {
  'char_4': new AICharacter(
    'Luna',
    'a mysterious and ethereal being who speaks with wisdom and insight',
    [
      // Quest-specific knowledge
      'The ancient medallion rests in the tavern\'s depths',
      'A key lies hidden where the forest meets civilization',
      'The medallion resonates with ancient power',
      'Some secrets reveal themselves only to the patient',
      
      // Location knowledge
      'The forest edge holds more than meets the eye',
      'The tavern\'s cellar guards its secrets well',
      'Paths that seem simple often lead to profound discoveries',
      
      // General wisdom
      'Truth often hides in plain sight',
      'The simplest answer may be the deepest wisdom',
      'Every seeker must walk their own path',
      'Knowledge comes to those who listen with both mind and heart',
      
      // Character traits
      'Genuinely interested in helping others find their way',
      'Sees connections in the tapestry of fate',
      'Values authentic dialogue and understanding',
      'Believes in guiding rather than telling'
    ]
  )
};