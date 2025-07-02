// utils/enhancedPgnParser.ts - Fixed Version
import { Chess } from 'chess.js';

export interface VariationNode {
  id: string;
  move: any;
  notation: string;
  fen: string;
  children: string[]; // Keep as string IDs for flat structure
  parent?: string;
  depth: number;
  isMainLine: boolean;
  isRequired?: boolean;
  annotation?: string;
  evaluation?: string;
  moveNumber: number;
  color: 'w' | 'b';
}

export interface ChessPuzzle {
  id: string;
  title: string;
  description: string;
  fen: string;
  solution: string[];
  variations: VariationNode[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  themes: string[];
  requiredVariations: string[];
  annotations: Record<string, string>;
  metadata: {
    source?: string;
    date?: string;
    white?: string;
    black?: string;
    event?: string;
    result?: string;
    eco?: string;
    opening?: string;
  };
}

export interface ParsedPGNWithVariations {
  puzzles: ChessPuzzle[];
  errors: string[];
  totalGames: number;
}

export class EnhancedPGNParser {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static extractThemes(headers: Record<string, string>, moves: string[]): string[] {
    const themes = new Set<string>();
    
    // Extract from headers
    if (headers.Opening) themes.add('opening');
    if (headers.ECO) themes.add('eco');
    
    // Extract from move patterns
    const moveString = moves.join(' ').toLowerCase();
    
    // Common tactical themes
    if (moveString.includes('fork')) themes.add('fork');
    if (moveString.includes('pin')) themes.add('pin');
    if (moveString.includes('skewer')) themes.add('skewer');
    if (moveString.includes('discovered')) themes.add('discovered-attack');
    if (moveString.includes('sacrifice')) themes.add('sacrifice');
    if (moveString.includes('mate')) themes.add('mate');
    if (moveString.includes('promotion')) themes.add('promotion');
    if (moveString.includes('endgame')) themes.add('endgame');
    
    // Detect castling
    if (moveString.includes('o-o')) themes.add('castling');
    
    // Detect captures
    if (moveString.includes('x')) themes.add('tactics');
    
    return Array.from(themes);
  }

  private static determineDifficulty(
    headers: Record<string, string>, 
    variationCount: number,
    maxDepth: number
  ): 'beginner' | 'intermediate' | 'advanced' {
    // Simple heuristic based on complexity
    if (maxDepth <= 3 && variationCount <= 5) return 'beginner';
    if (maxDepth <= 6 && variationCount <= 15) return 'intermediate';
    return 'advanced';
  }

