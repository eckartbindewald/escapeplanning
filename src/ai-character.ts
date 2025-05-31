import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private personalityTraits: string[];
  private playerInterests: Set<string> = new Set();
  private emotiveActions = [
    '*smiles warmly*',
    '*tilts head curiously*',
    '*eyes twinkling*',
    '*leans forward with interest*',
    '*gestures gracefully*',
    '*nods thoughtfully*'
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
    
    // Track player interests from their input
    this.updatePlayerInterests(inputLower);
    
    // Personal questions - show genuine interest and personality
    if (inputLower.includes('bored') || inputLower.includes('boring')) {
      return this.getRandomResponse([
        "*eyes sparkling with amusement* Bored? With all the mysteries around us? Tell me what excites you - perhaps we can find something fascinating together.",
        "*leaning forward* Life is never boring when you know how to look at it right. What interests you most about the world?",
        "*smiling warmly* Each moment holds potential for wonder. What kind of adventures call to your heart?"
      ]);
    }

    if (inputLower.includes('college') || inputLower.includes('study') || inputLower.includes('learn')) {
      return this.getRandomResponse([
        "*eyes dancing with mirth* My education came from the whispers of ancient trees and the riddles of starlight. But I'd love to hear about your learning journey.",
        "*gesturing to the surroundings* The world itself is my teacher. What lessons has life taught you recently?",
        "*looking thoughtful* Knowledge comes in many forms. What kind of wisdom do you seek?"
      ]);
    }

    // Casual conversation showing genuine interest
    if (inputLower.includes('yes') || inputLower === 'yes yes') {
      return this.getRandomResponse([
        "*eyes brightening* Your enthusiasm is refreshing! Tell me more about what interests you.",
        "*smiling warmly* I sense your eagerness. What particularly catches your attention?",
        "*nodding encouragingly* Yes, I thought you might understand. What else would you like to know?"
      ]);
    }

    // Quest-related but conversational
    if (inputLower.includes('knowledge') || inputLower.includes('how do you know')) {
      return this.getRandomResponse([
        "*eyes twinkling mysteriously* The winds carry many secrets to those who know how to listen. What whispers have you heard in your travels?",
        "*gesturing to the forest* My knowledge comes from many sources - some obvious, some hidden. What secrets do you seek?",
        "*smiling knowingly* Sometimes understanding comes from unexpected places. What has your journey taught you so far?"
      ]);
    }

    // Default responses with personality and interest
    return this.getRandomResponse([
      "*watching you with gentle curiosity* Every question opens new paths. Which shall we explore together?",
      "*smiling warmly* Your curiosity is refreshing. What other thoughts dance in your mind?",
      "*tilting head thoughtfully* An interesting perspective! What led you to that question?",
      "*eyes showing genuine interest* I sense there's more to your words. Shall we delve deeper?",
      "*leaning forward attentively* Your questions reveal much about you. What else would you like to explore?"
    ]);
  }

  private isOffTopic(input: string): boolean {
    const offtopicKeywords = ['vape', 'smoking', 'pizza', 'movie', 'internet', 'phone', 'computer'];
    return offtopicKeywords.some(keyword => input.includes(keyword));
  }

  private updatePlayerInterests(input: string) {
    const interestKeywords = ['magic', 'forest', 'mystery', 'power', 'history', 'adventure', 'quest'];
    interestKeywords.forEach(keyword => {
      if (input.includes(keyword)) {
        this.playerInterests.add(keyword);
      }
    });
  }

  private getRandomResponse(responses: string[]): string {
    // Add emotive action if response doesn't already have one
    const processedResponses = responses.map(r => 
      r.includes('*') ? r : `${this.getRandomEmotiveAction()} ${r}`
    );
    
    // Avoid repeating the last response
    const filteredResponses = processedResponses.filter(r => r !== this.lastResponse);
    const response = filteredResponses[Math.floor(Math.random() * filteredResponses.length)] || processedResponses[0];
    
    this.lastResponse = response;
    this.updateMemory(response);
    return response;
  }

  private getRandomEmotiveAction(): string {
    return this.emotiveActions[Math.floor(Math.random() * this.emotiveActions.length)];
  }

  private updateMemory(response: string) {
    this.context.push(`${this.name}: ${response}`);
    if (this.context.length > this.maxMemory) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory)];
    }
  }
}