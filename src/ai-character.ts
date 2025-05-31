import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private pipeline: any = null;
  private context: string[] = [];
  private maxMemory: number = 10;

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
  }

  async initialize() {
    try {
      this.pipeline = await pipeline('text-generation', 'Xenova/gpt2');
    } catch (error) {
      console.error('Failed to initialize pipeline:', error);
      return "Greetings, traveler. *speaks in a mystical voice*";
    }
  }

  async generateResponse(input: string): Promise<string> {
    // Default responses if AI fails
    const defaultResponses = [
      "The winds of fate whisper many secrets...",
      "Ah, you seek knowledge. But are you prepared for the truth?",
      "In time, all shall be revealed.",
      "The ancient medallion's power calls to those who are worthy.",
      "The forest holds many secrets, dear traveler.",
      "What you seek may be closer than you think.",
      "Sometimes the simplest questions have the most complex answers.",
      "I sense you have an important role to play in what's to come."
    ];

    try {
      if (!this.pipeline) {
        await this.initialize();
      }

      // For now, return a random mystical response
      const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      this.updateMemory(input, response);
      return response;

    } catch (error) {
      console.error('Failed to generate response:', error);
      return defaultResponses[0];
    }
  }

  private updateMemory(input: string, response: string) {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);

    if (this.context.length > this.maxMemory * 2) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory * 2)];
    }
  }
}