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
      this.pipeline = await pipeline('text-generation', 'Xenova/tiny-llama-1.1b-chat-v0.1', {
        quantized: true,
        revision: 'main'
      });
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
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true
      });

      const response = this.extractResponse(result[0].generated_text);
      this.updateMemory(input, response);

      return response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildPrompt(input: string): string {
    return `<|system|>You are ${this.name}, ${this.personality}</|system|>

<|user|>${input}</|user|>

<|assistant|>`;
  }

  private extractResponse(text: string): string {
    // Extract the response after the assistant tag
    const match = text.match(/<\|assistant\|>(.*?)(?:<\|.*?\|>|$)/s);
    return match ? match[1].trim() : text;
  }

  private updateMemory(input: string, response: string) {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);

    if (this.context.length > this.maxMemory * 2) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory * 2)];
    }
  }
}