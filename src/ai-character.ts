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
  
  async generateText(prompt: string, maxTokens: number = 100): Promise<string> {
    await this.initialize();
    
    try {
      const result = await this.generator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        do_sample: true
      });
      
      return result[0].generated_text;
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'I apologize, but I am having trouble formulating a response.';
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
  
  /**
   * Creates a new AI character powered by a local LLM
   * 
   * @param name Character name
   * @param personality Short description of personality traits
   * @param knowledgeBase Array of facts/knowledge this character possesses
   * @param modelName Name of the LLM to use
   */
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'Xenova/LaMini-Flan-T5-783M'
  ) {
    // Initialize the local LLM
    this.llm = new LocalLLM(modelName);
    
    // Add knowledge to context
    this.context = [...knowledgeBase];
  }
  
  /**
   * Update the character with current game state information
   * This enables contextual responses based on game world information
   */
  updateGameData(gameState?: GameState, nodes?: Node[], quests?: Quest[]): void {
    this.gameState = gameState;
    this.gameNodes = nodes;
    this.gameQuests = quests;
  }
  
  /**
   * Main method to generate a response to player input using a local LLM
   */
  async generateResponse(input: string): Promise<string> {
    // Analyze sentiment
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Update conversation history
    this.context.push(`Player: ${input}`);
    
    // Generate the prompt for the LLM
    const prompt = this.createPrompt(input);
    
    // Get response from LLM
    let response = await this.llm.generateText(prompt, 150);
    
    // Add an emotive action based on emotional state
    response = this.addEmotiveAction(response);
    
    // Update conversation context with the response
    this.lastResponse = response;
    this.updateContext(input, response);
    
    // Track conversation count
    this.conversationCount++;
    
    // Apply emotional decay over time
    if (this.conversationCount % 3 === 0) {
      this.emotionalState *= 0.8; // Gradually return to neutral
    }
    
    return response;
  }
  
  /**
   * Creates a detailed prompt for the LLM based on current context
   */
  private createPrompt(input: string): string {
    // Build character description
    let prompt = `You are ${this.name}, ${this.personality}. Respond in character.\n\n`;
    
    // Add current game state information if available
    if (this.gameState) {
      prompt += `Current location: ${this.gameState.currentLocation || 'unknown'}.\n`;
      
      if (this.gameState.inventory && this.gameState.inventory.length > 0) {
        prompt += `Player's items: ${this.gameState.inventory.join(', ')}.\n`;
      }
    }
    
    // Add knowledge base facts that might be relevant
    if (this.knowledgeBase.length > 0) {
      prompt += `\nYour knowledge:\n${this.knowledgeBase.join('\n')}\n`;
    }
    
    // Add recent conversation context
    if (this.context.length > 0) {
      prompt += `\nRecent conversation:\n${this.context.slice(-3).join('\n')}\n`;
    }
    
    // Add final instruction
    prompt += `\nPlayer: ${input}\nRespond as ${this.name}:`;
    
    return prompt;
  }
  
  private extractTopics(input: string): string[] {
    // Simple word extraction for topics
    return input.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2);
  }
  
  private addEmotiveAction(response: string): string {
    let emotionType: EmotionState;
    
    // Determine emotional state category
    if (this.emotionalState > 0.3) {
      emotionType = 'positive';
    } else if (this.emotionalState < -0.3) {
      emotionType = 'empathetic';
    } else {
      emotionType = 'neutral';
    }
    
    // Get appropriate action set and select one randomly
    const actions = this.emotiveActions[emotionType];
    return `${actions[Math.floor(Math.random() * actions.length)]} ${response}`;
  }
  
  private updateContext(input: string, response: string): void {
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);
    
    // Maintain context size limit
    while (this.context.length > this.maxMemory) {
      this.context.shift();
    }
  }
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';