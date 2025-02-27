import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiHandler {
  constructor(apiKey, prompt) {
    this.genAI = new GoogleGenerativeAI(apiKey, {
      baseURL: 'https://generativelanguage.googleapis.com/v1beta'
    });
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Garante que o prompt seja interpretado como texto simples
    this.prompt = `Você é um assistente de vendas. Siga EXATAMENTE este script:1. Saudação inicial\n2. Pedir identificação\n3. Oferecer produtos (1-⚡5G R$10, 2-🍁 R$15, 3-🧀 R$20, 4-🍄 R$25)\n4. Definir zona de entrega (Oeste R$15, Norte R$30, Sul R$50)\n5. Coletar endereço\n6. Opções de pagamento (Pix, Dinheiro, Cartão+10%)\n7. Confirmar pedido"
${prompt}`;
    this.chatHistory = new Map();
  }

  async createChatSession(chatId) {
    if (!this.chatHistory.has(chatId)) {
      this.chatHistory.set(chatId, [
        // Prompt inicial como primeira mensagem do histórico
        { role: 'user', parts: [{ text: this.prompt }] }
      ]);
    }
    const session = this.chatHistory.get(chatId);

    // Limita o histórico para 20 mensagens (evita estouro)
    if (session.length > 20) session.shift();

    return session;
  }

  async generateResponse(chatId, message) {
    const session = await this.createChatSession(chatId);

    // Adiciona a nova mensagem do usuário ao histórico
    session.push({ role: 'user', parts: [{ text: message }] });

    try {
      // Envia TODO o histórico + nova mensagem para o modelo
      const result = await this.model.generateContent({
        contents: session // Histórico completo como array de mensagens
      });

      let text = result.response.text();

      // Validação da resposta para evitar caracteres inválidos
      if (!text || text.includes('$P$G') || text.trim() === '') {
        throw new Error('Resposta inválida recebida do modelo.');
      }

      // Adiciona a resposta do modelo ao histórico
      session.push({ role: 'model', parts: [{ text }] });

      return text;
    } catch (error) {
      console.error('Erro ao gerar resposta:', error.message);
      return 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
    }
  }
}