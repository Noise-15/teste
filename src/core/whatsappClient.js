import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';

export class WhatsAppClient {
  constructor() {
    this.sock = null;
  }

  async initialize() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    this.sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      syncFullHistory: false
    });

    this.sock.ev.on('creds.update', saveCreds);
    return this.sock;
  }

  async sendMessage(chatId, text) {
    await this.sock.sendPresenceUpdate('composing', chatId);
    await this.sock.sendMessage(chatId, { text });
  }
}