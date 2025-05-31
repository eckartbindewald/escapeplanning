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
    
    // Medallion-specific responses
    if (inputLower.includes('where') && inputLower.includes('medallion')) {
      const medallionResponses = [
        "The medallion's location is shrouded in mystery, but I sense its presence beneath our feet. The tavern keeper may know more...",
        "Seek the depths below the tavern, but first you must find the key that was lost.",
        "The path to the medallion begins with a key, and ends in darkness below."
      ];
      return this.getRandomResponse(medallionResponses);
    }

    // General medallion questions
    if (inputLower.includes('medallion')) {
      const medallionResponses = [
        "The Ancient Medallion holds power that few can comprehend. Its secrets are both a blessing and a curse.",
        "Many have sought the medallion, but few understand its true purpose. Are you prepared for what you might find?",
        "The medallion's power extends beyond the physical realm. Its true nature is known only to those who have gazed upon its symbols."
      ];
      return this.getRandomResponse(medallionResponses);
    }

    // Forest-related responses
    if (inputLower.includes('forest')) {
      const forestResponses = [
        "The forest holds many secrets, including one that might help you on your quest. Look carefully near its edge.",
        "In the forest's shadows, a key was lost... or perhaps, deliberately placed.",
        "The trees whisper of hidden treasures and lost artifacts. Listen carefully to their song."
      ];
      return this.getRandomResponse(forestResponses);
    }

    // Key-related responses
    if (inputLower.includes('key')) {
      const keyResponses = [
        "A mysterious key lies where shadow meets light, at the forest's edge.",
        "The key you seek has found its way to nature's embrace.",
        "Look to where the trees meet the town, there you might find what unlocks the path forward."
      ];
      return this.getRandomResponse(keyResponses);
    }

    // Greetings
    if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      const greetings = [
        "Greetings, seeker of truth. The stars speak of your arrival.",
        "Welcome, wanderer. I've been expecting someone like you.",
        "Ah, another soul drawn to the mysteries that surround us."
      ];
      return this.getRandomResponse(greetings);
    }

    // How are you
    if (inputLower.includes('how are you')) {
      const statusResponses = [
        "I exist in harmony with the forces that guide us all.",
        "My state of being transcends simple measures of well-being.",
        "I am as I must be, aligned with the cosmic threads that bind us."
      ];
      return this.getRandomResponse(statusResponses);
    }

    // Default mysterious responses
    const defaultResponses = [
      "The answers you seek may be closer than you realize.",
      "Sometimes the path forward lies in understanding what's right before us.",
      "Your questions hold wisdom in themselves. Consider what drives you to ask them.",
      "The threads of fate weave a complex tapestry. Your role in it becomes clearer with each step.",
      "There are no coincidences in your journey. Every choice leads to revelation."
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