// src/components/chess/ChessBoard.tsx
'use client';

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { ChessBoardProps, SquareStyles, Square, CustomPieceProps } from '../../types/chess';

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  position, 
  onMove, 
  moveHistory, 
  currentMoveIndex,
  orientation = 'white',
  disabled = false
}) => {
  const [moveFrom, setMoveFrom] = useState<string>('');
  const [optionSquares, setOptionSquares] = useState<SquareStyles>({});
  const [boardKey, setBoardKey] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setBoardKey(prev => prev + 1);
  }, [position]);

  // Get the last move for highlighting
  const getLastMove = useCallback((): { from: string; to: string } | null => {
    if (moveHistory.length > 0 && currentMoveIndex >= 0) {
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

  const handleSquareClick = useCallback((square: Square) => {
    if (disabled) return;

    setOptionSquares({});

    if (!moveFrom) {
      setMoveFrom(square);
      setOptionSquares({
        [square]: {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)',
        }
      });
      return;
    }

    if (moveFrom === square) {
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    const moveResult = onMove(moveFrom, square);
    
    if (moveResult) {
      setMoveFrom('');
      setOptionSquares({});
    } else {
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

  const customPieces = useMemo(() => {
    const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    
    return pieces.reduce((acc, piece) => {
      acc[piece] = ({ squareWidth, isDragging }: CustomPieceProps) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(/chess-pieces/${piece}.svg)`,
            backgroundSize: '80%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: isDragging ? 0.5 : 1,
            transition: 'opacity 0.1s ease-in-out'
          }}
        />
      );
      return acc;
    }, {} as { [piece: string]: React.ComponentType<CustomPieceProps> });
  }, []);

  const positionInfo = useMemo(() => {
    const parts = position.split(' ');
    return {
      board: parts[0] || '',
      turn: parts[1] === 'w' ? 'White' : 'Black',
      castling: parts[2] || '-',
      enPassant: parts[3] || '-',
      halfmove: parseInt(parts[4] || '0', 10),
      fullmove: parseInt(parts[5] || '1', 10)
    };
  }, [position]);

  if (!isMounted) {
    return (
      <div className="chess-board-container">
        <div className="board-wrapper">
          <div className="board-placeholder">
            <div className="placeholder-grid">
              {Array.from({ length: 64 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`placeholder-square ${(Math.floor(i / 8) + i) % 2 === 0 ? 'dark' : 'light'}`}
                />
              ))}
            </div>
            <div className="loading-overlay">
              <div className="spinner"></div>
              <span>Loading board...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}
          customDarkSquareStyle={{ backgroundColor: '#779952' }}
          customLightSquareStyle={{ backgroundColor: '#edeed1' }}
          customPieces={customPieces}
          customDropSquareStyle={{
            boxShadow: 'inset 0 0 1px 6px rgba(255,255,255,0.75)'
          }}
          customPremoveDarkSquareStyle={{ backgroundColor: '#CF664E' }}
          customPremoveLightSquareStyle={{ backgroundColor: '#F7EC74' }}
        />
      </div>
      
      <div className="board-info">
        <div className="position-info">
          <div className="info-row">
            <strong>Turn:</strong> 
            <span className={`turn-indicator ${positionInfo.turn.toLowerCase()}`}>
              {positionInfo.turn}
            </span>
          </div>
          <div className="info-row">
            <strong>Move:</strong> 
            <span>{currentMoveIndex} / {moveHistory.length}</span>
          </div>
          {positionInfo.castling !== '-' && (
            <div className="info-row">
              <strong>Castling:</strong> 
              <span>{positionInfo.castling}</span>
            </div>
          )}
          {positionInfo.enPassant !== '-' && (
            <div className="info-row">
              <strong>En passant:</strong> 
              <span>{positionInfo.enPassant}</span>
            </div>
          )}
        </div>
        
        <div className="game-status">
          {disabled && (
            <div className="status-message warning">
              Board is disabled
            </div>
          )}
          {moveFrom && !disabled && (
            <div className="status-message info">
              Selected: {moveFrom}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChessBoard);