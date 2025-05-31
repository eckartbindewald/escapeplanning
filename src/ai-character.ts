import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
  }

  async generateResponse(input: string): Promise<string> {
    const inputLower = input.toLowerCase();
    
    // Questions about Luna herself
    if (inputLower.includes('what') && inputLower.includes('wearing')) {
      return "I wear robes of midnight blue, adorned with silver symbols that shift and change as you watch them. But my appearance is merely a reflection of deeper truths.";
    }

    if (inputLower.includes('what') && (inputLower.includes('do you do') || inputLower.includes('doing here'))) {
      return "I observe the threads of fate and guide those who seek understanding. The forest's edge is where multiple paths converge, making it an ideal place to watch destinies unfold.";
    }

    // Medallion-specific responses
    if (inputLower.includes('where') && inputLower.includes('medallion')) {
      return "The medallion lies beneath the tavern, in its ancient cellar. But you'll need the key from the forest's edge to unlock the path.";
    }

    // General medallion questions
    if (inputLower.includes('medallion')) {
      return "The Ancient Medallion is a powerful artifact hidden in the tavern's cellar. Grim, the tavern keeper, has long sought it. Find the key at the forest's edge, and you'll be able to reach it.";
    }

    // Forest-related responses
    if (inputLower.includes('forest')) {
      return "The forest's edge holds a key that will help you on your quest. Look carefully among the shadows - what seems lost is often precisely where it needs to be.";
    }

    // Key-related responses
    if (inputLower.includes('key')) {
      return "The key you seek lies here at the forest's edge. It will unlock the cellar door in the tavern, where greater treasures await.";
    }

    // Greetings
    if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      const greetings = [
        "Welcome, seeker. I am Luna, observer of paths and keeper of ancient knowledge.",
        "Greetings. I am Luna, and I've been waiting for someone to ask the right questions.",
        "Well met. I am Luna, and I sense you have questions about the medallion."
      ];
      return this.getRandomResponse(greetings);
    }

    // How are you
    if (inputLower.includes('how are you')) {
      return "I exist in harmony with the forces that guide us all. But you didn't come here to inquire about my well-being - you seek the medallion, do you not?";
    }

    // Default responses - now more helpful while maintaining mystery
    const defaultResponses = [
      "Ask me about the medallion, the forest, or the key - I may have insights that will aid your quest.",
      "Your path leads to the tavern's cellar, but first you must find what was lost in these woods.",
      "The key near the forest will unlock the way to the medallion below the tavern. What else would you know?",
      "Seek first the key at the forest's edge, then the cellar beneath the tavern. The medallion awaits.",
      "The answers you seek lie between the forest's edge and the tavern's depths. What would you know of either?"
    ];
    
    return this.getRandomResponse(defaultResponses);
  }

  private getRandomResponse(responses: string[]): string {
    let response;
    do {
      response = responses[Math.floor(Math.random() * responses.length)];
    } while (response === this.lastResponse && responses.length > 1);
    
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