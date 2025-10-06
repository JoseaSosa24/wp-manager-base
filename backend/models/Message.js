/**
 * Modelo de Mensaje (sin DB por ahora, estructura preparada)
 */

export class Message {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.chatId = data.chatId;
    this.content = data.content;
    this.timestamp = data.timestamp || new Date();
    this.status = data.status || 'pending'; // pending, sent, failed
    this.type = data.type || 'text'; // text, media, link
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      id: this.id,
      chatId: this.chatId,
      content: this.content,
      timestamp: this.timestamp,
      status: this.status,
      type: this.type,
      metadata: this.metadata
    };
  }
}
