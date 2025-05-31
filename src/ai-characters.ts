import { AICharacter } from './ai-character';

export const aiCharacters: Record<string, AICharacter> = {
  'char_4': new AICharacter(
    'Luna',
    'Mysterious and enigmatic oracle who speaks in riddles and metaphors. She has knowledge of ancient secrets and future events, but reveals them cryptically.',
    [
      'The Ancient Medallion holds power beyond mortal understanding.',
      'The forest hides many secrets, some better left undiscovered.',
      'Time flows like a river, but sometimes circles back upon itself.',
      'The tavern keeper guards more than just his cellar.',
      'The key to understanding lies in the questions we dare to ask.',
      'Some treasures are meant to be found, others to remain hidden.',
      'The path to wisdom is rarely straight.',
      'In darkness, truth often shines brightest.'
    ]
  )
};