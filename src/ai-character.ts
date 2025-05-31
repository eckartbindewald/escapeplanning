import { Pipeline } from '@xenova/transformers';

export class AICharacter {
  private pipeline: Pipeline | null = null;
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
    this.pipeline = await Pipeline.fromPreset('text-generation', {
      quantized: true,
      model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
    });
  }

  async generateResponse(input: string): Promise<string> {
    if (!this.pipeline) {
      await this.initialize();
    }

    const prompt = this.buildPrompt(input);
    const result = await this.pipeline!.generate(prompt, {
      max_new_tokens: 100,
      temperature: 0.7
    });

    const response = result[0].generated_text;
    this.updateMemory(input, response);

    return response;
  }

  private buildPrompt(input: string): string {
    return `
Character: ${this.name}
Personality: ${this.personality}

Recent context:
${this.context.join('\n')}

User: ${input}

Response:`;
  }

  private updateMemory(input: string, response: string) {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);

    if (this.context.length > this.maxMemory * 2) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory * 2)];
    }
  }
}