import { pipeline } from '@xenova/transformers';
import nlp from 'compromise';
import Sentiment from 'sentiment';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private sentiment = new Sentiment();
  private lastResponse: string = '';
  private emotionalState: number = 0; // -1 to 1
  private conversationTopics: Set<string> = new Set();
  private emotiveActions = [
    '*smiles warmly*',
    '*gazes thoughtfully*',
    '*listens intently*',
    '*nods understandingly*',
    '*leans forward with interest*'
  ];

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
  }

  async generateResponse(input: string): Promise<string> {
    // Check for exit commands first
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'bye' || input.toLowerCase() === 'goodbye') {
      return "Farewell, until we meet again.";
    }

    // Analyze input
    const topics = this.extractTopics(input);
    const sentiment = this.analyzeSentiment(input);
    const doc = nlp(input);
    
    // Update emotional state
    this.emotionalState = (this.emotionalState + sentiment.comparative) / 2;
    
    // Track conversation context
    this.context.push(`User: ${input}`);
    topics.forEach(t => this.conversationTopics.add(t));

    // Generate response based on analysis
    let response = '';

    // Handle emotional states
    if (sentiment.score < -1) {
      response = this.generateEmpatheticResponse(input, sentiment);
    } else if (doc.questions().length > 0) {
      response = this.generateQuestionResponse(input, doc);
    } else if (topics.some(t => this.knowledge.some(k => k.toLowerCase().includes(t)))) {
      response = this.generateKnowledgeResponse(topics);
    } else {
      response = this.generateContextualResponse(input, topics);
    }

    // Add emotive action based on emotional state
    const action = this.getEmotiveAction();
    response = `${action} ${response}`;

    // Update context
    this.updateContext(response);
    
    return response;
  }

  private extractTopics(input: string): string[] {
    const doc = nlp(input);
    return doc.nouns().out('array')
      .concat(doc.verbs().out('array'))
      .filter(word => word.length > 3)
      .map(w => w.toLowerCase());
  }

  private analyzeSentiment(input: string): Sentiment.AnalysisResult {
    return this.sentiment.analyze(input);
  }

  private generateEmpatheticResponse(input: string, sentiment: Sentiment.AnalysisResult): string {
    if (input.toLowerCase().includes('sad')) {
      return "I hear the sadness in your words. Would you like to talk about what's troubling you?";
    }
    if (input.toLowerCase().includes('angry') || sentiment.score < -2) {
      return "I sense your frustration. Sometimes sharing our thoughts can help us see things differently. What's on your mind?";
    }
    return "I feel there's something deeper in your words. Would you like to explore that together?";
  }

  private generateQuestionResponse(input: string, doc: any): string {
    const questionWords = doc.match('(what|why|how|where|when|who)').out('array');
    if (questionWords.includes('why')) {
      return "That's a thoughtful question. Let's explore it together - what are your thoughts on this?";
    }
    if (questionWords.includes('how')) {
      return "An interesting question indeed. In my experience, the 'how' often reveals itself when we examine the 'why'. What draws you to ask this?";
    }
    return "Your curiosity speaks to something deeper. What inspired this question?";
  }

  private generateKnowledgeResponse(topics: string[]): string {
    const relevantKnowledge = this.knowledge.filter(k => 
      topics.some(t => k.toLowerCase().includes(t))
    );
    if (relevantKnowledge.length > 0) {
      const knowledge = relevantKnowledge[Math.floor(Math.random() * relevantKnowledge.length)];
      return `${knowledge}. What are your thoughts on this?`;
    }
    return this.generateContextualResponse('', topics);
  }

  private generateContextualResponse(input: string, topics: string[]): string {
    const responses = [
      "I sense there's more to your story. What brought you to this point?",
      "Your perspective intrigues me. How did you come to see things this way?",
      "There's wisdom in your words. Would you share more of your thoughts?",
      "I find your view fascinating. What experiences shaped this understanding?",
      "Your journey seems to hold many stories. Which would you like to share?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getEmotiveAction(): string {
    if (this.emotionalState < -0.5) {
      return '*listening with deep empathy*';
    }
    if (this.emotionalState > 0.5) {
      return '*smiling warmly*';
    }
    return this.emotiveActions[Math.floor(Math.random() * this.emotiveActions.length)];
  }

  private updateContext(response: string) {
    this.context.push(`${this.name}: ${response}`);
    if (this.context.length > this.maxMemory) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory)];
    }
    this.lastResponse = response;
  }
}