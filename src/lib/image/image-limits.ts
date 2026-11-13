/*
 * Limites de entrada, iguais para todas as ferramentas.
 * A área segue o teto do canvas no Safari do iOS (o mais restrito): um limite
 * único evita "funciona no computador e falha no iPhone".
 */

/** Tamanho máximo do arquivo: 20 MB. */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Área máxima em pixels (equivale a 4096 × 4096). */
export const MAX_PIXELS = 4096 * 4096;

/** Maior lado aceito, em pixels. */
export const MAX_SIDE = 16_384;
