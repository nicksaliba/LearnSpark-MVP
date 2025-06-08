// src/utils/chessSafeWrapper.ts
import { Chess } from 'chess.js';
import { 
  toSquare, 
  toPiece, 
  createMovesOptions, 
  isValidSquareFormat, 
  safeChessCall 
} from './chess-types-compat';

/**
 * Safe wrapper for chess.js methods that handles different return types
 */
export class ChessSafeWrapper {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess();
    if (fen) {
      this.safeLoad(fen);
    }
  }

  /**
   * Safely load a FEN position, handling both boolean and void return types
   */
  safeLoad(fen: string): boolean {
    try {
      const result = this.chess.load(fen);
      
      // Handle different return types
      if (typeof result === 'boolean') {
        return result;
      } else if (typeof result === 'undefined') {
        // If load() returns void and doesn't throw, assume success
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading FEN:', error);
      return false;
    }
  }

  /**
   * Safely reset the game
   */
  safeReset(): boolean {
    try {
      this.chess.reset();
      return true;
    } catch (error) {
      console.error('Error resetting chess:', error);
      return false;
    }
  }

  /**
   * Reset method alias for compatibility
   */
  reset(): boolean {
    return this.safeReset();
  }

  /**
   * Get current FEN
   */
  fen(): string {
    try {
      return this.chess.fen();
    } catch (error) {
      console.error('Error getting FEN:', error);
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  }

  /**
   * Get current turn
   */
  turn(): 'w' | 'b' {
    try {
      return this.chess.turn();
    } catch (error) {
      console.error('Error getting turn:', error);
      return 'w';
    }
  }

  /**
   * Make a move safely
   */
  safeMove(move: string | { from: string; to: string; promotion?: string }): any {
    try {
      return this.chess.move(move);
    } catch (error) {
      console.error('Error making move:', error);
      return null;
    }
  }

  /**
   * Check if game is over (try multiple method names)
   */
  isGameOver(): boolean {
    try {
      // Try different method names based on version
      if (typeof (this.chess as any).isGameOver === 'function') {
        return (this.chess as any).isGameOver();
      } else if (typeof (this.chess as any).gameOver === 'function') {
        return (this.chess as any).gameOver();
      } else if (typeof (this.chess as any).game_over === 'function') {
        return (this.chess as any).game_over();
      }
      
      // Fallback: check if there are legal moves
      const moves = this.chess.moves();
      return moves.length === 0;
    } catch (error) {
      console.error('Error checking game over:', error);
      return false;
    }
  }

  /**
   * Check if in check (try multiple method names)
   */
  inCheck(): boolean {
    try {
      if (typeof (this.chess as any).inCheck === 'function') {
        return (this.chess as any).inCheck();
      } else if (typeof (this.chess as any).in_check === 'function') {
        return (this.chess as any).in_check();
      }
      return false;
    } catch (error) {
      console.error('Error checking if in check:', error);
      return false;
    }
  }

  /**
   * Check if checkmate (try multiple method names)
   */
  isCheckmate(): boolean {
    try {
      if (typeof (this.chess as any).isCheckmate === 'function') {
        return (this.chess as any).isCheckmate();
      } else if (typeof (this.chess as any).in_checkmate === 'function') {
        return (this.chess as any).in_checkmate();
      }
      return false;
    } catch (error) {
      console.error('Error checking checkmate:', error);
      return false;
    }
  }

  /**
   * Check if stalemate (try multiple method names)
   */
  isStalemate(): boolean {
    try {
      if (typeof (this.chess as any).isStalemate === 'function') {
        return (this.chess as any).isStalemate();
      } else if (typeof (this.chess as any).in_stalemate === 'function') {
        return (this.chess as any).in_stalemate();
      }
      return false;
    } catch (error) {
      console.error('Error checking stalemate:', error);
      return false;
    }
  }

  /**
   * Check if draw (try multiple method names)
   */
  isDraw(): boolean {
    try {
      if (typeof (this.chess as any).isDraw === 'function') {
        return (this.chess as any).isDraw();
      } else if (typeof (this.chess as any).in_draw === 'function') {
        return (this.chess as any).in_draw();
      }
      return false;
    } catch (error) {
      console.error('Error checking draw:', error);
      return false;
    }
  }

  /**
   * Get legal moves - handles different chess.js v1.3.1 overloads
   */
  moves(options?: { square?: string; verbose?: boolean }): string[] | any[] {
    return safeChessCall(
      () => {
        // Handle different parameter combinations for chess.js v1.3.1
        if (!options) {
          // Case 1: moves() - returns string[]
          return this.chess.moves();
        }
        
        if (options.square && options.verbose !== undefined) {
          // Case 2: moves({ square: 'e4', verbose: true/false })
          return this.chess.moves({
            square: toSquare(options.square),
            verbose: options.verbose
          } as any);
        }
        
        if (options.square) {
          // Case 3: moves({ square: 'e4' }) - returns string[]
          return this.chess.moves({ square: toSquare(options.square) } as any);
        }
        
        if (options.verbose !== undefined) {
          // Case 4: moves({ verbose: true/false })
          return this.chess.moves({ verbose: options.verbose } as any);
        }
        
        // Fallback
        return this.chess.moves();
      },
      [],
      'Error getting moves'
    );
  }

  /**
   * Undo last move
   */
  undo(): any {
    try {
      return this.chess.undo();
    } catch (error) {
      console.error('Error undoing move:', error);
      return null;
    }
  }

  /**
   * Get board representation
   */
  board(): any[][] {
    try {
      return this.chess.board();
    } catch (error) {
      console.error('Error getting board:', error);
      return [];
    }
  }

  /**
   * Get the underlying chess instance (for advanced use)
   */
  getChessInstance(): Chess {
    return this.chess;
  }

  /**
   * Load method alias for compatibility
   */
  load(fen: string): boolean {
    return this.safeLoad(fen);
  }

  /**
   * Move method alias for compatibility
   */
  move(move: string | { from: string; to: string; promotion?: string }): any {
    return this.safeMove(move);
  }

  /**
   * Get PGN string
   */
  pgn(): string {
    return safeChessCall(
      () => this.chess.pgn(),
      '',
      'Error getting PGN'
    );
  }

  /**
   * Load PGN and return moves
   */
  loadPgn(pgn: string): boolean {
    return safeChessCall(
      () => {
        if (typeof (this.chess as any).loadPgn === 'function') {
          return (this.chess as any).loadPgn(pgn);
        } else if (typeof (this.chess as any).load_pgn === 'function') {
          return (this.chess as any).load_pgn(pgn);
        }
        return false;
      },
      false,
      'Error loading PGN'
    );
  }

  /**
   * Load PGN and get all moves as ChessMove objects
   */
  loadPgnAndGetMoves(pgn: string): any[] {
    return safeChessCall(
      () => {
        // Reset and load PGN
        this.chess.reset();
        const success = this.loadPgn(pgn);
        
        if (success) {
          // Get all moves in verbose format
          return this.history({ verbose: true });
        }
        
        return [];
      },
      [],
      'Error loading PGN and getting moves'
    );
  }

  /**
   * Get piece at square
   */
  get(square: string): any {
    if (!isValidSquareFormat(square)) {
      console.error('Invalid square format:', square);
      return null;
    }

    return safeChessCall(
      () => this.chess.get(toSquare(square)),
      null,
      'Error getting piece at square'
    );
  }

  /**
   * Put piece on square
   */
  put(piece: any, square: string): boolean {
    if (!isValidSquareFormat(square)) {
      console.error('Invalid square format:', square);
      return false;
    }

    return safeChessCall(
      () => this.chess.put(toPiece(piece), toSquare(square)),
      false,
      'Error putting piece'
    );
  }

  /**
   * Remove piece from square
   */
  remove(square: string): any {
    if (!isValidSquareFormat(square)) {
      console.error('Invalid square format:', square);
      return null;
    }

    return safeChessCall(
      () => this.chess.remove(toSquare(square)),
      null,
      'Error removing piece'
    );
  }

  /**
   * Get game history
   */
  history(options?: { verbose?: boolean }): any[] {
    return safeChessCall(
      () => {
        if (options) {
          return this.chess.history(options);
        }
        return this.chess.history();
      },
      [],
      'Error getting history'
    );
  }

  /**
   * Clear the board
   */
  clear(): void {
    try {
      this.chess.clear();
    } catch (error) {
      console.error('Error clearing board:', error);
    }
  }

  /**
   * Get ASCII representation
   */
  ascii(): string {
    try {
      return this.chess.ascii();
    } catch (error) {
      console.error('Error getting ASCII:', error);
      return '';
    }
  }

  /**
   * Validate FEN
   */
  validateFen(fen: string): any {
    return safeChessCall(
      () => {
        // Try different method names based on chess.js version
        if (typeof (this.chess as any).validateFen === 'function') {
          return (this.chess as any).validateFen(fen);
        } else if (typeof (this.chess as any).validate_fen === 'function') {
          return (this.chess as any).validate_fen(fen);
        }
        
        // Fallback validation
        return { valid: true, error_number: 0, error: '' };
      },
      { valid: false, error_number: -1, error: 'Validation error' },
      'Error validating FEN'
    );
  }

  /**
   * Get square color
   */
  squareColor(square: string): 'light' | 'dark' {
    if (!isValidSquareFormat(square)) {
      console.error('Invalid square format:', square);
      return 'light';
    }

    return safeChessCall(
      () => {
        if (typeof (this.chess as any).squareColor === 'function') {
          return (this.chess as any).squareColor(toSquare(square));
        } else if (typeof (this.chess as any).square_color === 'function') {
          return (this.chess as any).square_color(toSquare(square));
        }
        
        // Fallback calculation
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1], 10) - 1;
        return (file + rank) % 2 === 0 ? 'dark' : 'light';
      },
      'light',
      'Error getting square color'
    );
  }
}