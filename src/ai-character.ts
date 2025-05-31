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
      throw new Error('Failed to initialize AI character');
    }
  }

  async generateResponse(input: string): Promise<string> {
    if (!this.pipeline) {
      await this.initialize();
    }

    try {
      const prompt = this.buildPrompt(input);
      const result = await this.pipeline(prompt, {
        max_new_tokens: 50,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: 50256
      });

      const response = this.cleanResponse(result[0].generated_text);
      this.updateMemory(input, response);

      return response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildPrompt(input: string): string {
    const contextStr = this.context.slice(-4).join('\n');
    return `${this.name} is ${this.personality}\n\nContext:\n${contextStr}\n\nUser: ${input}\n${this.name}:`;
  }

  private cleanResponse(text: string): string {
    // Extract the response after the character name
    const parts = text.split(`${this.name}:`);
    if (parts.length > 1) {
      // Take the last response and clean it up
      let response = parts[parts.length - 1].trim();
      
      // Remove any trailing dialogue or system text
      response = response.split('\n')[0];
      
      // Ensure the response is not too long
      if (response.length > 100) {
        response = response.substring(0, 100) + '...';
      }
      
      return response;
    }
    return text;
  }

  private updateMemory(input: string, response: string) {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);

    if (this.context.length > this.maxMemory * 2) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory * 2)];
    }
  }
}