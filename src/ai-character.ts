import { GameState, Node, Quest } from './types';
import Sentiment from 'sentiment';

// LLM interface for local AI models
interface LLMInterface {
  generateText(prompt: string, maxTokens?: number): Promise<string>;
}

// Local LLM implementation - to be replaced with actual implementation
class LocalLLM implements LLMInterface {
  private modelName: string;
  
  constructor(modelName: string = 'tinyllama') {
    this.modelName = modelName;
  }
  
  async generateText(prompt: string, maxTokens: number = 100): Promise<string> {
    // TODO: Implement actual connection to local LLM
    // This is just a placeholder for now
    console.log(`Generating text with ${this.modelName} model using prompt: ${prompt}`);
    // In a real implementation, this would call the local LLM API
    return `Response from ${this.modelName} (placeholder)`;
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
   * @param modelName Name of the LLM to use (default: tinyllama)
   */
  constructor(
    public name: string,
    private personality: string,
    private knowledgeBase: string[] = [],
    modelName: string = 'tinyllama'
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
    // Analyze input using NLP techniques
    const topics = this.extractTopics(input);
    const sentiment = this.analyzeSentiment(input);
    
    // Update emotional state based on sentiment analysis
    this.emotionalState = (this.emotionalState + sentiment.comparative) / 2;
    
    // Track topics for context
    if (topics.length > 0) {
      // Update recent topics list
      this.recentTopics = [topics[0], ...this.recentTopics.slice(0, this.maxTopics - 1)];
      this.lastTopic = topics[0];
    }
    
    // Generate appropriate response
    let response = '';
    
    // Handle questions with priority
    if (input.includes('?')) {
      const questionResponse = await this.handleQuestion(input, topics);
      if (questionResponse) {
        response = questionResponse;
      }
    } else if (this.hasRelevantGameKnowledge(topics)) {
      response = this.generateGameKnowledgeResponse(topics);
    } else if (sentiment.score < -1) {
      response = this.generateEmpathicResponse(input, topics);
    } else if (topics.some(t => this.knowledgeBase.some((k: string) => k.toLowerCase().includes(t)))) {
      response = this.generateKnowledgeResponse(topics);
    } else {
      response = this.generateContextualResponse(input, topics);
    }
    
    // Add emotive action based on emotional state (30% chance)
    if (Math.random() < 0.3) {
      const action = this.getEmotiveAction();
      response = `${action} ${response}`;
    }
    
    // Store this as the last response to avoid repetition
    this.lastResponse = response;
    
    // Update conversation context with input and response
    this.updateContext(input, response);
    
    return response;
  }

  private extractTopics(input: string): string[] {
    // Simple word extraction for topics
    return input.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2);
  }

  /**
   * Determines if the AI has relevant game knowledge related to the conversation topics
   */
  private hasRelevantGameKnowledge(topics: string[]): boolean {
    // Exit early if no topics or game state
    if (!topics || topics.length === 0 || !this.gameState) {
      return false;
    }

    // Check for location references
    if (this.gameState.currentLocation && topics.some(t => 
      this.gameState.currentLocation.toLowerCase().includes(t)
    )) {
      return true;
    }
    
    // Check for character references - use optional chaining to handle possible undefined
    if (this.gameNodes) {
      const hasCharacterReference = this.gameNodes.some(n => 
        n.type === 'character' && (
          (n.name && topics.some(t => n.name.toLowerCase().includes(t))) || 
          (n.description && topics.some(t => n.description.toLowerCase().includes(t)))
        )
      );
      if (hasCharacterReference) {
        return true;
      }
    }
    
    // Check for quest references - use optional chaining to handle possible undefined
    if (this.gameQuests) {
      const hasQuestReference = this.gameQuests.some(q => 
        (q.title && topics.some(t => q.title.toLowerCase().includes(t))) || 
        (q.description && topics.some(t => q.description.toLowerCase().includes(t)))
      );
      if (hasQuestReference) {
        return true;
      }
    }
    
    return false;
  }

