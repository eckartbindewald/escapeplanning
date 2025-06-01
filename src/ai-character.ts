import { GameState, Node, Quest } from './types';
import Sentiment from 'sentiment';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use WASM
env.useBrowserCache = false;
env.allowLocalModels = false;

// Singleton LLM instance
let globalGenerator: any = null;
let initializationPromise: Promise<void> | null = null;

// LLM interface for local AI models
interface LLMInterface {
  generateText(prompt: string, maxTokens?: number): Promise<string>;
}

// Local LLM implementation using transformers.js
class LocalLLM implements LLMInterface {
  private modelName: string;
  
  constructor(modelName: string = 'Xenova/LaMini-Flan-T5-783M') {
    this.modelName = modelName;
  }
  
  private async ensureInitialized() {
    if (!initializationPromise) {
      initializationPromise = (async () => {
        if (!globalGenerator) {
          console.log('Initializing LLM...');
          globalGenerator = await pipeline('text2text-generation', this.modelName);
          console.log('LLM initialized successfully');
        }
      })();
    }
    await initializationPromise;
  }
  
  async generateText(prompt: string, maxTokens: number = 100): Promise<string> {
    try {
      await this.ensureInitialized();
      
      const result = await globalGenerator(prompt, {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        do_sample: true,
        top_k: 40,
        top_p: 0.95,
        repetition_penalty: 1.2
      });
      
      let response = result[0].generated_text.trim();
      
      // Clean up response
      response = response
        .replace(/^["'`]|["'`]$/g, '')
        .replace(/^Luna:?\s*/i, '')
        .replace(/^I am Luna,?\s*/i, '')
        .replace(/^As Luna,?\s*/i, '')
        .trim();
      
      // Filter out low-quality responses
      if (response.length < 10 || 
          response.includes("you are Luna") ||
          response.includes("can provide") ||
          response.includes("I am a") ||
          response.toLowerCase().includes("snafus") ||
          response.toLowerCase().includes("subtle hints")) {
        return "The ancient powers stir, but their meaning remains unclear. Ask again, seeker of truth.";
      }
      
      return response;
      
    } catch (error) {
      console.error('LLM generation error:', error);
      return 'The threads of fate are momentarily tangled. Perhaps rephrase your question?';
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
  private questProgress: string = 'start';
  
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
      const quest = gameState.currentQuests['quest_4'];
      if (quest.status === 'not_started') {
        this.questProgress = 'start';
      } else if (gameState.inventory.includes('item_3')) {
        this.questProgress = 'has_key';
      } else if (gameState.inventory.includes('item_4')) {
        this.questProgress = 'has_medallion';
      }
    }
  }
  
  public async generateResponse(input: string): Promise<string> {
    const sentimentResult = this.sentiment.analyze(input);
    this.emotionalState = (this.emotionalState + sentimentResult.comparative) / 2;
    
    // Keep recent context
    this.context = this.context.slice(-this.maxMemory);
    this.context.push(`Player: ${input}`);
    
    // Analyze input for topics
    const topics = {
      medallion: input.toLowerCase().includes('medallion'),
      quest: input.toLowerCase().includes('quest') || input.toLowerCase().includes('help'),
      personal: input.toLowerCase().includes('you') || input.toLowerCase().includes('how are'),
      key: input.toLowerCase().includes('key'),
      forest: input.toLowerCase().includes('forest'),
      tavern: input.toLowerCase().includes('tavern')
    };
    
    // Create contextual prompt
    let prompt = `You are Luna, a mysterious ethereal being. Respond to: "${input}"\n\n`;
    
    if (topics.medallion || topics.quest) {
      prompt += `Quest state: ${this.questProgress}\n`;
      prompt += "Key quest knowledge:\n";
      prompt += "- The medallion is hidden in the tavern's cellar\n";
      prompt += "- A key can be found at the forest edge\n";
      prompt += "- The medallion holds ancient power\n";
    }
    
    if (topics.personal) {
      prompt += "Personal traits:\n";
      prompt += "- Mysterious yet warm and helpful\n";
      prompt += "- Deeply interested in others\n";
      prompt += "- Speaks in clear but mystical terms\n";
    }
    
    prompt += "\nRequirements:\n";
    prompt += "- Give clear but mystical guidance\n";
    prompt += "- Be genuinely interested in the player\n";
    prompt += "- Keep responses concise and meaningful\n";
    prompt += "- Never break character\n";
    
    let response = await this.llm.generateText(prompt);
    response = this.addEmotiveAction(response);
    
    this.lastResponse = response;
    this.context.push(`${this.name}: ${response}`);
    this.conversationCount++;
    
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