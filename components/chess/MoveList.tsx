// src/components/chess/MoveList.tsx
import React, { useMemo } from 'react';
import { MoveListProps, ChessMove } from '../../types/chess';
import { formatMoveDisplay } from '../../utils/chessUtils';

interface MovePair {
  moveNumber: number;
  white: ChessMove | null;
  black: ChessMove | null;
  whiteIndex: number;
  blackIndex: number;
}

const MoveList: React.FC<MoveListProps> = ({ 
  moves, 
  currentMoveIndex, 
  onMoveClick, 
  annotations 
}) => {
  // Group moves into pairs (white move, black move)
  const movePairs = useMemo((): MovePair[] => {
    const pairs: MovePair[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      const whiteMove = moves[i] || null;
      const blackMove = moves[i + 1] || null;
      pairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        white: whiteMove,
        black: blackMove,
        whiteIndex: i,
        blackIndex: i + 1
      });
    }
    return pairs;
  }, [moves]);

  const handleMoveClick = (moveIndex: number): void => {
    onMoveClick(moveIndex + 1); // +1 because we want to show position after the move
  };

  const getMoveAnnotation = (moveIndex: number): string | undefined => {
    return annotations[moveIndex + 1];
  };

  const renderMoveButton = (
    move: ChessMove,
    moveIndex: number,
    isWhite: boolean
  ): JSX.Element => {
    const isCurrentMove = currentMoveIndex === moveIndex + 1;
    const annotation = getMoveAnnotation(moveIndex);

    return (
      <div className="move-container" key={`${moveIndex}-${isWhite ? 'w' : 'b'}`}>
        <button
          className={`move-button ${isWhite ? 'white-move' : 'black-move'} ${
            isCurrentMove ? 'current-move' : ''
          }`}
          onClick={() => handleMoveClick(moveIndex)}
          title={`Go to move ${moveIndex + 1}: ${formatMoveDisplay(move, true)}`}
          type="button"
        >
          <span className="move-text">
            {formatMoveDisplay(move)}
          </span>
          
          {/* Move indicators */}
          {move.flags.includes('c') && <span className="capture-indicator">×</span>}
          {move.flags.includes('+') && <span className="check-indicator">+</span>}
          {move.flags.includes('#') && <span className="checkmate-indicator">#</span>}
          {move.flags.includes('e') && <span className="en-passant-indicator">e.p.</span>}
          {(move.flags.includes('k') || move.flags.includes('q')) && (
            <span className="castling-indicator">O-O</span>
          )}
          {move.promotion && <span className="promotion-indicator">={move.promotion.toUpperCase()}</span>}
        </button>
        
        {annotation && (
          <div 
            className="move-annotation" 
            title={annotation}
            onClick={(e) => e.stopPropagation()}
          >
            💬
          </div>
        )}
      </div>
    );
  };

  const renderEmptyMove = (): JSX.Element => (
    <div className="move-placeholder"></div>
  );

  if (!moves || moves.length === 0) {
    return (
      <div className="move-list empty">
        <div className="empty-state">
          <div className="empty-icon">♟️</div>
          <p>No moves played yet.</p>
          <p>Start by moving a piece on the board!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="move-list">
      <div className="move-list-header">
        <span className="move-number">#</span>
        <span className="white-move">White</span>
        <span className="black-move">Black</span>
      </div>
      
      <div className="move-list-body">
        {movePairs.map((pair) => (
          <div key={pair.moveNumber} className="move-pair">
            <div className="move-number">{pair.moveNumber}.</div>
            
            {/* White move */}
            <div className="move-slot white">
              {pair.white ? renderMoveButton(pair.white, pair.whiteIndex, true) : renderEmptyMove()}
            </div>

            {/* Black move */}
            <div className="move-slot black">
              {pair.black ? renderMoveButton(pair.black, pair.blackIndex, false) : renderEmptyMove()}
            </div>
          </div>
        ))}
      </div>

      {/* Show annotations for current move */}
      {annotations[currentMoveIndex] && (
        <div className="current-annotation">
          <h4>💬 Comment for move {currentMoveIndex}:</h4>
          <div className="annotation-content">
            <p>{annotations[currentMoveIndex]}</p>
          </div>
        </div>
      )}

      <div className="move-list-footer">
        <div className="move-stats">
          <small>
            <strong>Total moves:</strong> {moves.length} | 
            <strong> Current:</strong> {currentMoveIndex} / {moves.length}
          </small>
        </div>
        <div className="navigation-hint">
          <small>
            💡 Click on any move to navigate to that position
          </small>
        </div>
        {moves.length > 0 && (
          <div className="game-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{
                  width: `${(currentMoveIndex / moves.length) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(MoveList);