// components/chess/SolutionDisplay.tsx - Updated with improved table styling
import React from 'react';

interface SolutionDisplayProps {
  moveSequence: Array<{ from: string; to: string; notation: string; moveNumber: number }>;
  mode: 'normal' | 'notation-only' | 'notation-with-arrows';
  onRemoveMove: (moveIndex: number) => void;
  onRemoveLastMove: () => void;
}

const ARROW_COLORS = ['#007bff', '#28a745', '#ffc107', '#6f42c1', '#dc3545', '#17a2b8', '#fd7e14', '#e83e8c'];

export const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ 
  moveSequence, 
  mode, 
  onRemoveMove, 
  onRemoveLastMove 
}) => {
  if (mode === 'normal') return null;

  // Group moves into pairs (White, Black)
  const movePairs = [];
  for (let i = 0; i < moveSequence.length; i += 2) {
    const whiteMove = moveSequence[i];
    const blackMove = moveSequence[i + 1];
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: whiteMove,
      black: blackMove,
      whiteIndex: i,
      blackIndex: i + 1
    });
  }

  const handleCopyNotation = () => {
    const notation = moveSequence.map(m => m.notation).join(' ');
    navigator.clipboard.writeText(notation).then(() => {
      // You can add toast notification here
      console.log('Notation copied to clipboard');
    });
  };

  const handleExportPGN = () => {
    // Generate proper PGN format
    let pgn = '';
    for (let i = 0; i < moveSequence.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moveSequence[i];
      const blackMove = moveSequence[i + 1];
      
      pgn += `${moveNum}. ${whiteMove.notation}`;
      if (blackMove) {
        pgn += ` ${blackMove.notation}`;
      }
      pgn += ' ';
    }
    
    const fullPgn = `[Event "Chess Editor Study"]
[Site "LearnSpark"]
[Date "${new Date().toISOString().split('T')[0]}"]
[Round "1"]
[White "Player"]
[Black "Player"]
[Result "*"]

${pgn.trim()} *`;
    
    navigator.clipboard.writeText(fullPgn);
    console.log('PGN exported to clipboard');
  };

  return (
    <div className="solution-display">
      <div className="solution-header">
        <h4>
          <span>🎯</span>
          Solution Sequence
        </h4>
        <div className="solution-controls">
          {moveSequence.length > 0 && (
            <button 
              className="remove-last-move-btn"
              onClick={onRemoveLastMove}
              title="Remove last move"
            >
              ↶ Undo Last
            </button>
          )}
        </div>
      </div>

      <div className="solution-content">
        {moveSequence.length === 0 ? (
          <div className="no-moves">
            <p>No moves recorded yet. Start making moves!</p>
          </div>
        ) : (
          <>
            <div className="solution-table-container">
              <table className="solution-table">
                <thead>
                  <tr>
                    <th className="move-number-header">#</th>
                    <th className="white-move-header">White</th>
                    <th className="black-move-header">Black</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movePairs.map((pair, pairIndex) => (
                    <tr key={pairIndex} className="move-entry">
                      <td className="move-number-cell">
                        <span className="move-number">{pair.moveNumber}</span>
                      </td>
                      
                      {/* White Move */}
                      <td className="white-move-cell">
                        {pair.white && (
                          <div className="move-content">
                            <span className="move-notation white-move">
                              {pair.white.notation}
                            </span>
                            <span className="move-squares">
                              {pair.white.from}→{pair.white.to}
                            </span>
                            {mode === 'notation-with-arrows' && (
                              <div 
                                className="move-arrow-indicator"
                                style={{ 
                                  backgroundColor: ARROW_COLORS[pairIndex % ARROW_COLORS.length],
                                  color: 'white'
                                }}
                              >
                                ●
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Black Move */}
                      <td className="black-move-cell">
                        {pair.black ? (
                          <div className="move-content">
                            <span className="move-notation black-move">
                              {pair.black.notation}
                            </span>
                            <span className="move-squares">
                              {pair.black.from}→{pair.black.to}
                            </span>
                            {mode === 'notation-with-arrows' && (
                              <div 
                                className="move-arrow-indicator"
                                style={{ 
                                  backgroundColor: ARROW_COLORS[pairIndex % ARROW_COLORS.length],
                                  color: 'white'
                                }}
                              >
                                ●
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="move-content empty-move">
                            <span className="move-notation empty">—</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="actions-cell">
                        <div className="action-buttons">
                          {pair.white && (
                            <button
                              className="remove-move-btn white-remove"
                              onClick={() => onRemoveMove(pair.whiteIndex)}
                              title="Remove white move and all subsequent"
                            >
                              ×
                            </button>
                          )}
                          {pair.black && (
                            <button
                              className="remove-move-btn black-remove"
                              onClick={() => onRemoveMove(pair.blackIndex)}
                              title="Remove black move and all subsequent"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="solution-summary">
              <div className="move-count">
                <strong>Total Moves:</strong> {moveSequence.length}
                <span className="move-breakdown">
                  ({Math.ceil(moveSequence.length / 2)} full moves)
                </span>
              </div>
              <div className="current-turn">
                <strong>Next Turn:</strong> 
                <span className={`turn-indicator-small ${moveSequence.length % 2 === 0 ? 'white' : 'black'}`}>
                  {moveSequence.length % 2 === 0 ? 'White' : 'Black'}
                </span>
              </div>
            </div>

            <div className="solution-actions">
              <button 
                className="solution-copy-btn"
                onClick={handleCopyNotation}
              >
                📋 Copy Notation
              </button>
              <button 
                className="solution-export-btn"
                onClick={handleExportPGN}
              >
                📤 Export PGN
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};