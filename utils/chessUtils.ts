// src/utils/chessUtils.ts
import { ChessMove, ChessStudy, ChessChapter, Square } from '../types/chess';

/**
 * Converts a move index to algebraic notation display format
 */
export const formatMoveNumber = (index: number, color: 'w' | 'b'): string => {
  const moveNumber = Math.floor(index / 2) + 1;
  return color === 'w' ? `${moveNumber}.` : `${moveNumber}...`;
};

/**
 * Validates if a string is a valid FEN
 */
export const isValidFEN = (fen: string): boolean => {
  try {
    if (typeof fen !== 'string' || fen.trim().length === 0) {
      return false;
    }

    const parts = fen.trim().split(' ');
    if (parts.length !== 6) {
      return false;
    }
    
    // Basic validation of the board position
    const boardPart = parts[0];
    const ranks = boardPart.split('/');
    if (ranks.length !== 8) {
      return false;
    }
    
    // Validate each rank
    for (const rank of ranks) {
      let squares = 0;
      for (const char of rank) {
        if ('12345678'.includes(char)) {
          squares += parseInt(char, 10);
        } else if ('pnbrqkPNBRQK'.includes(char)) {
          squares += 1;
        } else {
          return false;
        }
      }
      if (squares !== 8) {
        return false;
      }
    }
    
    // Validate turn
    if (!['w', 'b'].includes(parts[1])) {
      return false;
    }
    
    // Validate castling availability (basic check)
    if (!/^[KQkq\-]*$/.test(parts[2])) {
      return false;
    }
    
    // Validate en passant square (basic check)
    if (!/^([a-h][36]|\-)$/.test(parts[3])) {
      return false;
    }
    
    // Validate halfmove and fullmove numbers
    const halfmove = parseInt(parts[4], 10);
    const fullmove = parseInt(parts[5], 10);
    
    if (isNaN(halfmove) || isNaN(fullmove) || halfmove < 0 || fullmove < 1) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('FEN validation error:', error);
    return false;
  }
};

/**
 * Validates if a square name is valid (e.g., 'e4', 'a1')
 */
export const isValidSquare = (square: string): boolean => {
  return /^[a-h][1-8]$/.test(square);
};

/**
 * Converts square name to coordinates
 */
export const squareToCoords = (square: Square): { x: number; y: number } => {
  if (!isValidSquare(square)) {
    throw new Error(`Invalid square: ${square}`);
  }
  
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1], 10) - 1;
  
  return { x: file, y: rank };
};

/**
 * Converts coordinates to square name
 */
export const coordsToSquare = (x: number, y: number): Square => {
  if (x < 0 || x > 7 || y < 0 || y > 7) {
    throw new Error(`Invalid coordinates: ${x}, ${y}`);
  }
  
  const file = String.fromCharCode('a'.charCodeAt(0) + x);
  const rank = (y + 1).toString();
  
  return `${file}${rank}` as Square;
};

/**
 * Gets the color of a square
 */
export const getSquareColor = (square: Square): 'light' | 'dark' => {
  const { x, y } = squareToCoords(square);
  return (x + y) % 2 === 0 ? 'dark' : 'light';
};

/**
 * Parses PGN move text to extract moves
 */
export const parsePGNMoves = (pgn: string): string[] => {
  // Remove comments, variations, and annotations
  const cleanPgn = pgn
    .replace(/\{[^}]*\}/g, '') // Remove comments in braces
    .replace(/\([^)]*\)/g, '') // Remove variations in parentheses
    .replace(/\$\d+/g, '') // Remove numeric annotation glyphs
    .replace(/[!?]+/g, '') // Remove traditional annotations
    .replace(/\d+\./g, '') // Remove move numbers
    .trim();
  
  // Split into individual moves and filter out empty strings
  return cleanPgn.split(/\s+/).filter(move => move.length > 0 && move !== '*');
};

/**
 * Formats a move for display with annotations
 */
export const formatMoveDisplay = (move: ChessMove, includeAnnotations = false): string => {
  let display = move.san;
  
  if (includeAnnotations) {
    if (move.flags.includes('c')) display += ' ×'; // Capture
    if (move.flags.includes('+')) display += ' +'; // Check
    if (move.flags.includes('#')) display += ' #'; // Checkmate
    if (move.flags.includes('e')) display += ' e.p.'; // En passant
    if (move.flags.includes('k') || move.flags.includes('q')) display += ' O-O'; // Castling
  }
  
  return display;
};

/**
 * Creates a new chess study with default values
 */
export const createNewStudy = (
  name: string,
  description?: string,
  startingFen?: string,
  isPublic?: boolean,
  tags?: string[]
): ChessStudy => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    name: name.trim(),
    description: description?.trim() || '',
    createdAt: now,
    updatedAt: now,
    isPublic: isPublic || false,
    tags: tags || [],
    chapters: [
      {
        id: generateId(),
        name: 'Chapter 1',
        startingFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        annotations: {},
        createdAt: now
      }
    ]
  };
};

/**
 * Creates a new chapter for a study
 */
