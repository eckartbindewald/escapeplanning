import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private personalityTraits: string[];
  private playerInterests: Set<string> = new Set();
  private emotiveActions = [
    '*smiles warmly*',
    '*gazes thoughtfully at the forest*',
    '*eyes sparkling with ancient wisdom*',
    '*gestures to the dancing shadows*',
    '*voice carries a hint of laughter*',
    '*watches a leaf spiral down*'
  ];

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
    this.personalityTraits = personality.split('.').map(t => t.trim()).filter(t => t);
  }

  async generateResponse(input: string): Promise<string> {
    const inputLower = input.toLowerCase();
    
    if (inputLower === 'no' || inputLower === 'nothing') {
      return this.getRandomResponse([
        "Ah, sometimes silence speaks volumes. *watches a leaf dance in the wind* What thoughts drift behind your eyes?",
        "*gently* Even 'nothing' can mean something. Tell me, what brings you to our forest today?",
        "*settling comfortably* Sometimes the best conversations start from nothing at all. What drew you to this place?"
      ]);
    }

    if (inputLower.includes('bored')) {
      return this.getRandomResponse([
        "*laughs softly* Life is full of wonders if you know where to look. What usually catches your interest?",
        "*eyes twinkling* Bored? Here in this ancient forest? Tell me what kind of adventures you seek.",
        "*gesturing to the surroundings* Each moment holds its own magic. What kind of magic calls to you?"
      ]);
    }

    // More natural, conversational responses
    return this.getRandomResponse([
      "*watching a bird soar overhead* Every visitor brings their own story. What's yours, I wonder?",
      "*picking up a fallen leaf* The forest speaks in many voices. Which ones call to you?",
      "*smiling warmly* Sometimes the best answers come from unexpected questions. What do you seek?",
      "*tracing patterns in the air* Your presence here is no accident. What drew you to this place?",
      "*humming thoughtfully* Each question leads to another path. Which shall we explore?"
    ]);
  }

  private getRandomResponse(responses: string[]): string {
    const filteredResponses = responses.filter(r => r !== this.lastResponse);
    const response = filteredResponses[Math.floor(Math.random() * filteredResponses.length)] || responses[0];
    
    this.lastResponse = response;
    this.updateMemory(response);
    return response;
  }

  private updateMemory(response: string) {
    this.context.push(`${this.name}: ${response}`);
    if (this.context.length > this.maxMemory) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory)];
    }
  }
}