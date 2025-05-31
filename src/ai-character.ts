import { pipeline } from '@xenova/transformers';

export class AICharacter {
  private context: string[] = [];
  private maxMemory: number = 10;
  private lastResponse: string = '';
  private lastTopic: string = '';

  constructor(
    private name: string,
    private personality: string,
    private knowledge: string[] = []
  ) {
    this.context = [...knowledge];
  }

  async generateResponse(input: string): Promise<string> {
    const inputLower = input.toLowerCase();
    
    // Track conversation topics
    const topics = this.identifyTopics(inputLower);
    
    // Personal questions with more variety
    if (inputLower.includes('college') || inputLower.includes('school') || inputLower.includes('study')) {
      return this.getRandomResponse([
        "I studied with the ancient ones, in places between places. My education comes from watching the threads of time weave their patterns.",
        "Knowledge flows like water - I drink from many streams. The forest itself is my teacher, as are the whispers of those who came before.",
        "My learning comes not from institutions, but from the eternal dance of light and shadow, past and future."
      ]);
    }

    if (inputLower.includes('knowledge') || inputLower.includes('how did you') || inputLower.includes('how do you know')) {
      return this.getRandomResponse([
        "My knowledge comes from watching the threads of time interweave. I see patterns others might miss.",
        "The forest speaks to those who listen, and I have listened for a very long time.",
        "Some truths reveal themselves only to those who stand at the edge of what is known. That is where I dwell."
      ]);
    }

    // Location-specific responses with more detail
    if (topics.includes('tavern')) {
      return this.getRandomResponse([
        "The tavern's foundations rest upon ancient stones, each one holding memories of what lies beneath.",
        "Grim tends his tavern well, though even he doesn't fully understand what he guards. The cellar holds more than just wine and memories.",
        "Listen carefully in the tavern - sometimes the walls themselves whisper secrets about what lies below."
      ]);
    }

    // More varied default responses
    const defaultResponses = [
      "The questions you ask reveal as much as the answers you seek. What truth do you really hunt for?",
      "Sometimes the path forward requires us to look in unexpected directions. What do your instincts tell you?",
      "I sense you seek more than just the medallion. What other mysteries call to you?",
      "The forest edge is where certainty meets mystery. Which side do you stand on?",
      "Your arrival here was no accident. The patterns have been leading to this moment."
    ];
    
    return this.getRandomResponse(defaultResponses);
  }

  private identifyTopics(input: string): string[] {
    const topics = [];
    const keywords = {
      medallion: ['medallion', 'artifact', 'treasure'],
      forest: ['forest', 'woods', 'trees'],
      tavern: ['tavern', 'inn', 'cellar', 'basement'],
      key: ['key', 'unlock', 'locked'],
      knowledge: ['know', 'learn', 'understand', 'wisdom']
    };

    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => input.includes(word))) {
        topics.push(topic);
      }
    }

    return topics;
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