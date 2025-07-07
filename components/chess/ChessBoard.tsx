// components/chess/ChessBoard.tsx - Improved Version
'use client';

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { ChessBoardProps, SquareStyles, Square } from '../../types/chess';

interface ArrowData {
  from: string;
  to: string;
  color: string;
}

interface ExtendedChessBoardProps extends ChessBoardProps {
  arrows?: ArrowData[];
}

const ChessBoard: React.FC<ExtendedChessBoardProps> = ({ 
  position, 
  onMove, 
  moveHistory, 
  currentMoveIndex,
  orientation = 'white',
  disabled = false,
  arrows = []
}) => {
  const [moveFrom, setMoveFrom] = useState<string>('');
  const [optionSquares, setOptionSquares] = useState<SquareStyles>({});
  const [boardKey, setBoardKey] = useState<number>(0);

  // Update board when position changes
  useEffect(() => {
    setBoardKey(prev => prev + 1);
    setMoveFrom('');
    setOptionSquares({});
  }, [position]);

  // Get the last move for highlighting
  const getLastMove = useCallback((): { from: string; to: string } | null => {
    if (moveHistory.length > 0 && currentMoveIndex > 0) {
      const moveIndex = Math.min(currentMoveIndex - 1, moveHistory.length - 1);
      const lastMove = moveHistory[moveIndex];
      if (lastMove) {
        return {
          from: lastMove.from,
          to: lastMove.to
        };
      }
    }
    return null;
  }, [moveHistory, currentMoveIndex]);

  // Memoize highlight styles for performance
  const highlightStyles = useMemo((): SquareStyles => {
    const lastMove = getLastMove();
    const styles: SquareStyles = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    return styles;
  }, [getLastMove]);

  // Convert arrows to react-chessboard format
  const chessboardArrows = useMemo(() => {
    return arrows.map(arrow => [arrow.from, arrow.to, arrow.color]);
  }, [arrows]);

  const handleSquareClick = useCallback((square: Square) => {
    if (disabled) return;

    // Clear previous option squares
    setOptionSquares({});

    // First click - select piece
    if (!moveFrom) {
      setMoveFrom(square);
      // Highlight the selected square
      setOptionSquares({
        [square]: {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)',
        }
      });
      return;
    }

    // Second click - same square (deselect)
    if (moveFrom === square) {
      setMoveFrom('');
      return;
    }

    // Second click - different square (attempt move)
    const moveResult = onMove(moveFrom, square);
    
    if (moveResult) {
      setMoveFrom('');
    } else {
      // If move failed, select the new square
      setMoveFrom(square);
      setOptionSquares({
        [square]: {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)',
        }
      });
    }
  }, [disabled, moveFrom, onMove]);

  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (disabled) return false;
    
    const moveResult = onMove(sourceSquare, targetSquare);
    setMoveFrom('');
    setOptionSquares({});
    return moveResult;
  }, [disabled, onMove]);

  const customSquareStyles = useMemo((): SquareStyles => ({
    ...highlightStyles,
    ...optionSquares
  }), [highlightStyles, optionSquares]);

  // Board size calculation for responsiveness
  const [boardSize, setBoardSize] = useState(600);

  useEffect(() => {
    const updateBoardSize = () => {
      const maxSize = Math.min(600, window.innerWidth - 40);
      setBoardSize(maxSize);
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  return (
    <div className="chess-board-container">
      <div className="board-wrapper">
        <Chessboard
          key={boardKey}
          position={position}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={customSquareStyles}
          boardOrientation={orientation}
          animationDuration={200}
          areArrowsAllowed={true}
          arePiecesDraggable={!disabled}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
          customDarkSquareStyle={{ 
            backgroundColor: '#779952'
          }}
          customLightSquareStyle={{ 
            backgroundColor: '#edeed1'
          }}
          customDropSquareStyle={{
            boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
          }}
          customArrows={chessboardArrows}
          customArrowColor="rgb(255,170,0)"
          boardWidth={boardSize}
        />
      </div>
      
      {/* Board status indicators */}
      <div className="board-status">
        {disabled && (
          <div className="status-badge disabled">
            Board Disabled
          </div>
        )}
        {moveFrom && !disabled && (
          <div className="status-badge selected">
            Selected: {moveFrom}
          </div>
        )}
        {arrows.length > 0 && (
          <div className="status-badge arrows">
            {arrows.length} arrow{arrows.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChessBoard);