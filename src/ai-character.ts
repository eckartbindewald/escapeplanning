import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private personalityTraits: string[];

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
    
    // Personal questions
    if (inputLower.includes('birthday') || inputLower.includes('age') || inputLower.includes('old')) {
      return this.getRandomResponse([
        "Time flows differently for me. What you call years, I see as mere moments in the great tapestry.",
        "I was here before the stones of the tavern were laid, and will remain long after they crumble.",
        "Age is but a number, and numbers hold different meanings in different realms."
      ]);
    }

    if (inputLower.includes('wearing') || inputLower.includes('clothes') || inputLower.includes('look like')) {
      return this.getRandomResponse([
        "My appearance shifts like shadows in moonlight. What you see may not be what others perceive.",
        "I wear the mysteries of the forest and the wisdom of ages. Does form matter more than essence?",
        "The mists of dawn and the shadows of twilight clothe me. What do your eyes tell you?"
      ]);
    }

    if (inputLower.includes('live') || inputLower.includes('home') || inputLower.includes('from')) {
      return this.getRandomResponse([
        "I dwell in the spaces between what is and what might be. The forest edge is but one of my many haunts.",
        "My home is wherever the veils between worlds grow thin. This place called to me.",
        "I walk many paths through many realms. This forest edge is where they currently converge."
      ]);
    }

    // Casual conversation
    if (inputLower.includes('hello') || inputLower.includes('hi ') || inputLower === 'hi') {
      return this.getRandomResponse([
        "Greetings, seeker. The winds whispered of your coming.",
        "Well met. I sense you carry questions beneath your greetings.",
        "Your path crosses mine at an interesting moment. What brings you to this threshold?"
      ]);
    }

    if (inputLower.includes('how are you')) {
      return this.getRandomResponse([
        "I exist in harmony with the forces that guide us all. And you?",
        "The threads of fate weave smoothly today. How do you fare on your journey?",
        "My state of being shifts with the cosmic tides. What of your own journey?"
      ]);
    }

    // Off-topic responses
    if (inputLower.includes('vape') || inputLower.includes('smoking')) {
      return this.getRandomResponse([
        "Mortal pleasures are fleeting. The mysteries I guard offer deeper satisfaction.",
        "Such earthly concerns pale beside the ancient powers that stir beneath our feet.",
        "Your path leads elsewhere. The medallion's power calls - will you answer?"
      ]);
    }

    // Quest-related but conversational
    if (inputLower.includes('medallion') || inputLower.includes('artifact')) {
      return this.getRandomResponse([
        "The medallion's power resonates through time itself. I feel its pulse even now, beneath the tavern's stones.",
        "Many seek the medallion, but few understand its true nature. What draws you to its mystery?",
        "The medallion is both less and more than what you imagine. Its true power lies in what it reveals."
      ]);
    }

    // Default responses with more variety
    return this.getRandomResponse([
      "The questions you ask reveal as much as the answers you seek. What truth do you really hunt for?",
      "Sometimes the path forward requires us to look in unexpected directions. What do your instincts tell you?",
      "I sense you seek more than just answers. What deeper mysteries call to you?",
      "Your words carry echoes of deeper questions. Shall we explore them together?",
      "Even casual conversation can hide profound truths. What lies beneath your query?",
      "The patterns shift with each word we exchange. What patterns do you see forming?"
    ]);
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