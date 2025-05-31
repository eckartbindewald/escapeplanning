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
  
  constructor(modelName: string = 'Xenova/TinyLlama-1.1B-Chat-v1.0') {
    this.modelName = modelName;
  }
  
  private async initialize() {
    if (!this.initialized) {
      this.generator = await pipeline('text-generation', this.modelName);
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
        no_repeat_ngram_size: 2
      });
      
      // Clean up the response
      let response = result[0].generated_text;
      
      // Remove the prompt from the response
      response = response.replace(prompt, '').trim();
      
      // Take only the first complete sentence if we got multiple
      const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
      response = sentences[0].trim();
      
      // Ensure the response isn't too short
      if (response.length < 10) {
        return "Greetings, traveler. How may I assist you on your journey?";
      }
      
      return response;
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'Greetings, traveler. How may I assist you on your journey?';
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
  private maxMemory: number = 30;
  private lastResponse: string = '';
  private conversationCount: number = 0;
  private recentTopics: string[] = [];
  private maxTopics: number = 5;
  private lastTopic: string = '';
  private characterResponses: Record<string, string[]> = {};
  
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
      '*eyes light up*',
      '*gestures excitedly*'
    ],
    neutral: [
      '*tilts head thoughtfully*',
      '*pauses reflectively*',
      '*gestures gently*',
      '*gazes thoughtfully*'
    ],
    empathetic: [
      '*leans forward with concern*',
      '*nods understandingly*',
      '*offers a sympathetic smile*',
      '*listens attentively*'
    ]
  };
  
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'Xenova/TinyLlama-1.1B-Chat-v1.0'
  ) {
    this.llm = new LocalLLM(modelName);
    this.context = [...knowledgeBase];
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
    
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
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
    let prompt = `You are ${this.name}, ${this.personality}. Give a short, mystical response.\n\n`;
    
    if (this.gameState) {
      prompt += `Current location: ${this.gameState.currentLocation || 'unknown'}.\n`;
      
      if (this.gameState.inventory && this.gameState.inventory.length > 0) {
        prompt += `Player's items: ${this.gameState.inventory.join(', ')}.\n`;
      }
    }
    
    if (this.knowledgeBase.length > 0) {
      prompt += `\nYour knowledge:\n${this.knowledgeBase.join('\n')}\n`;
    }
    
    if (this.context.length > 0) {
      prompt += `\nRecent conversation:\n${this.context.slice(-3).join('\n')}\n`;
    }
    
    prompt += `\nPlayer: ${input}\nRespond as ${this.name}:`;
    
    return prompt;
  }
  
  private extractTopics(input: string): string[] {
    return input.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2);
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
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);
    
    while (this.context.length > this.maxMemory) {
      this.context.shift();
    }
  }
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';