  private generateGameKnowledgeResponse(topics: string[]): string {
    // Return empty string if no game data is available
    if (!this.gameState) {
      return '';
    }
    
    // Location information
    if (this.gameState.currentLocation && topics.some(t => 
      this.gameState.currentLocation.toLowerCase().includes(t)
    )) {
      return `We are currently in ${this.gameState.currentLocation}. What draws you to this place?`;
    }
    
    // Character information
    const characterData = this.gameNodes?.find(n => 
      n.type === 'character' && n.name && topics.some(t => n.name.toLowerCase().includes(t))
    );
    if (characterData && characterData.name) {
      return `${characterData.name}... ${characterData.description || ''} Have you spoken with them lately?`;
    }
    
    // Quest information
    const questData = this.gameQuests?.find(q => 
      q.title && topics.some(t => q.title.toLowerCase().includes(t))
    );
    if (questData && questData.title) {
      return `The quest for ${questData.title}... ${questData.description || ''} What progress have you made?`;
    }
    
    // Item information
    const playerInventory = this.gameState?.inventory && this.gameNodes ? 
      this.gameState.inventory.map(id => 
        this.gameNodes.find(n => n.id === id)
      ).filter(Boolean) : [];
    
    const matchedItem = playerInventory.find(item => 
      item && topics.some(t => 
        (item.name?.toLowerCase().includes(t) || item.description?.toLowerCase().includes(t))
      )
    );
    
    if (matchedItem && matchedItem.name) {
      return `The ${matchedItem.name} you carry... ${matchedItem.description || ''} I sense it has significance to your journey.`;
    }
    
    return this.generateContextualResponse('', topics);
  }

  private analyzeSentiment(input: string): { score: number, comparative: number } {
    return this.sentiment.analyze(input);
  }

  private generateEmpathicResponse(input: string, topics: string[]): string {
    // More varied empathetic responses
    const responses = [
      `I sense this troubles you. Would you like to share more about what's on your mind?`,
      `Your feelings are completely valid. Would talking more about this help you?`,
      `I understand this may be difficult. What support would be most helpful right now?`,
      `Sometimes expressing these thoughts can help lighten the burden. I'm here to listen.`,
      `Thank you for sharing something so personal. Would you like to explore this further?`,
      `I hear the weight in your words. How long have you been feeling this way?`,
      `Your perspective matters greatly. Would you tell me more about what led to these feelings?`,
      `In moments like these, it's important to acknowledge your experiences. What else would you like to share?`,
      `I appreciate your honesty. These feelings are part of your journey - how are you managing them?`,
      `Your words carry deep meaning. Is there something specific you'd like to explore about this?`
    ];
    
    // Avoid repetition
    const filteredResponses = responses.filter(r => r !== this.lastResponse);
    if (filteredResponses.length === 0) return responses[0];
    
    return filteredResponses[Math.floor(Math.random() * filteredResponses.length)];
  }

  /**
   * Handles different types of questions based on question words
   */
  private async handleQuestion(input: string, topics: string[]): Promise<string | null> {
    // Simple question word detection
    const questionWords = ['what', 'why', 'how', 'where', 'when', 'who']
      .filter(word => input.toLowerCase().includes(word));
    
    // Location questions
    if (questionWords.includes('where') && this.gameState) {
      const currentLocation = this.gameNodes ? this.gameNodes.find(n => n.id === this.gameState?.currentLocation) : undefined;
      if (currentLocation && currentLocation.name) {
        return `We are currently in ${currentLocation.name}. ${currentLocation.description || ''} Is there something specific about this place that interests you?`;
      }
    }
    
    // Character-related questions
    if ((questionWords.includes('who') || questionWords.includes('what')) && 
        topics.some(t => t === 'you' || t === 'yourself')) {
      return `I am ${this.name}, ${this.personality}. I've been watching the events unfold in this world for quite some time. What else would you like to know about me?`;
    }
    
    // Questions about other characters
    const characterTopics = this.gameNodes ? topics.filter(t => 
      this.gameNodes.some(n => n.type === 'character' && n.name?.toLowerCase().includes(t))
    ) : [];
    
    if (characterTopics.length > 0 && this.gameNodes) {
      const characterData = this.gameNodes?.find(n => 
        n.type === 'character' && n.name && topics.some(t => n.name.toLowerCase().includes(t))
      );
      
      if (characterData && characterData.name) {
        return `You ask about ${characterData.name}. ${characterData.description || ''} Our paths have crossed before. What specifically do you want to know?`;
      }
    }
    
    // Questions about quests
    if ((questionWords.includes('what') || questionWords.includes('how')) && 
        topics.some(t => t === 'quest' || t === 'mission' || t === 'task')) {
      if (this.gameQuests && this.gameQuests.length > 0) {
        const activeQuests = this.gameState?.currentQuests ? Object.values(this.gameState.currentQuests) : [];
        if (activeQuests.length > 0) {
          const quest = activeQuests[0];
          return `You're currently pursuing ${quest.title || 'a quest'}. ${quest.description || ''} How are you progressing with this task?`;
        } else {
          return `I sense there are tasks waiting to be discovered. Have you spoken with the villagers? They often need assistance.`;
        }
      }
    }
    
    // Original responses for why and how questions as fallback
    if (questionWords.includes('why')) {
      return "That's a thoughtful question. Let's explore it together - what are your thoughts on this?";
    }
    if (questionWords.includes('how')) {
      return "An interesting question indeed. In my experience, the 'how' often reveals itself when we examine the 'why'. What draws you to ask this?";
    }
    return "Your curiosity speaks to something deeper. What inspired this question?";
  }

