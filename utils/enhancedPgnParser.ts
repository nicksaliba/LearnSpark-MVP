// utils/enhancedPgnParser.ts
import { Chess } from 'chess.js';

export interface VariationNode {
  id: string;
  move: any;
  notation: string;
  fen: string;
  children: VariationNode[];
  parent?: string;
  depth: number;
  isMainLine: boolean;
  isRequired?: boolean;
  annotation?: string;
  evaluation?: string;
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

  private static parseVariations(
    pgnText: string, 
    chess: Chess,
    startFen?: string
  ): VariationNode[] {
    const variations: VariationNode[] = [];
    let nodeCounter = 0;

    // Reset chess to starting position
    if (startFen) {
      chess.load(startFen);
    } else {
      chess.reset();
    }

    // Parse the PGN and extract moves with variations
    const cleanPgn = this.cleanPgnForParsing(pgnText);
    const tokens = this.tokenizePgn(cleanPgn);
    
    this.parseTokensToVariations(tokens, chess, variations, 0, true, null);
    
    return variations;
  }

  private static cleanPgnForParsing(pgn: string): string {
    // Remove headers but keep comments and variations
    return pgn
      .replace(/\[[^\]]*\]/g, '') // Remove headers
      .replace(/^\s*\n/gm, '') // Remove empty lines
      .trim();
  }

  private static tokenizePgn(pgn: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inComment = false;
    let inVariation = false;
    let braceLevel = 0;
    let parenLevel = 0;

    for (let i = 0; i < pgn.length; i++) {
      const char = pgn[i];
      const nextChar = pgn[i + 1];

      if (char === '{') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        inComment = true;
        braceLevel++;
        current += char;
      } else if (char === '}') {
        current += char;
        braceLevel--;
        if (braceLevel === 0) {
          inComment = false;
          tokens.push(current.trim());
          current = '';
        }
      } else if (char === '(') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        inVariation = true;
        parenLevel++;
        tokens.push('(');
      } else if (char === ')') {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
        parenLevel--;
        if (parenLevel === 0) {
          inVariation = false;
        }
        tokens.push(')');
      } else if (!inComment && !inVariation && /\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current.trim());
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens.filter(token => token.length > 0);
  }

  private static parseTokensToVariations(
    tokens: string[],
    chess: Chess,
    variations: VariationNode[],
    depth: number,
    isMainLine: boolean,
    parentId: string | null
  ): void {
    let i = 0;
    
    while (i < tokens.length) {
      const token = tokens[i];

      if (token === '(') {
        // Start of variation - save current position
        const savedFen = chess.fen();
        i++;
        
        // Parse variation
        const variationTokens: string[] = [];
        let parenLevel = 1;
        
        while (i < tokens.length && parenLevel > 0) {
          if (tokens[i] === '(') parenLevel++;
          if (tokens[i] === ')') parenLevel--;
          
          if (parenLevel > 0) {
            variationTokens.push(tokens[i]);
          }
          i++;
        }
        
        // Parse the variation recursively
        this.parseTokensToVariations(
          variationTokens, 
          chess, 
          variations, 
          depth + 1, 
          false, 
          parentId
        );
        
        // Restore position after variation
        chess.load(savedFen);
        continue;
      }

      if (token === ')') {
        break;
      }

      // Skip move numbers
      if (/^\d+\.+$/.test(token)) {
        i++;
        continue;
      }

      // Skip result indicators
      if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) {
        i++;
        continue;
      }

      // Skip comments for now (could be parsed for annotations)
      if (token.startsWith('{') && token.endsWith('}')) {
        i++;
        continue;
      }

      // Try to make the move
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
            parent: parentId,
            depth: depth,
            isMainLine: isMainLine,
            isRequired: isMainLine, // Main line moves are required by default
          };

          // Look ahead for annotations
          if (i + 1 < tokens.length && tokens[i + 1].startsWith('{')) {
            const comment = tokens[i + 1];
            variation.annotation = comment.slice(1, -1); // Remove braces
          }

          variations.push(variation);
          parentId = nodeId;
        }
      } catch (error) {
        console.warn('Failed to parse move:', token);
      }

      i++;
    }
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

    // Parse variations
    const chess = new Chess();
    const variations = this.parseVariations(movesSection, chess, startingFen);

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
    
    variations.forEach((variation, index) => {
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

      // Moves
      let moveNumber = 1;
      let isWhiteMove = true;
      
      puzzle.variations.filter(v => v.isMainLine).forEach((variation, moveIndex) => {
        if (isWhiteMove) {
          pgn += `${moveNumber}. `;
        } else {
          pgn += '... ';
        }
        
        pgn += variation.notation;
        
        if (variation.annotation) {
          pgn += ` {${variation.annotation}}`;
        }
        
        pgn += ' ';
        
        if (!isWhiteMove) {
          moveNumber++;
        }
        isWhiteMove = !isWhiteMove;
      });

      pgn += puzzle.metadata.result || '*';
      pgn += '\n\n';
    });

    return pgn;
  }
}