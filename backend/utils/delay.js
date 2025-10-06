/**
 * Utilidad para agregar delays y evitar bloqueos
 */

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Delay aleatorio entre min y max milisegundos
 */
export const randomDelay = (min = 1000, max = 3000) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
};