  private generateKnowledgeResponse(topics: string[]): string {
    // Find knowledge related to topics
    const relevantKnowledge = this.knowledgeBase.filter((k: string) => 
      topics.some(t => k.toLowerCase().includes(t))
    );
    
    if (relevantKnowledge.length === 0) {
      return '';
    }
    
    // Select a random piece of knowledge
    const knowledge = relevantKnowledge[Math.floor(Math.random() * relevantKnowledge.length)];
    
    // Format the response with the knowledge
    const templates = [
      `I believe that ${knowledge.toLowerCase()}. What do you think about that?`,
      `I once learned that ${knowledge.toLowerCase()}. Does that resonate with you?`,
      `In my understanding, ${knowledge.toLowerCase()}. How does that align with your perspective?`,
      `I've contemplated that ${knowledge.toLowerCase()}. Have you considered this?`,
      `My experiences suggest that ${knowledge.toLowerCase()}. Does this match your experience?`,
      `I've observed that ${knowledge.toLowerCase()}. How does this align with your journey?`,
      `The wise ones taught me that ${knowledge.toLowerCase()}. Do you find wisdom in these words?`,
      `I've come to understand that ${knowledge.toLowerCase()}. What has your experience shown you?`
    ];
    
    // Avoid returning the same response twice
    const filteredTemplates = templates.filter(t => t !== this.lastResponse);
    return filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)];
  }

  private getAlternativeResponses(topics: string[]): string[] | null {
    // Check if we have specific responses for any topic
    for (const topic of topics) {
      if (this.characterResponses[topic]) {
        return this.characterResponses[topic];
      }
    }
    
    // Return null if no matching topic responses found
    return null;
  }

  private generateContextualResponse(input: string, topics: string[]): string {
    // Try to use character-specific responses first
    const alternativeResponses = this.getAlternativeResponses(topics);
    if (alternativeResponses && alternativeResponses.length > 0) {
      return alternativeResponses[Math.floor(Math.random() * alternativeResponses.length)];
    }
    
    // Check conversation history for context
    const recentContext = this.context.slice(-10);
    const userMessages = recentContext.filter(msg => msg.startsWith('User:'));
    
    if (userMessages.length > 1) {
      // Generate responses that reference previous messages
      const responses = [
        `You mentioned earlier about ${this.lastTopic || 'your journey'}. How does that connect with what we're discussing now?`,
        `I'm curious how this relates to what you shared before. Would you like to elaborate?`,
        `This conversation reminds me of our earlier discussion. How do you see these topics connecting?`,
        `As we explore this topic, I wonder how it affects your current quest?`,
        `Your thoughts seem to be evolving as we talk. Where do you see this path leading you?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default contextual responses if no conversation history
    const responses = [
      "I sense there's more to your story. What events have led you to this point?",
      "Your perspective intrigues me. How did you come to view things this way?",
      "There's wisdom in your words. Would you share more about your experiences?",
      "I find myself drawn to your journey. What challenges have you faced along the way?",
      "Your path seems to hold many untold stories. Which would you care to share?",
      "The threads of fate weave curiously around you. What do you seek on this journey?",
      "There are patterns in our conversation that reveal much about your quest. Where do you hope it leads?",
      "I'm curious about what drives you forward. What motivates you to continue?",
      "Behind your words, I sense deeper meanings. What truly matters to you in this world?",
      "The choices we make shape our destiny. What choice weighs on your mind currently?"
    ];
    
    // Avoid returning the same response twice
    let filteredResponses = responses.filter(r => r !== this.lastResponse);
    if (filteredResponses.length === 0) filteredResponses = responses;
    
    return filteredResponses[Math.floor(Math.random() * filteredResponses.length)];
  }

  private getEmotiveAction(): string {
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
    return actions[Math.floor(Math.random() * actions.length)];
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