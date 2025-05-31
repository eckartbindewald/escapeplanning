import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private personalityTraits: string[];
  private playerInterests: Set<string> = new Set();

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
    this.personalityTraits = personality.split('.').map(t => t.trim()).filter(t => t);
  }

  async generateResponse(input: string): Promise<string> {
    const inputLower = input.toLowerCase();
    
    // Track player interests from their input
    this.updatePlayerInterests(inputLower);
    
    // Personal questions - show more personality and interest in the player
    if (inputLower.includes('birthday') || inputLower.includes('age') || inputLower.includes('old')) {
      return this.getRandomResponse([
        "Ah, curious about me? *smiles warmly* Time flows differently in my experience. Tell me, how do you measure your own journey through time?",
        "An interesting question! *eyes twinkling* I've seen many seasons change, but I'm more curious about your story. What brings someone like you to our village?",
        "Time is such a fascinating concept, isn't it? *leans forward* I find your curiosity refreshing. What made you ask about my age?"
      ]);
    }

    if (inputLower.includes('wearing') || inputLower.includes('clothes') || inputLower.includes('look like')) {
      return this.getRandomResponse([
        "*adjusts flowing robes thoughtfully* My appearance tends to reflect the observer's expectations. What do you see when you look at me?",
        "Your attention to detail is interesting! *smiles* These robes have stories woven into their fabric. Do you have a favorite piece of clothing with a story?",
        "*gestures to shimmering garments* The mists of dawn and twilight dress me. But I'm more interested in your story - what brought you to our forest's edge?"
      ]);
    }

    if (inputLower.includes('live') || inputLower.includes('home') || inputLower.includes('from')) {
      return this.getRandomResponse([
        "*gestures to the surroundings* I walk between worlds, but I've grown quite fond of this place. Where do you call home?",
        "Home is wherever wisdom seeks expression. *smiles warmly* But enough about me - what lands have you traveled to reach our village?",
        "*eyes sparkling with interest* I dwell where questions meet answers. Tell me about your homeland - I love hearing travelers' tales."
      ]);
    }

    // Casual conversation - show genuine interest
    if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      return this.getRandomResponse([
        "*smiles warmly* Welcome, seeker! There's something about you that catches my attention. What draws you to this place?",
        "Ah, a new face! *eyes twinkling with interest* The winds whispered of your coming. Tell me, what adventures bring you here?",
        "*looking up from a mysterious tome* Well met! I've been hoping for some interesting conversation today. What's on your mind?"
      ]);
    }

    if (inputLower.includes('how are you')) {
      return this.getRandomResponse([
        "*pleased by your courtesy* I'm well, thank you for asking! The forest's energy is particularly vibrant today. How are you finding our little village?",
        "*smiling genuinely* Kind of you to ask! I'm enjoying this chance to chat. How has your journey been so far?",
        "What a thoughtful question! *warm smile* I'm quite well. But I'm more interested in how you're faring - adventuring can be tiring work."
      ]);
    }

    // Off-topic responses - redirect with interest
    if (this.isOffTopic(inputLower)) {
      return this.getRandomResponse([
        "*listening intently* An interesting perspective! Though perhaps we should discuss the medallion's mystery - I sense it's relevant to your journey.",
        "*thoughtfully* While that's intriguing, I notice you haven't asked about the ancient power beneath the tavern. Shall we explore that mystery?",
        "*eyes twinkling with knowing* Your mind wanders interesting paths! But tell me - have you heard about the secrets hidden in the tavern's cellar?"
      ]);
    }

    // Quest-related but conversational
    if (inputLower.includes('medallion') || inputLower.includes('artifact')) {
      return this.getRandomResponse([
        "*eyes lighting up* Ah, you sense it too! The medallion's power calls to certain souls. What do you feel when you think about it?",
        "*leaning forward with interest* The medallion has drawn many seekers, but few ask the right questions. What would you ask of it?",
        "*studying you carefully* You have the look of someone who might understand the medallion's true purpose. What do you know of ancient powers?"
      ]);
    }

    // Default responses with personality
    return this.getRandomResponse([
      "*tilting head thoughtfully* Your questions intrigue me. What deeper mysteries are you really seeking?",
      "*smiling mysteriously* Sometimes the best answers come from unexpected directions. What does your heart tell you?",
      "*eyes showing genuine interest* There's more to your question than meets the eye. Shall we explore it together?",
      "*leaning forward attentively* Your words carry echoes of deeper meanings. What brought this question to mind?",
      "*watching you with friendly curiosity* Even simple questions can hide profound truths. What made you think to ask that?"
    ]);
  }

  private isOffTopic(input: string): boolean {
    const offtopicKeywords = ['vape', 'smoking', 'pizza', 'movie', 'internet', 'phone', 'computer'];
    return offtopicKeywords.some(keyword => input.includes(keyword));
  }

  private updatePlayerInterests(input: string) {
    const interestKeywords = ['magic', 'forest', 'mystery', 'power', 'history', 'adventure', 'quest'];
    interestKeywords.forEach(keyword => {
      if (input.includes(keyword)) {
        this.playerInterests.add(keyword);
      }
    });
  }

  private getRandomResponse(responses: string[]): string {
    // Avoid repeating the last response
    const filteredResponses = responses.filter(r => r !== this.lastResponse);
    const response = filteredResponses[Math.floor(Math.random() * filteredResponses.length)] || responses[0];
    
    this.lastResponse = response;
    this.updateMemory(response);
    return response;
  }

  private updateMemory(response: string) {
    this.context.push(`${this.name}: ${response}`);
    if (this.context.length > this.maxMemory) {
      this.context = [...this.knowledge, ...this.context.slice(-this.maxMemory)];
    }
  }
}