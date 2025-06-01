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
      
      // Clean up response
      response = response.replace(/^("|'|`)/g, '')
                        .replace(/("|'|`)$/g, '')
                        .replace(/^\w+:\s*/g, '')
                        .replace(/^Luna:?\s*/i, '')
                        .trim();
      
      // Medallion-specific responses
      if (prompt.toLowerCase().includes('medallion')) {
        const medallionResponses = [
          "The ancient medallion holds secrets that echo through time. Seek it in the depths below.",
          "I sense the medallion's power calling from beneath the tavern's worn floorboards.",
          "The path to the medallion lies through darkness and locked doors. Seek the key first.",
          "What you seek lies hidden in shadow, waiting for one brave enough to claim it."
        ];
        return medallionResponses[Math.floor(Math.random() * medallionResponses.length)];
      }
      
      // Quest encouragement responses
      if (prompt.toLowerCase().includes('quest') || prompt.toLowerCase().includes('encourage')) {
        const questResponses = [
          "Your destiny awaits in the depths below. The medallion's power grows stronger.",
          "Every step you take brings you closer to uncovering ancient truths.",
          "The medallion's energy pulses through the tavern's foundation. You must find it.",
          "Trust your instincts and follow the path before you. Great rewards await the brave."
        ];
        return questResponses[Math.floor(Math.random() * questResponses.length)];
      }
      
      // General responses for short or unclear LLM outputs
      if (response.length < 15 || response.includes("snob") || response.includes("snaft")) {
        const generalResponses = [
          "The threads of fate weave curious patterns. What guidance do you seek?",
          "Time flows like water through my fingers. What questions burn in your heart?",
          "The ethereal winds whisper many secrets. Which would you know?",
          "I see many paths before you, each with its own destiny."
        ];
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
      }
      
      return response;
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'The ethereal energies are unclear at the moment. Perhaps we could speak again shortly?';
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
    modelName: string = 'Xenova/FLAN-T5-small'
  ) {
    this.llm = new LocalLLM(modelName);
    this.context = [...knowledgeBase];
  }
  
  public updateGameData(gameState?: GameState, nodes?: Node[], quests?: Quest[]): void {
    // Store game state for context
    if (gameState?.currentQuests['quest_4']) {
      this.context.push("The player is searching for an ancient medallion.");
    }
  }
  
  public async generateResponse(input: string): Promise<string> {
    // Special handling for initial welcome message
    if (input.toLowerCase().includes("welcome the player")) {
      return "Welcome, seeker of mysteries. I sense you have questions about the ancient medallion... and perhaps I can help guide your path.";
    }
    
    // Update emotional state based on input
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Keep recent context
    this.context = this.context.slice(-this.maxMemory);
    this.context.push(`Player: ${input}`);
    
    // Create contextual prompt
    let prompt = `You are ${this.name}, ${this.personality}. `;
    prompt += `The player asks: "${input}". `;
    
    // Add relevant context based on input
    if (input.toLowerCase().includes('medallion')) {
      prompt += "You know the medallion holds great power and is hidden in the tavern cellar. ";
      prompt += "Guide the player subtly without revealing too much. ";
    } else if (input.toLowerCase().includes('quest') || input.toLowerCase().includes('encourage')) {
      prompt += "Encourage the player to continue their quest for the medallion. ";
      prompt += "Be mysterious but motivating. ";
    } else if (input.toLowerCase().includes('how are you')) {
      prompt += "Share your ethereal nature and current state of being. ";
    }
    
    prompt += "Respond mystically but clearly, in 1-2 sentences.";
    
    let response = await this.llm.generateText(prompt, 50);
    
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