export const createNewChapter = (
  name: string,
  startingFen?: string,
  description?: string
): ChessChapter => {
  const now = new Date().toISOString();
  
  return {
    id: generateId(),
    name: name.trim(),
    description: description?.trim(),
    startingFen: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    annotations: {},
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Generates a unique ID for studies and chapters
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Deep clones a study object
 */
export const cloneStudy = (study: ChessStudy): ChessStudy => {
  return JSON.parse(JSON.stringify(study));
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Formats a relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return formatDate(dateString);
  } catch {
    return 'Unknown';
  }
};

/**
 * Validates a study object
 */
export const validateStudy = (study: any): study is ChessStudy => {
  if (!study || typeof study !== 'object') {
    console.error('Study validation failed: not an object', study);
    return false;
  }

  // Required fields
  if (typeof study.id !== 'string') {
    console.error('Study validation failed: invalid id', study.id);
    return false;
  }

  if (typeof study.name !== 'string') {
    console.error('Study validation failed: invalid name', study.name);
    return false;
  }

  // Description can be undefined or string
  if (study.description !== undefined && typeof study.description !== 'string') {
    console.error('Study validation failed: invalid description', study.description);
    return false;
  }

  if (typeof study.createdAt !== 'string') {
    console.error('Study validation failed: invalid createdAt', study.createdAt);
    return false;
  }

  if (!Array.isArray(study.chapters)) {
    console.error('Study validation failed: chapters not an array', study.chapters);
    return false;
  }

  if (study.chapters.length === 0) {
    console.error('Study validation failed: no chapters');
    return false;
  }

  // Validate each chapter
  for (let i = 0; i < study.chapters.length; i++) {
    const chapter = study.chapters[i];
    if (!validateChapter(chapter)) {
      console.error(`Study validation failed: invalid chapter at index ${i}`, chapter);
      return false;
    }
  }

  return true;
};

/**
 * Validates a chapter object
 */
export const validateChapter = (chapter: any): chapter is ChessChapter => {
  if (!chapter || typeof chapter !== 'object') {
    console.error('Chapter validation failed: not an object', chapter);
    return false;
  }

  if (typeof chapter.name !== 'string' || chapter.name.trim().length === 0) {
    console.error('Chapter validation failed: invalid name', chapter.name);
    return false;
  }

  if (typeof chapter.startingFen !== 'string') {
    console.error('Chapter validation failed: invalid startingFen', chapter.startingFen);
    return false;
  }

  // Validate FEN format
  if (!isValidFEN(chapter.startingFen)) {
    console.error('Chapter validation failed: invalid FEN format', chapter.startingFen);
    return false;
  }

  // Annotations should be an object (can be empty)
  if (!chapter.annotations || typeof chapter.annotations !== 'object' || Array.isArray(chapter.annotations)) {
    console.error('Chapter validation failed: invalid annotations', chapter.annotations);
    return false;
  }

  return true;
};

/**
 * Exports a study to PGN format
 */
export const exportStudyToPGN = (study: ChessStudy): string => {
  let pgn = '';
  
  study.chapters.forEach((chapter, index) => {
    pgn += `[Event "${study.name} - ${chapter.name}"]\n`;
    pgn += `[Site "Chess Editor"]\n`;
    pgn += `[Date "${formatDate(study.createdAt)}"]\n`;
    pgn += `[White "Study"]\n`;
    pgn += `[Black "Analysis"]\n`;
    pgn += `[Result "*"]\n`;
    if (chapter.startingFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
      pgn += `[FEN "${chapter.startingFen}"]\n`;
      pgn += `[SetUp "1"]\n`;
    }
    if (chapter.description) {
      pgn += `[Description "${chapter.description}"]\n`;
    }
    pgn += '\n';
    
    // Add moves if available
    if (chapter.moves) {
      chapter.moves.forEach((move, moveIndex) => {
        if (moveIndex % 2 === 0) {
          pgn += `${Math.floor(moveIndex / 2) + 1}. `;
        }
        pgn += `${move.san} `;
        
        // Add annotation if available
        if (chapter.annotations[moveIndex + 1]) {
          pgn += `{${chapter.annotations[moveIndex + 1]}} `;
        }
      });
    }
    
    pgn += '*\n\n';
  });
  
  return pgn;
};

/**
 * Calculates the material balance of a position
 */
export const calculateMaterial = (fen: string): { white: number; black: number; balance: number } => {
  const pieceValues: { [piece: string]: number } = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9,
    'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9
  };
  
  const boardPart = fen.split(' ')[0];
  let whiteMaterial = 0;
  let blackMaterial = 0;
  
  for (const char of boardPart) {
    if (pieceValues[char]) {
      if (char === char.toUpperCase()) {
        whiteMaterial += pieceValues[char];
      } else {
        blackMaterial += pieceValues[char];
      }
    }
  }
  
  return {
    white: whiteMaterial,
    black: blackMaterial,
    balance: whiteMaterial - blackMaterial
  };
};

/**
 * Checks if a position is a theoretical draw
 */
export const isTheoreticalDraw = (fen: string): boolean => {
  const boardPart = fen.split(' ')[0];
  const pieces = boardPart.replace(/[^a-zA-Z]/g, '');
  
  // King vs King
  if (pieces.length === 2) return true;
  
  // King and minor piece vs King
  if (pieces.length === 3) {
    const minorPieces = ['n', 'b', 'N', 'B'];
    return minorPieces.some(piece => pieces.includes(piece));
  }
  
  // King and two knights vs King
  if (pieces.length === 4) {
    const sorted = pieces.toLowerCase().split('').sort().join('');
    return sorted === 'kknn';
  }
  
  return false;
};