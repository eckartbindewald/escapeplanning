import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private personalityTraits: string[];
  private conversationTopics: Set<string> = new Set();
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
    // Track conversation topics
    const topics = this.extractTopics(input);
    topics.forEach(t => this.conversationTopics.add(t));

    // Handle different types of inputs
    if (input.toLowerCase().includes('stupid') || input.toLowerCase().includes('pointless')) {
      return this.getRandomResponse([
        "*tilts head curiously* Your frustration speaks of deeper questions. What answers do you truly seek?",
        "*gently* Sometimes the simplest questions hide the most complex truths. What troubles you?",
        "*thoughtfully* Every word carries weight, even those of doubt. What would make this conversation more meaningful for you?"
      ]);
    }

    if (input.length < 5) {
      return this.getRandomResponse([
        "*settling on a nearby stone* Sometimes few words carry great meaning. What thoughts lie behind them?",
        "*watching the leaves dance* Brief words often hold deep waters. Care to explore them further?",
        "*smiling gently* Your brevity intrigues me. What more would you share if time were endless?"
      ]);
    }

    // Generate a contextual response based on the input
    const responses = [
      `*${this.getRandomEmotiveAction()}* ${this.generateContextualResponse(input)}`,
      `*${this.getRandomEmotiveAction()}* ${this.generatePersonalResponse(input)}`,
      `*${this.getRandomEmotiveAction()}* ${this.generateNaturalResponse(input)}`
    ];

    return this.getRandomResponse(responses);
  }

  private extractTopics(input: string): string[] {
    return input.toLowerCase()
      .split(/[\s,.!?]+/)
      .filter(word => word.length > 3);
  }

  private getRandomEmotiveAction(): string {
    return this.emotiveActions[Math.floor(Math.random() * this.emotiveActions.length)];
  }

  private generateContextualResponse(input: string): string {
    const responses = [
      "Your words remind me of ancient whispers in these woods. What echoes do you hear?",
      "There's wisdom in your perspective. How did you come to see things this way?",
      "The forest seems to respond to your presence. What draws you to these shadows?",
      "Your journey here must have many stories. Which would you share?",
      "Sometimes the path chooses us as much as we choose it. What brought you to this moment?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generatePersonalResponse(input: string): string {
    const responses = [
      "Each visitor brings their own light to these woods. What light do you carry?",
      "Your questions stir ancient memories. What answers do you seek?",
      "The trees whisper differently in your presence. What secrets do they share with you?",
      "Your path through these woods is unique. What guides your steps?",
      "There's more to your words than meets the ear. What lies beneath them?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateNaturalResponse(input: string): string {
    const responses = [
      "The wind carries many stories. Which one speaks to you?",
      "Every leaf falls with purpose. What purpose brings you here?",
      "The forest holds many secrets. Which ones call to you?",
      "Time flows differently among these trees. How does it feel to you?",
      "Nature speaks in riddles sometimes. What riddles do you ponder?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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