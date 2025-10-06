/**
 * Modelo de Grupo (sin DB por ahora, estructura preparada)
 */

export class Group {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.participantsCount = data.participantsCount || 0;
    this.participants = data.participants || [];
    this.isActive = data.isActive || true;
    this.lastActivity = data.lastActivity || new Date();
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      participantsCount: this.participantsCount,
      participants: this.participants,
      isActive: this.isActive,
      lastActivity: this.lastActivity,
      metadata: this.metadata
    };
  }
}
