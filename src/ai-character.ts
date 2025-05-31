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
    '*watches a leaf spiral down*',
    '*tilts head with genuine interest*',
    '*leans forward attentively*',
    '*brushes a strand of silver hair*',
    '*traces patterns in the air*',
    '*adjusts her flowing robes*',
    '*glances at the shifting shadows*'
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
        "*settling comfortably* I sense your frustration. Sometimes the most meaningful conversations start from moments of doubt. What would make this more interesting for you?",
        "*gently* Your honesty is refreshing. Let's find a more engaging direction for our chat. What topics truly interest you?",
        "*leaning forward with genuine interest* I value your directness. Perhaps we could explore something that matters more to you? What would you like to discuss?"
      ]);
    }

    if (input.length < 5) {
      return this.getRandomResponse([
        "*settling nearby* Sometimes few words hold deep meaning. What thoughts are you pondering?",
        "*smiling warmly* Brief words can spark the most interesting conversations. What's on your mind?",
        "*watching the leaves dance* Your brevity intrigues me. Care to share more of your thoughts?"
      ]);
    }

    // Generate contextual responses based on input topics
    if (input.toLowerCase().includes('forest') || input.toLowerCase().includes('nature')) {
      return this.getRandomResponse([
        "*gesturing to the surrounding trees* The forest has been my home and teacher. What draws you to these ancient woods?",
        "*watching a bird soar overhead* Nature speaks in many voices - through rustling leaves, through morning mist, through evening shadows. Which of its voices calls to you?",
        "*touching a nearby tree trunk* These woods hold countless stories. What story would you like to hear?"
      ]);
    }

    if (input.toLowerCase().includes('magic') || input.toLowerCase().includes('power')) {
      return this.getRandomResponse([
        "*eyes twinkling* Magic flows through everything here, though not always in the ways we expect. What kind of magic do you seek?",
        "*tracing glowing patterns in the air* Power comes in many forms - wisdom, kindness, understanding. Which interests you most?",
        "*gesturing to the dancing shadows* The greatest magic often lies in the simplest things - a smile, a kind word, a moment of understanding. What magic have you discovered in your journey?"
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
      "I sense there's more to your words. What thoughts lie behind them?",
      "Your perspective intrigues me. How did you come to see things this way?",
      "Something in your voice suggests a deeper story. Would you share it?",
      "That's an interesting way to look at it. What led you to this understanding?",
      "Your words carry echoes of experience. What journey brought you here?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generatePersonalResponse(input: string): string {
    const responses = [
      "I've met many travelers, but each brings their own unique story. What's yours?",
      "Your approach reminds me of ancient wisdom, yet feels fresh. How do you see it?",
      "There's something unique about your perspective. Would you tell me more?",
      "I find your thoughts fascinating. What else have you discovered in your travels?",
      "Your words paint an interesting picture. How else do you see the world?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateNaturalResponse(input: string): string {
    const responses = [
      "The forest seems to respond to your presence. What do you feel here?",
      "Nature often reflects our inner thoughts. What does it show you?",
      "These woods hold many stories. Which ones speak to you?",
      "Every path here leads to discovery. What would you like to explore?",
      "The answers we seek often find us in unexpected ways. What answers do you seek?"
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