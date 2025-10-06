/**
 * Modelo de Estadísticas (sin DB por ahora, estructura preparada)
 */

export class Stats {
  constructor() {
    this.messagesSent = 0;
    this.messagesFailed = 0;
    this.activeGroups = 0;
    this.activeChannels = 0;
    this.totalChats = 0;
    this.lastUpdate = new Date();
  }

  incrementMessagesSent() {
    this.messagesSent++;
    this.lastUpdate = new Date();
  }

  incrementMessagesFailed() {
    this.messagesFailed++;
    this.lastUpdate = new Date();
  }

  updateGroups(count) {
    this.activeGroups = count;
    this.lastUpdate = new Date();
  }

  updateChannels(count) {
    this.activeChannels = count;
    this.lastUpdate = new Date();
  }

  toJSON() {
    return {
      messagesSent: this.messagesSent,
      messagesFailed: this.messagesFailed,
      activeGroups: this.activeGroups,
      activeChannels: this.activeChannels,
      totalChats: this.totalChats,
      lastUpdate: this.lastUpdate,
      successRate: this.messagesSent + this.messagesFailed > 0
        ? ((this.messagesSent / (this.messagesSent + this.messagesFailed)) * 100).toFixed(2)
        : 0
    };
  }
}
