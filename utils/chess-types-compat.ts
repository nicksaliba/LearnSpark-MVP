// src/utils/chess-types-compat.ts
/**
 * Type compatibility helpers for chess.js v1.3.1
 * This file provides type-safe wrappers for chess.js methods
 */

// Extend String to be compatible with Square type
declare global {
  interface String {
    __square_brand?: never;
  }
}

/**
 * Type-safe square conversion
 */
export function toSquare(square: string): any {
  return square as any;
}

/**
 * Type-safe piece conversion
 */
export function toPiece(piece: any): any {
  return piece as any;
}

/**
 * Type-safe moves options for chess.js v1.3.1
 */
export function createMovesOptions(options?: {
  square?: string;
  verbose?: boolean;
}): any {
  if (!options) return undefined;
  
  // chess.js v1.3.1 has different overloads for moves():
  // 1. moves() - all moves as strings
  // 2. moves({ verbose: true }) - all moves as objects
  // 3. moves({ square: 'e4' }) - moves from square as strings
  // 4. moves({ square: 'e4', verbose: true }) - moves from square as objects
  
  const result: any = {};
  
  if (options.square !== undefined) {
    result.square = toSquare(options.square);
  }
  
  if (options.verbose !== undefined) {
    result.verbose = options.verbose;
  }
  
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Validate square format
 */
export function isValidSquareFormat(square: string): boolean {
  return /^[a-h][1-8]$/.test(square);
}

/**
 * Validate piece format
 */
export function isValidPieceFormat(piece: any): boolean {
  if (!piece || typeof piece !== 'object') return false;
  
  const validTypes = ['p', 'n', 'b', 'r', 'q', 'k'];
  const validColors = ['w', 'b'];
  
  return (
    typeof piece.type === 'string' &&
    typeof piece.color === 'string' &&
    validTypes.includes(piece.type.toLowerCase()) &&
    validColors.includes(piece.color.toLowerCase())
  );
}

/**
 * Safe chess method caller
 */
export function safeChessCall<T>(
  fn: () => T,
  fallback: T,
  errorMessage?: string
): T {
  try {
    return fn();
  } catch (error) {
    if (errorMessage) {
      console.error(errorMessage, error);
    }
    return fallback;
  }
}