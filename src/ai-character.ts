import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = [],
    private responses: Record<string, string[]> = {}
  ) {
    this.context = [...knowledge];
  }

  async generateResponse(input: string): Promise<string> {
    const inputLower = input.toLowerCase();
    
    // Check for greetings
    if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      return `Greetings, traveler. I am ${this.name}, seeker of ancient truths.`;
    }

    // Check for how are you
    if (inputLower.includes('how are you')) {
      return "I exist in harmony with the cosmic forces that guide us all.";
    }

    // Check for questions about the medallion
    if (inputLower.includes('medallion')) {
      return "The Ancient Medallion... a powerful artifact that holds secrets beyond mortal understanding. Its true power lies not in its form, but in what it represents.";
    }

    // Check for questions about the forest
    if (inputLower.includes('forest')) {
      return "The forest is more than mere trees and shadows. It holds secrets that whisper to those who know how to listen.";
    }

    // Check for questions about knowledge or wisdom
    if (inputLower.includes('know') || inputLower.includes('wisdom') || inputLower.includes('truth')) {
      return "Knowledge is like the stars - countless points of light in the vast darkness. Which light will you follow?";
    }

    // Check for yes/no responses
    if (inputLower === 'yes' || inputLower === 'no') {
      return "The path of certainty often leads to uncertainty, and vice versa. Consider what lies beyond simple answers.";
    }

    // Default responses based on context
    const contextualResponses = [
      "The threads of fate weave a complex tapestry. Your role in it becomes clearer with each passing moment.",
      "Some questions lead to deeper mysteries. Are you prepared to understand the answers you seek?",
      "The ancient ones spoke of times like these. Listen carefully to the echoes of their wisdom.",
      "Your journey has only begun. The path ahead holds both shadow and light.",
      "In seeking answers, you have already begun to understand the questions."
    ];

    // Avoid repeating the last response
    let response;
    do {
      response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
    } while (response === this.lastResponse);

    this.lastResponse = response;
    this.updateMemory(input, response);
    return response;
  }

  private updateMemory(input: string, response: string) {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);

    if (this.context.length > this.maxMemory * 2) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory * 2)];
    }
  }
}