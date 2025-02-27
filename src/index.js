import 'dotenv/config';
import { WhatsAppClient } from './core/whatsappClient.js';
import { GeminiHandler } from './core/gemini.js';
import { OpenAIHandler } from './core/openai.js';

class ZapGPT {
  constructor() {
    this.whatsapp = new WhatsAppClient();
    this.ai = process.env.AI_SELECTED === 'GPT'
      ? new OpenAIHandler(process.env.OPENAI_KEY, process.env.PROMPT)
      : new GeminiHandler(process.env.GEMINI_KEY, process.env.PROMPT);
  }

  async start() {
    const sock = await this.whatsapp.initialize();
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
      const msg = messages[0];
      if (!msg.message || msg.key.fromMe) return;

      const chatId = msg.key.remoteJid;
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

      try {
        const response = await this.ai.generateResponse(chatId, text);
        await this.whatsapp.sendMessage(chatId, response);
      } catch (error) {
        console.error('Erro:', error);
        await this.whatsapp.sendMessage(chatId, '❌ Ocorreu um erro, tente novamente.');
      }
    });
  }
}

new ZapGPT().start();