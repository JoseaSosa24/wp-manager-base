/**
 * Formatea mensajes para WhatsApp
 */

export const formatMessage = (text, options = {}) => {
  let formatted = text;

  if (options.bold) {
    formatted = `*${formatted}*`;
  }

  if (options.italic) {
    formatted = `_${formatted}_`;
  }

  if (options.monospace) {
    formatted = `\`\`\`${formatted}\`\`\``;
  }

  return formatted;
};

/**
 * Sanitiza números de teléfono para WhatsApp
 */
export const sanitizePhone = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Genera mención de todos los miembros del grupo
 */
export const mentionAll = (participants) => {
  const mentions = participants.map(p => `@${p.id.user}`).join(' ');
  return {
    text: mentions,
    mentions: participants.map(p => p.id._serialized)
  };
};
