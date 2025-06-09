// src/hooks/useChess.ts
import { useState, useEffect, useCallback } from 'react';
import { ChessMove, GameState, UseChessReturn, ChessError } from '../types/chess';
import { ChessSafeWrapper } from '../utils/chessSafeWrapper';

export const useChess = (initialFen?: string): UseChessReturn => {
  // Create safe chess wrapper
  const [chess] = useState<ChessSafeWrapper>(() => {
    try {
      console.log('Creating new Chess instance with safe wrapper');
      const chessWrapper = new ChessSafeWrapper();
      console.log('Chess wrapper created successfully');
      return chessWrapper;
    } catch (error) {
      console.error('Failed to create Chess wrapper:', error);
      throw error;
    }
  });
  
  const [position, setPosition] = useState<string>(() => {
    try {
      return chess.fen();
    } catch (error) {
      console.error('Failed to get initial FEN:', error);
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
  });
  
  const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    isGameOver: false,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    result: ''
  });

  // Update game state whenever the chess position changes
  const updateGameState = useCallback((): void => {
    try {
      const newPosition = chess.fen();
      console.log('Updating game state, new position:', newPosition);
      
      const isGameOver = chess.isGameOver();
      const isCheck = chess.inCheck();
      const isCheckmate = chess.isCheckmate();
      const isStalemate = chess.isStalemate();
      const isDraw = chess.isDraw();

      let result = '';
      let winner: 'white' | 'black' | 'draw' | undefined;

      if (isGameOver) {
        if (isCheckmate) {
          winner = chess.turn() === 'w' ? 'black' : 'white';
          result = `Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins.`;
        } else if (isStalemate) {
          winner = 'draw';
          result = 'Stalemate! Game is a draw.';
        } else if (isDraw) {
          winner = 'draw';
          result = 'Game is a draw.';
        } else {
          result = 'Game over.';
        }
      }

      setGameState({
        isGameOver,
        isCheck,
        isCheckmate,
        isStalemate,
        isDraw,
        result,
        winner
      });

      // Update position state
      setPosition(newPosition);
      console.log('Position updated to:', newPosition);
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  }, [chess]);

  // Initialize game state and load initial FEN if provided
  useEffect(() => {
    try {
      console.log('useChess initialization, initialFen:', initialFen);
      
      if (initialFen && initialFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        console.log('Loading initial FEN:', initialFen);
        const success = chess.load(initialFen);
        if (!success) {
          console.warn('Failed to load initial FEN, using default');
          chess.reset();
        }
      } else {
        console.log('Using default starting position');
        chess.reset();
      }
      updateGameState();
    } catch (error) {
      console.error('Error in useChess initialization:', error);
      // Fallback to default position
      try {
        chess.reset();
        updateGameState();
      } catch (fallbackError) {
        console.error('Fallback initialization failed:', fallbackError);
      }
    }
  }, []); // Remove dependencies to avoid infinite loops

  // Make a move
  const makeMove = useCallback((
    move: string | { from: string; to: string; promotion?: string }
  ): ChessMove | null => {
    try {
      console.log('Making move:', move);
      console.log('Current position before move:', chess.fen());
      
      const moveResult = chess.move(move);
      console.log('Move result:', moveResult);
      
      if (moveResult) {
        const typedMove = moveResult as ChessMove;
        
        // Truncate history if we're not at the end and add the new move
        const newHistory = [...moveHistory.slice(0, currentMoveIndex), typedMove];
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length);
        
        // Update game state and position
        updateGameState();
        
        console.log('Move successful, new position:', chess.fen());
        return typedMove;
      } else {
        console.log('Move failed - invalid move');
      }
    } catch (error) {
      console.error('Error making move:', error);
    }
    return null;
  }, [chess, moveHistory, currentMoveIndex, updateGameState]);

  // Navigate to a specific move
  const goToMove = useCallback((moveIndex: number): boolean => {
    if (moveIndex < 0 || moveIndex > moveHistory.length) {
      console.warn('Invalid move index:', moveIndex, 'Max:', moveHistory.length);
      return false;
    }

    try {
      console.log('Going to move index:', moveIndex);
      
      // Reset to starting position
      chess.reset();
      
      // Replay moves up to the target index
      for (let i = 0; i < moveIndex; i++) {
        const move = moveHistory[i];
        if (move) {
          const result = chess.move(move);
          if (!result) {
            console.error('Failed to replay move at index', i, ':', move);
            return false;
          }
        }
      }

      setCurrentMoveIndex(moveIndex);
      updateGameState();
      console.log('Successfully went to move', moveIndex, 'position:', chess.fen());
      return true;
    } catch (error) {
      console.error('Error navigating to move:', error);
      return false;
    }
  }, [chess, moveHistory, updateGameState]);

  // Reset the game
  const resetGame = useCallback((): void => {
    try {
      console.log('Resetting game, initialFen:', initialFen);
      chess.reset();
      
      if (initialFen && initialFen !== 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        const success = chess.load(initialFen);
        if (!success) {
          console.error('Failed to load initial FEN during reset:', initialFen);
        }
      }
      
      setMoveHistory([]);
      setCurrentMoveIndex(0);
      updateGameState();
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }, [chess, initialFen, updateGameState]);

  // Load a position from FEN
  const loadPosition = useCallback((fen: string): boolean => {
    try {
      console.log('Loading FEN position:', fen);
      
      const success = chess.safeLoad(fen);
      console.log('FEN load result:', success);
      
      if (success) {
        setMoveHistory([]);
        setCurrentMoveIndex(0);
        updateGameState();
        return true;
      } else {
        console.error('Chess.js rejected FEN:', fen);
        return false;
      }
    } catch (error) {
      console.error('Error loading position:', error, 'FEN:', fen);
      return false;
    }
  }, [chess, updateGameState]);

  // Load PGN
  const loadPgn = useCallback((pgn: string): boolean => {
    try {
      console.log('Loading PGN:', pgn);
      
      // Reset the game first
      chess.reset();
      
      // Load the PGN
      const success = chess.loadPgn(pgn);
      
      if (success) {
        // Get the move history
        const history = chess.history({ verbose: true }) as ChessMove[];
        setMoveHistory(history);
        setCurrentMoveIndex(history.length);
        updateGameState();
        
        console.log('PGN loaded successfully, moves:', history.length);
        return true;
      } else {
        console.error('Failed to load PGN:', pgn);
        return false;
      }
    } catch (error) {
      console.error('Error loading PGN:', error);
      return false;
    }
  }, [chess, updateGameState]);

  // Undo the last move
  const undoMove = useCallback((): ChessMove | null => {
    try {
      const undoneMove = chess.undo();
      if (undoneMove && moveHistory.length > 0) {
        const newHistory = moveHistory.slice(0, -1);
        setMoveHistory(newHistory);
        setCurrentMoveIndex(newHistory.length);
        updateGameState();
        return undoneMove as ChessMove;
      }
      return null;
    } catch (error) {
      console.error('Error undoing move:', error);
      return null;
    }
  }, [chess, moveHistory, updateGameState]);

  // Redo a move (go forward one move)
  const redoMove = useCallback((): boolean => {
    if (currentMoveIndex < moveHistory.length) {
      return goToMove(currentMoveIndex + 1);
    }
    return false;
  }, [currentMoveIndex, moveHistory.length, goToMove]);

  // Check if a move is legal
  const isLegalMove = useCallback((from: string, to: string): boolean => {
    try {
      const moves = chess.moves({ verbose: true }) as ChessMove[];
      return moves.some(move => move.from === from && move.to === to);
    } catch (error) {
      console.error('Error checking move legality:', error);
      return false;
    }
  }, [chess]);

  // Get legal moves for a square or all legal moves
  const getLegalMoves = useCallback((square?: string): string[] => {
    try {
      if (square) {
        return chess.moves({ square, verbose: false }) as string[];
      }
      return chess.moves({ verbose: false }) as string[];
    } catch (error) {
      console.error('Error getting legal moves:', error);
      return [];
    }
  }, [chess]);

  return {
    chess: chess as any, // Type assertion for compatibility with existing code
    position,
    moveHistory,
    currentMoveIndex,
    gameState,
    makeMove,
    goToMove,
    resetGame,
    loadPosition,
    loadPgn,
    undoMove,
    redoMove,
    isLegalMove,
    getLegalMoves
  };
};