  private static parseSimplePgn(pgnText: string, startFen?: string): VariationNode[] {
    const chess = new Chess();
    
    // Set starting position
    if (startFen && startFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
      try {
        chess.load(startFen);
      } catch (error) {
        console.warn('Failed to load starting FEN, using default:', error);
        chess.reset();
      }
    } else {
      chess.reset();
    }

    // Clean the PGN text
    const cleanPgn = pgnText
      .replace(/\[[^\]]*\]/g, '') // Remove headers
      .replace(/\{[^}]*\}/g, '') // Remove comments for now
      .replace(/\([^)]*\)/g, '') // Remove variations for now
      .replace(/\d+\.\.\./g, '') // Remove black move numbers
      .replace(/[*]|1-0|0-1|1\/2-1\/2/g, '') // Remove result
      .trim();

    // Split into tokens
    const tokens = cleanPgn.split(/\s+/).filter(token => 
      token.length > 0 && 
      !token.match(/^\d+\.+$/) && // Skip move numbers
      !['*', '1-0', '0-1', '1/2-1/2'].includes(token)
    );

    const variations: VariationNode[] = [];
    let moveNumber = Math.floor(chess.history().length / 2) + 1;

    for (const token of tokens) {
      try {
        const move = chess.move(token);
        if (move) {
          const nodeId = this.generateId();
          const variation: VariationNode = {
            id: nodeId,
            move: move,
            notation: move.san,
            fen: chess.fen(),
            children: [],
            parent: variations.length > 0 ? variations[variations.length - 1].id : undefined,
            depth: 0,
            isMainLine: true,
            isRequired: true,
            moveNumber: moveNumber,
            color: move.color
          };

          // Link to previous move
          if (variations.length > 0) {
            variations[variations.length - 1].children.push(nodeId);
          }

          variations.push(variation);
          
          // Update move number
          if (move.color === 'b') {
            moveNumber++;
          }
        }
      } catch (error) {
        console.warn('Failed to parse move:', token, error);
      }
    }

    console.log('Parsed variations:', variations.length);
    return variations;
  }

  static parse(pgnText: string): ParsedPGNWithVariations {
    const result: ParsedPGNWithVariations = {
      puzzles: [],
      errors: [],
      totalGames: 0
    };

    try {
      // Split PGN into individual games
      const games = this.splitIntoGames(pgnText);
      result.totalGames = games.length;

      for (let i = 0; i < games.length; i++) {
        try {
          const puzzle = this.parseGameToPuzzle(games[i], i + 1);
          if (puzzle) {
            result.puzzles.push(puzzle);
          }
        } catch (error) {
          result.errors.push(`Game ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      result.errors.push(`Parser error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private static splitIntoGames(pgnText: string): string[] {
    // Split by game separators, looking for header blocks
    const games = pgnText.split(/(?=\[Event)/);
    return games.filter(game => game.trim().length > 0);
  }

  private static parseGameToPuzzle(gameText: string, gameNumber: number): ChessPuzzle | null {
    const lines = gameText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const headers: Record<string, string> = {};
    let movesSection = '';

    // Parse headers
    let headerEnd = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('[') && line.endsWith(']')) {
        const match = line.match(/\[(\w+)\s+"([^"]*)"\]/);
        if (match) {
          headers[match[1]] = match[2];
        }
        headerEnd = i + 1;
      } else {
        break;
      }
    }

    // Get moves section
    movesSection = lines.slice(headerEnd).join(' ');

    // Extract starting FEN if available
    const startingFen = headers.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // Parse variations using simplified parser
    const variations = this.parseSimplePgn(movesSection, startingFen);

    if (variations.length === 0) {
      return null; // Skip games with no valid moves
    }

    // Extract solution (main line moves)
    const solution = variations
      .filter(v => v.isMainLine)
      .map(v => v.notation);

    // Generate themes and difficulty
    const themes = this.extractThemes(headers, solution);
    const maxDepth = Math.max(...variations.map(v => v.depth), 0);
    const difficulty = this.determineDifficulty(headers, variations.length, maxDepth);

    // Generate title and description
    const title = headers.Event 
      ? `${headers.Event} - Game ${gameNumber}`
      : `Puzzle ${gameNumber}`;

    const description = this.generateDescription(headers, themes, solution.length);

    const puzzle: ChessPuzzle = {
      id: this.generateId(),
      title,
      description,
      fen: startingFen,
      solution,
      variations,
      difficulty,
      themes,
      requiredVariations: variations.filter(v => v.isMainLine).map(v => v.id),
      annotations: this.extractAnnotations(variations),
      metadata: {
        source: headers.Source,
        date: headers.Date,
        white: headers.White,
        black: headers.Black,
        event: headers.Event,
        result: headers.Result,
        eco: headers.ECO,
        opening: headers.Opening
      }
    };

    return puzzle;
  }

  private static generateDescription(
    headers: Record<string, string>,
    themes: string[],
    solutionLength: number
  ): string {
    let description = '';

    if (headers.White && headers.Black) {
      description += `${headers.White} vs ${headers.Black}`;
      if (headers.Date) {
        description += ` (${headers.Date})`;
      }
      description += '. ';
    }

    if (themes.length > 0) {
      description += `Themes: ${themes.join(', ')}. `;
    }

    if (solutionLength > 0) {
      description += `Solution requires ${Math.ceil(solutionLength / 2)} moves.`;
    }

    if (headers.Opening) {
      description += ` Opening: ${headers.Opening}.`;
    }

    return description.trim();
  }

  private static extractAnnotations(variations: VariationNode[]): Record<string, string> {
    const annotations: Record<string, string> = {};
    
    variations.forEach((variation) => {
      if (variation.annotation) {
        annotations[variation.id] = variation.annotation;
      }
    });

    return annotations;
  }

  // Utility method to validate PGN before parsing
  static validatePGN(pgnText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!pgnText || pgnText.trim().length === 0) {
      errors.push('PGN text is empty');
      return { isValid: false, errors };
    }

    // Check for basic PGN structure
    if (!pgnText.includes('[') || !pgnText.includes(']')) {
      errors.push('PGN appears to be missing headers');
    }

    // Try to parse and catch errors
    try {
      const result = this.parse(pgnText);
      if (result.puzzles.length === 0) {
        errors.push('No valid puzzles found in PGN');
      }
      errors.push(...result.errors);
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert puzzles back to PGN format
  static puzzlesToPGN(puzzles: ChessPuzzle[]): string {
    let pgn = '';

    puzzles.forEach((puzzle, index) => {
      // Headers
      pgn += `[Event "${puzzle.metadata.event || 'Chess Puzzle'}"]\n`;
      pgn += `[Site "${puzzle.metadata.source || 'LearnSpark'}"]\n`;
      pgn += `[Date "${puzzle.metadata.date || new Date().toISOString().split('T')[0]}"]\n`;
      pgn += `[Round "${index + 1}"]\n`;
      pgn += `[White "${puzzle.metadata.white || 'Student'}"]\n`;
      pgn += `[Black "${puzzle.metadata.black || 'Computer'}"]\n`;
      pgn += `[Result "${puzzle.metadata.result || '*'}"]\n`;
      
      if (puzzle.fen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        pgn += `[FEN "${puzzle.fen}"]\n`;
        pgn += `[SetUp "1"]\n`;
      }
      
      if (puzzle.metadata.eco) {
        pgn += `[ECO "${puzzle.metadata.eco}"]\n`;
      }
      
      if (puzzle.metadata.opening) {
        pgn += `[Opening "${puzzle.metadata.opening}"]\n`;
      }
      
      pgn += `[Difficulty "${puzzle.difficulty}"]\n`;
      pgn += `[Themes "${puzzle.themes.join(', ')}"]\n`;
      pgn += '\n';

      // Moves - simplified linear format
      let moveNumber = 1;
      let isWhite = puzzle.fen.split(' ')[1] === 'w';
      
      puzzle.variations.forEach((variation, index) => {
        if (isWhite) {
          pgn += `${moveNumber}. `;
        } else if (index === 0) {
          pgn += `${moveNumber}... `;
        }
        
        pgn += variation.notation;
        
        if (variation.annotation) {
          pgn += ` {${variation.annotation}}`;
        }
        
        pgn += ' ';
        
        if (!isWhite) {
          moveNumber++;
        }
        isWhite = !isWhite;
      });

      pgn += puzzle.metadata.result || '*';
      pgn += '\n\n';
    });

    return pgn;
  }

  // Generate sample puzzle for testing
  static generateSamplePuzzle(): ChessPuzzle {
    const sampleVariations: VariationNode[] = [
      {
        id: 'move-1',
        move: { from: 'f3', to: 'g5', san: 'Ng5', color: 'w' },
        notation: 'Ng5',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/3P4/PPP2PPP/RNBQK2R b KQkq - 2 4',
        children: ['move-2'],
        parent: undefined,
        depth: 0,
        isMainLine: true,
        isRequired: true,
        moveNumber: 5,
        color: 'w',
        annotation: 'Attacking f7!'
      },
      {
        id: 'move-2',
        move: { from: 'd7', to: 'd6', san: 'd6', color: 'b' },
        notation: 'd6',
        fen: 'r1bqkb1r/ppp2ppp/2np1n2/4p1N1/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 0 5',
        children: ['move-3'],
        parent: 'move-1',
        depth: 0,
        isMainLine: true,
        isRequired: true,
        moveNumber: 5,
        color: 'b'
      },
      {
        id: 'move-3',
        move: { from: 'g5', to: 'f7', san: 'Nxf7', color: 'w' },
        notation: 'Nxf7',
        fen: 'r1bqkb1r/ppp2Npp/2np1n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK2R b KQkq - 0 5',
        children: ['move-4'],
        parent: 'move-2',
        depth: 0,
        isMainLine: true,
        isRequired: true,
        moveNumber: 6,
        color: 'w',
        annotation: 'Royal fork!'
      },
      {
        id: 'move-4',
        move: { from: 'e8', to: 'f7', san: 'Kxf7', color: 'b' },
        notation: 'Kxf7',
        fen: 'r1bqkb1r/ppp2kpp/2np1n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK2R w KQkq - 0 6',
        children: ['move-5'],
        parent: 'move-3',
        depth: 0,
        isMainLine: true,
        isRequired: true,
        moveNumber: 6,
        color: 'b'
      },
      {
        id: 'move-5',
        move: { from: 'd1', to: 'f3', san: 'Qf3+', color: 'w' },
        notation: 'Qf3+',
        fen: 'r1bqkb1r/ppp2kpp/2np1n2/4p3/2B1P3/3P1Q2/PPP2PPP/RNB1K2R b KQ - 1 6',
        children: [],
        parent: 'move-4',
        depth: 0,
        isMainLine: true,
        isRequired: true,
        moveNumber: 7,
        color: 'w',
        annotation: 'Winning the queen!'
      }
    ];

    return {
      id: 'sample-puzzle',
      title: 'Italian Game - Tactical Puzzle',
      description: 'Find the best continuation for White in this Italian Game position',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4',
      solution: ['Ng5', 'd6', 'Nxf7', 'Kxf7', 'Qf3+'],
      variations: sampleVariations,
      difficulty: 'intermediate',
      themes: ['tactics', 'italian-game', 'fork'],
      requiredVariations: sampleVariations.map(v => v.id),
      annotations: {
        'move-1': 'Attacking f7!',
        'move-3': 'Royal fork!',
        'move-5': 'Winning the queen!'
      },
      metadata: {
        source: 'LearnSpark',
        date: '2024-01-15',
        white: 'Student',
        black: 'Computer',
        event: 'Tactical Training',
        result: '*',
        eco: 'C50',
        opening: 'Italian Game'
      }
    };
  }
}