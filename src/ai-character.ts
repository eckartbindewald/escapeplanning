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
  
  constructor(modelName: string = 'Xenova/FLAN-T5-small') {
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
        do_sample: true
      });
      
      let response = result[0].generated_text.trim();
      
      // Ensure the response isn't too short
      if (response.length < 10) {
        return "I sense there is more to discuss. What questions do you have?";
      }
      
      return response;
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'I apologize, but my thoughts are clouded at the moment. Perhaps we could speak again shortly?';
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
    modelName: string = 'Xenova/FLAN-T5-small'
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
    if (input.toLowerCase().includes("welcome the player")) {
      return "Welcome, seeker of truth. The paths before you hold many mysteries... and I sense you have an important role to play in unfolding them.";
    }
    
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Add input to context
    this.context = this.context.slice(-4); // Keep only recent context
    this.context.push(`Player: ${input}`);
    
    // Create focused prompt based on current conversation
    const prompt = `As a mysterious oracle named ${this.name}, respond to: "${input}". Context: ${this.context.join(" ")}. Keep the response mystical but clear.`;
    
    let response = await this.llm.generateText(prompt, 50);
    
    // Clean up common issues in responses
    response = response.replace(/^("|'|`)/g, '')
                      .replace(/("|'|`)$/g, '')
                      .replace(/^\w+:\s*/g, '')
                      .trim();
                      
    if (!response) {
      response = "The mysteries of fate are complex. What else would you like to know?";
    }
    
    response = this.addEmotiveAction(response);
    
    this.lastResponse = response;
    this.context.push(`${this.name}: ${response}`);
    this.conversationCount++;
    
    if (this.conversationCount % 3 === 0) {
      this.emotionalState *= 0.8;
    }
    
    return response;
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
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';