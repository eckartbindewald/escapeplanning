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
        temperature: 0.8,
        do_sample: true,
        top_k: 50,
        top_p: 0.9
      });
      
      let response = result[0].generated_text.trim();
      
      // Clean up response
      response = response.replace(/^("|'|`)/g, '')
                        .replace(/("|'|`)$/g, '')
                        .replace(/^\w+:\s*/g, '')
                        .replace(/^Luna:?\s*/i, '')
                        .trim();
      
      // Ensure minimum response quality
      if (response.length < 20 || 
          response.includes("snob") || 
          response.includes("snaft") ||
          response.includes("you are Luna")) {
        throw new Error("Low quality response");
      }
      
      return response;
      
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'The threads of fate are momentarily unclear. Perhaps rephrase your question?';
    }
  }
}

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 5;
  private lastResponse: string = '';
  private conversationCount: number = 0;
  private sentiment = new Sentiment();
  private emotionalState: number = 0;
  private llm: LLMInterface;
  
  private emotiveActions: Record<EmotionState, string[]> = {
    positive: [
      '*eyes shimmer with ethereal light*',
      '*gestures gracefully*',
      '*smiles mysteriously*',
      '*waves hand, creating sparkles of light*'
    ],
    neutral: [
      '*gazes into the distance*',
      '*floats serenely*',
      '*voice echoes softly*',
      '*ethereal robes ripple*'
    ],
    empathetic: [
      '*energy pulses warmly*',
      '*aura glows with understanding*',
      '*presence becomes comforting*',
      '*ethereal light dims gently*'
    ]
  };
  
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'Xenova/LaMini-Flan-T5-783M'
  ) {
    this.llm = new LocalLLM(modelName);
    this.context = [...knowledgeBase];
  }
  
  public updateGameData(gameState?: GameState, nodes?: Node[], quests?: Quest[]): void {
    if (gameState?.currentQuests['quest_4']) {
      this.context.push("The player is searching for the ancient medallion.");
      this.context.push("The medallion is hidden in the tavern's cellar.");
      this.context.push("A mysterious key at the forest edge unlocks the way.");
    }
  }
  
  public async generateResponse(input: string): Promise<string> {
    // Update emotional state based on input
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Keep recent context
    this.context = this.context.slice(-this.maxMemory);
    this.context.push(`Player: ${input}`);
    
    // Create detailed prompt
    let prompt = `As Luna, a mysterious and ethereal being, respond to: "${input}"\n\n`;
    prompt += "Context:\n";
    prompt += "- You are genuinely interested in helping while maintaining an air of mystery\n";
    prompt += "- You know about the ancient medallion quest and can provide subtle hints\n";
    prompt += "- You care about the player's journey and well-being\n";
    prompt += `- Previous context: ${this.context.slice(-2).join(" ")}\n\n`;
    prompt += "Requirements:\n";
    prompt += "- Be mystical yet clear and helpful\n";
    prompt += "- Show genuine interest in the player\n";
    prompt += "- Maintain character consistency\n";
    prompt += "- Keep responses concise but meaningful\n\n";
    prompt += "Response:";
    
    let response = await this.llm.generateText(prompt);
    
    // Add emotive action
    response = this.addEmotiveAction(response);
    
    // Update conversation state
    this.lastResponse = response;
    this.context.push(`${this.name}: ${response}`);
    this.conversationCount++;
    
    // Decay emotional state over time
    if (this.conversationCount % 3 === 0) {
      this.emotionalState *= 0.8;
    }
    
    return response;
  }
  
  private addEmotiveAction(response: string): string {
    let emotionType: EmotionState = 'neutral';
    
    if (this.emotionalState > 0.3) {
      emotionType = 'positive';
    } else if (this.emotionalState < -0.3) {
      emotionType = 'empathetic';
    }
    
    const actions = this.emotiveActions[emotionType];
    return `${actions[Math.floor(Math.random() * actions.length)]} ${response}`;
  }
}

type EmotionState = 'positive' | 'neutral' | 'empathetic';