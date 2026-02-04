// backend/src/utils/br-date.ts

/**
 * Retorna data atual no fuso horário Brasil (GMT-3 fixo)
 */
export function nowBR(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasilOffset = -3; // GMT-3 fixo
  return new Date(utc + 3600000 * brasilOffset);
}

/**
 * Retorna dia da semana Brasil
 */
export function getDayBR(): number {
  return nowBR().getDay();
}

/**
 * Retorna hora Brasil
 */
export function getHourBR(): number {
  return nowBR().getHours();
}