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
      // Handle specific topics with predefined responses
      const lowerPrompt = prompt.toLowerCase();
      
      // Medallion-related queries
      if (lowerPrompt.includes('medallion')) {
        const responses = [
          "The medallion's power resonates beneath the tavern. Seek first the key that opens the way.",
          "Ancient whispers speak of a treasure in the tavern's depths. The forest edge may hold the first clue.",
          "The medallion calls to those who would seek it. Look for the key near where shadows and nature meet.",
          "I sense the medallion's presence growing stronger. The path begins at the forest's edge."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Quest guidance
      if (lowerPrompt.includes('quest') || lowerPrompt.includes('help') || lowerPrompt.includes('hint')) {
        const responses = [
          "The key you seek lies where nature meets civilization. Start your search at the forest's edge.",
          "Sometimes the simplest path forward begins at the edge of the woods.",
          "Grim's tavern holds secrets in its depths, but first you must find the means to enter.",
          "The forest edge holds the key to your quest, quite literally if you look carefully."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Personal questions
      if (lowerPrompt.includes('how are you') || lowerPrompt.includes('who are you')) {
        const responses = [
          "I am well, watching the threads of destiny weave their intricate patterns.",
          "I exist between what is and what could be, helping guide those who seek truth.",
          "My essence flows with the currents of time, observing and guiding when needed.",
          "I am as the wind - ever present, yet impossible to grasp fully."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      // General conversation
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
      
      // Fallback for short or unclear responses
      if (response.length < 15 || response.includes("snob") || response.includes("snaft")) {
        const fallbackResponses = [
          "The patterns of destiny take many forms. What guidance do you seek?",
          "There are many paths before you, each with its own purpose.",
          "Sometimes the questions we ask reveal more than their answers.",
          "Your journey intrigues me. What draws you forward?"
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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
    prompt += "Respond with mystical wisdom and genuine interest in helping. ";
    prompt += "Keep the response clear and focused on the player's question.";
    
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