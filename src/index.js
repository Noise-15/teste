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

    // Lista de números para notificação
    this.notificationNumbers = process.env.NOTIFICATION_NUMBERS.split(',').map(num => num.trim() + '@s.whatsapp.net');
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

        // Verifica se o pedido foi concluído
        if (response.includes('Pedido confirmado')) {
          await this.notifyTeam(chatId, response);
        }
      } catch (error) {
        console.error('Erro:', error);
        await this.whatsapp.sendMessage(chatId, '❌ Ocorreu um erro, tente novamente.');
      }
    });
  }

  async notifyTeam(chatId, orderDetails) {
    const notificationMessage = `🔔 NOVO PEDIDO RECEBIDO!\n\nCliente: ${chatId}\nDetalhes:\n${orderDetails}`;

    for (const number of this.notificationNumbers) {
      try {
        await this.whatsapp.sendMessage(number, notificationMessage);
        console.log(`Notificação enviada para: ${number}`);
      } catch (error) {
        console.error(`Falha ao enviar notificação para: ${number}`, error);
      }
    }
  }
}

new ZapGPT().start();
