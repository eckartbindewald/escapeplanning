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
  
  constructor(modelName: string = 'Xenova/tiny-gpt2') {
    this.modelName = modelName;
  }
  
  private async initialize() {
    if (!this.initialized) {
      this.generator = await pipeline('text-generation', this.modelName);
      this.initialized = true;
    }
  }
  
  async generateText(prompt: string, maxTokens: number = 30): Promise<string> {
    await this.initialize();
    
    try {
      // Check for specific questions about known topics
      const lowerPrompt = prompt.toLowerCase();
      
      // Medallion-related responses
      if (lowerPrompt.includes('medallion')) {
        return "The Ancient Medallion holds great power, seeker. Hidden in the tavern's depths, it awaits one worthy to claim it. But beware - the path to it is not without its trials.";
      }
      
      // Key-related responses
      if (lowerPrompt.includes('key')) {
        return "Ah, you seek the key? Listen well - near the forest's edge, something glints in shadow. Perhaps fate has placed it there for one such as you.";
      }
      
      // Tavern-related responses
      if (lowerPrompt.includes('tavern') || lowerPrompt.includes('cellar')) {
        return "The tavern holds secrets in its depths, traveler. Its cellar guards mysteries that few have glimpsed. But the way is sealed... for now.";
      }
      
      // Generate response for other topics
      const result = await this.generator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        do_sample: true,
        no_repeat_ngram_size: 2
      });
      
      let response = result[0].generated_text;
      response = response.replace(prompt, '').trim();
      
      // Take only the first complete sentence
      const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
      response = sentences[0].trim();
      
      // Fallback if response is too short
      if (response.length < 20) {
        return "The answers you seek lie within, but the path reveals itself only to those who ask the right questions.";
      }
      
      return response;
    } catch (error) {
      console.error('LLM generation error:', error);
      return "The threads of fate are tangled at the moment. Perhaps we should speak of something else.";
    }
  }
}

/**
 * AICharacter class that uses a local LLM to generate responses
 * This handles contextual dialogue generation for NPCs in the game
 */
export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 30;
  private lastResponse: string = '';
  private conversationCount: number = 0;
  private recentTopics: string[] = [];
  private maxTopics: number = 5;
  private lastTopic: string = '';
  private characterResponses: Record<string, string[]> = {};
  private gameState?: GameState;
  private gameNodes?: Node[];
  private gameQuests?: Quest[];
  private llm: LLMInterface;
  private sentiment = new Sentiment();
  private emotionalState: number = 0;
  
  private emotiveActions: Record<EmotionState, string[]> = {
    positive: [
      '*eyes shimmer with ethereal light*',
      '*gestures gracefully*',
      '*smiles mysteriously*',
      '*waves hand, creating sparkles of light*'
    ],
    neutral: [
      '*gazes into the distance*',
      '*speaks in echoing tones*',
      '*floats serenely*',
      '*voice carries ancient wisdom*'
    ],
    empathetic: [
      '*aura pulses with understanding*',
      '*presence becomes comforting*',
      '*energy resonates with empathy*',
      '*ethereal form brightens*'
    ]
  };
  
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'Xenova/tiny-gpt2'
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
    if (input.includes("Welcome the player")) {
      return "Welcome, seeker of mysteries. I sense you have a role to play in uncovering the secrets that lie within these walls. The Ancient Medallion calls to those who would dare to seek it.";
    }
    
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    this.context.push(`Player: ${input}`);
    
    const prompt = this.createPrompt(input);
    let response = await this.llm.generateText(prompt, 30);
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
    let prompt = `You are ${this.name}, ${this.personality}. Respond with mystical wisdom about: ${input}\n\n`;
    
    if (this.knowledgeBase.length > 0) {
      const relevantKnowledge = this.knowledgeBase
        .filter(k => input.toLowerCase().split(' ').some(word => k.toLowerCase().includes(word)));
      if (relevantKnowledge.length > 0) {
        prompt += `Relevant knowledge:\n${relevantKnowledge.join('\n')}\n\n`;
      }
    }
    
    if (this.context.length > 0) {
      prompt += `Recent conversation:\n${this.context.slice(-2).join('\n')}\n`;
    }
    
    prompt += `\nRespond as ${this.name}:`;
    
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
    this.context.push(`User: ${input}`);
    this.context.push(`${this.name}: ${response}`);
    
    while (this.context.length > this.maxMemory) {
      this.context.shift();
    }
  }
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';