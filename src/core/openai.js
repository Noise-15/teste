import OpenAI from 'openai';

export class OpenAIHandler {
  constructor(apiKey, prompt) {
    this.openai = new OpenAI({ apiKey });
    this.prompt = prompt;
    this.sessions = new Map();
  }

  async generateResponse(chatId, message) {
    if (!this.sessions.has(chatId)) {
      this.sessions.set(chatId, []);
    }

    const messages = [
      { role: 'system', content: this.prompt },
      ...this.sessions.get(chatId),
      { role: 'user', content: message }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    this.sessions.get(chatId).push(
      { role: 'user', content: message },
      { role: 'assistant', content: response.choices[0].message.content }
    );

    return response.choices[0].message.content;
  }
}