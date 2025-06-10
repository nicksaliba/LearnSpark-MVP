// src/utils/pgnParser.ts
export interface PGNGame {
  headers: Record<string, string>;
  moves: string[];
  result: string;
  comments: Record<number, string>;
  variations: Record<number, string[]>;
}

export interface ParsedPGN {
  games: PGNGame[];
  errors: string[];
}

export class PGNParser {
  static parse(pgnText: string): ParsedPGN {
    const result: ParsedPGN = {
      games: [],
      errors: []
    };

    try {
      // Split PGN into individual games
      const games = this.splitIntoGames(pgnText);
      
      for (let i = 0; i < games.length; i++) {
        try {
          const game = this.parseGame(games[i], i + 1);
          if (game) {
            result.games.push(game);
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
    // Split by game separators (empty lines between games)
    const games = pgnText.split(/\n\s*\n\s*(?=\[)/);
    return games.filter(game => game.trim().length > 0);
  }

  private static parseGame(gameText: string, gameNumber: number): PGNGame | null {
    const lines = gameText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const headers: Record<string, string> = {};
    const moves: string[] = [];
    const comments: Record<number, string> = {};
    const variations: Record<number, string[]> = {};
    let movesSection = '';
    let result = '*';

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

    // Parse moves section
    movesSection = lines.slice(headerEnd).join(' ');
    
    // Extract result
    const resultMatch = movesSection.match(/(1-0|0-1|1\/2-1\/2|\*)$/);
    if (resultMatch) {
      result = resultMatch[1];
      movesSection = movesSection.replace(/(1-0|0-1|1\/2-1\/2|\*)$/, '').trim();
    }

    // Parse moves
    const parsedMoves = this.extractMoves(movesSection);
    moves.push(...parsedMoves);

    // Validate that we have some content
    if (Object.keys(headers).length === 0 && moves.length === 0) {
      return null;
    }

    return {
      headers,
      moves,
      result,
      comments,
      variations
    };
  }

  private static extractMoves(movesText: string): string[] {
    const moves: string[] = [];
    
    // Remove comments and variations for now (simplified parser)
    let cleanText = movesText
      .replace(/\{[^}]*\}/g, '') // Remove comments
      .replace(/\([^)]*\)/g, '') // Remove variations
      .replace(/\$\d+/g, ''); // Remove numeric annotations

    // Split by move numbers and extract moves
    const tokens = cleanText.split(/\s+/).filter(token => token.length > 0);
    
    for (const token of tokens) {
      // Skip move numbers (1., 2., etc.)
      if (/^\d+\.+$/.test(token)) {
        continue;
      }
      
      // Skip result indicators
      if (['1-0', '0-1', '1/2-1/2', '*'].includes(token)) {
        continue;
      }
      
      // Add valid moves
      if (this.isValidMove(token)) {
        moves.push(token);
      }
    }

    return moves;
  }

  private static isValidMove(move: string): boolean {
    // Basic move validation
    const movePattern = /^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](\=[QRBN])?[\+#]?$|^O-O(-O)?[\+#]?$/;
    return movePattern.test(move);
  }

  static validatePGN(pgnText: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!pgnText || pgnText.trim().length === 0) {
      errors.push('PGN text is empty');
      return { isValid: false, errors };
    }

    try {
      const parsed = this.parse(pgnText);
      
      if (parsed.games.length === 0) {
        errors.push('No valid games found in PGN');
      }
      
      if (parsed.errors.length > 0) {
        errors.push(...parsed.errors);
      }

      // Check for required headers
      for (const game of parsed.games) {
        if (!game.headers.Event) {
          errors.push('Missing Event header');
        }
        if (!game.headers.Site) {
          errors.push('Missing Site header');
        }
        if (!game.headers.Date) {
          errors.push('Missing Date header');
        }
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static gamesToStudyFormat(games: PGNGame[]): any[] {
    return games.map((game, index) => ({
      id: `pgn-game-${index + 1}`,
      name: game.headers.Event || `Game ${index + 1}`,
      description: this.generateGameDescription(game),
      startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: game.moves,
      annotations: game.comments,
      metadata: {
        white: game.headers.White || 'Unknown',
        black: game.headers.Black || 'Unknown',
        date: game.headers.Date || 'Unknown',
        site: game.headers.Site || 'Unknown',
        round: game.headers.Round || 'Unknown',
        result: game.result,
        eco: game.headers.ECO || '',
        opening: game.headers.Opening || ''
      },
      createdAt: new Date().toISOString()
    }));
  }

  private static generateGameDescription(game: PGNGame): string {
    const white = game.headers.White || 'Unknown';
    const black = game.headers.Black || 'Unknown';
    const date = game.headers.Date || 'Unknown';
    const result = game.result || '*';
    
    let description = `${white} vs ${black}`;
    
    if (date !== 'Unknown') {
      description += ` (${date})`;
    }
    
    if (result !== '*') {
      description += ` - Result: ${result}`;
    }
    
    if (game.headers.Opening) {
      description += ` - Opening: ${game.headers.Opening}`;
    }
    
    return description;
  }
}

// Example usage and validation
export const validateAndParsePGN = (pgnText: string) => {
  const validation = PGNParser.validatePGN(pgnText);
  
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
      games: []
    };
  }
  
  const parsed = PGNParser.parse(pgnText);
  const studyChapters = PGNParser.gamesToStudyFormat(parsed.games);
  
  return {
    success: true,
    errors: parsed.errors,
    games: parsed.games,
    studyChapters
  };
};