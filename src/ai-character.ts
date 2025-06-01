import { GameState, Node, Quest } from './types';
import Sentiment from 'sentiment';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use WASM
env.useBrowserCache = false;
env.allowLocalModels = false;

// LLM interface for local AI models
interface LLMInterface {
  generateText(prompt: string, maxTokens?: number): Promise<string>;
}

// Local LLM implementation using transformers.js
class LocalLLM implements LLMInterface {
  private generator: any;
  private modelName: string;
  private initialized: boolean = false;
  
  constructor(modelName: string = 'Xenova/LaMini-Flan-T5-783M') {
    this.modelName = modelName;
  }
  
  private async initialize() {
    if (!this.initialized) {
      this.generator = await pipeline('text2text-generation', this.modelName);
      this.initialized = true;
    }
  }
  
  async generateText(prompt: string, maxTokens: number = 50): Promise<string> {
    await this.initialize();
    
    try {
      const result = await this.generator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        do_sample: true,
        no_repeat_ngram_size: 2,
        max_length: 100 // Add maximum length constraint
      });
      
      // Clean up the response
      let response = result[0].generated_text.trim();
      
      // Remove any instances of the prompt from the response
      response = response.replace(new RegExp(prompt, 'gi'), '').trim();
      
      // Take only the first complete sentence if we got multiple
      const sentences = response.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        response = sentences[0].trim();
      }
      
      // Fallback response if the generated text is too short or empty
      if (response.length < 10) {
        return "I sense your curiosity. What knowledge do you seek?";
      }
      
      return response;
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'I sense your presence. How may I guide you today?';
    }
  }
}

/**
 * AICharacter class that uses a local LLM to generate responses
 * This handles contextual dialogue generation for NPCs in the game
 */
export class AICharacter {
  // Memory and conversation context
  private context: string[] = [];
  private maxMemory: number = 5; // Reduced from 30 to prevent context overflow
  private lastResponse: string = '';
  private conversationCount: number = 0;
  private recentTopics: string[] = [];
  private maxTopics: number = 5;
  private lastTopic: string = '';
  
  // Game state integration
  private gameState?: GameState;
  private gameNodes?: Node[];
  private gameQuests?: Quest[];
  
  // LLM for text generation
  private llm: LLMInterface;
  
  // Sentiment analysis for emotion detection
  private sentiment = new Sentiment();
  private emotionalState: number = 0; // Range: -1 to 1
  
  // Emotive actions for character expression
  private emotiveActions: Record<EmotionState, string[]> = {
    positive: [
      '*smiles warmly*',
      '*nods enthusiastically*',
      '*eyes shimmer*',
      '*gestures gracefully*'
    ],
    neutral: [
      '*observes thoughtfully*',
      '*pauses briefly*',
      '*gestures calmly*',
      '*gazes serenely*'
    ],
    empathetic: [
      '*listens intently*',
      '*nods understanding*',
      '*offers a gentle smile*',
      '*focuses attentively*'
    ]
  };
  
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'Xenova/LaMini-Flan-T5-783M'
  ) {
    this.llm = new LocalLLM(modelName);
    this.context = [...knowledgeBase.slice(-this.maxMemory)];
  }
  
  public updateGameData(gameState?: GameState, nodes?: Node[], quests?: Quest[]): void {
    this.gameState = gameState;
    this.gameNodes = nodes;
    this.gameQuests = quests;
  }
  
  public async generateResponse(input: string): Promise<string> {
    // Special handling for initial welcome message
    if (input.includes("Welcome the player")) {
      return "Welcome, seeker of truth. The paths before you hold many mysteries... and I sense you have an important role to play in unfolding them.";
    }
    
    // Prevent processing if input is too long
    if (input.length > 200) {
      return "I sense your thoughts, but please speak more concisely.";
    }
    
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Keep context size manageable
    while (this.context.length >= this.maxMemory) {
      this.context.shift();
    }
    this.context.push(`Player: ${input}`);
    
    const prompt = this.createPrompt(input);
    let response = await this.llm.generateText(prompt, 50);
    response = this.addEmotiveAction(response);
    
    this.lastResponse = response;
    this.updateContext(input, response);
    this.conversationCount++;
    
    if (this.conversationCount % 3 === 0) {
      this.emotionalState *= 0.8;
    }
    
    return response;
  }
  
  private createPrompt(input: string): string {
    let prompt = `You are ${this.name}, ${this.personality}. Respond briefly and mystically.\n\n`;
    
    if (this.context.length > 0) {
      prompt += `\nRecent conversation:\n${this.context.slice(-2).join('\n')}\n`;
    }
    
    prompt += `\nPlayer: ${input}\nRespond as ${this.name}:`;
    
    return prompt;
  }
  
  private addEmotiveAction(response: string): string {
    let emotionType: EmotionState;
    
    if (this.emotionalState > 0.3) {
      emotionType = 'positive';
    } else if (this.emotionalState < -0.3) {
      emotionType = 'empathetic';
    } else {
      emotionType = 'neutral';
    }
    
    const actions = this.emotiveActions[emotionType];
    return `${actions[Math.floor(Math.random() * actions.length)]} ${response}`;
  }
  
  private updateContext(input: string, response: string): void {
    // Keep only the most recent exchanges
    if (this.context.length >= this.maxMemory) {
      this.context = this.context.slice(-3);
    }
    this.context.push(`${this.name}: ${response}`);
  }
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';