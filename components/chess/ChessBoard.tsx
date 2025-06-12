import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

interface ChessBoardProps {
  position: string;
  onMove: (from: string, to: string) => boolean;
  lastMove?: {
    from: string;
    to: string;
    san: string;
  } | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ position, onMove, lastMove }) => {
  const [chess] = useState(() => new Chess(position));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  
  // Update chess position when prop changes
  useEffect(() => {
    try {
      chess.load(position);
    } catch (error) {
      console.error('Invalid FEN:', position);
    }
  }, [position, chess]);

  const board = chess.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const pieceSymbols: Record<string, string> = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  };

  const handleSquareClick = (file: number, rank: number) => {
    const square = `${files[file]}${ranks[rank]}`;
    
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }
      
      // Try to make move
      const moveResult = onMove(selectedSquare, square);
      setSelectedSquare(null);
    } else {
      const piece = board[rank][file];
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const isHighlighted = (file: number, rank: number): string => {
    const square = `${files[file]}${ranks[rank]}`;
    if (lastMove && (lastMove.from === square || lastMove.to === square)) {
      return 'last-move';
    }
    if (selectedSquare === square) {
      return 'selected';
    }
    return '';
  };

  return (
    <div className="chess-board">
      {ranks.map((rank, rankIndex) => (
        <div key={rank} className="board-rank">
          {files.map((file, fileIndex) => {
            const piece = board[rankIndex][fileIndex];
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const highlight = isHighlighted(fileIndex, rankIndex);
            
            return (
              <div
                key={`${file}${rank}`}
                className={`square ${isLight ? 'light' : 'dark'} ${highlight}`}
                onClick={() => handleSquareClick(fileIndex, rankIndex)}
              >
                <div className="square-label">
                  {fileIndex === 0 && <span className="rank-label">{rank}</span>}
                  {rankIndex === 7 && <span className="file-label">{file}</span>}
                </div>
                {piece && (
                  <div className="piece">
                    {pieceSymbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ChessBoard;