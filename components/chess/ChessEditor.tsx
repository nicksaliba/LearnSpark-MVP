// src/components/chess/ChessEditor.tsx - Enhanced with 3 modes
'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useTransition, 
  useDeferredValue,
  Suspense
} from 'react';
import dynamic from 'next/dynamic';
import ChessBoard from './ChessBoard';
import MoveList from './MoveList';
import StudyManager from './StudyManager';
import { useChess } from '../../hooks/useChess';
import { 
  ChessStudy, 
  ChessEditorState, 
  Annotation, 
  CreateStudyData,
  ChessError 
} from '../../types/chess';
import { 
  createNewStudy, 
  cloneStudy, 
  validateStudy,
  generateId 
} from '../../utils/chessUtils';
import './chess.css';

// Chess Editor Modes
export type ChessEditorMode = 'normal' | 'notation-only' | 'notation-with-arrows';

interface ChessEditorModeState {
  mode: ChessEditorMode;
  moveSequence: Array<{ from: string; to: string; notation: string; moveNumber: number }>;
  arrows: Array<{ from: string; to: string; color: string }>;
}

// Mode colors for arrows
const ARROW_COLORS = ['#007bff', '#28a745', '#ffc107', '#6f42c1', '#dc3545', '#17a2b8', '#fd7e14', '#e83e8c'];

// Default studies data - inline to avoid missing import
const defaultStudies: ChessStudy[] = [
  {
    id: 'basic-study',
    name: 'Basic Chess Study',
    description: 'Learn the fundamentals of chess',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['beginner', 'fundamentals'],
    chapters: [
      {
        id: 'chapter-1',
        name: 'Starting Position',
        description: 'The initial chess position',
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        annotations: {},
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// Move Input Component
const MoveInput: React.FC<{ 
  onMove: (from: string, to: string) => boolean;
  mode: ChessEditorMode;
  moveSequence: Array<{ from: string; to: string; notation: string; moveNumber: number }>;
}> = ({ onMove, mode, moveSequence }) => {
  const [moveText, setMoveText] = useState('');

  const handleSubmitMove = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moveText.trim()) return;

    // Parse algebraic notation (simplified)
    const move = moveText.trim();
    
    // For now, assume format like "e2e4" or "e2-e4"
    const cleanMove = move.replace('-', '').replace('x', '');
    
    if (cleanMove.length >= 4) {
      const from = cleanMove.substring(0, 2);
      const to = cleanMove.substring(2, 4);
      
      console.log('Attempting move from input:', from, 'to', to);
      const success = onMove(from, to);
      
      if (success) {
        setMoveText('');
      } else {
        console.warn('Invalid move:', move);
      }
    } else {
      console.warn('Invalid move format:', move);
    }
  }, [moveText, onMove]);

  return (
    <div className="move-input">
      <form onSubmit={handleSubmitMove} className="move-form">
        <div className="input-group">
          <input
            type="text"
            value={moveText}
            onChange={(e) => setMoveText(e.target.value)}
            placeholder="e2e4, Nf3, etc."
            className="move-text-input"
          />
          <button type="submit" className="move-submit-btn">
            Make Move
          </button>
        </div>
      </form>
      
      <div className="move-help">
        <small>
          Mode: {mode === 'normal' ? 'Normal Play' : mode === 'notation-only' ? 'Notation Only' : 'Notation with Arrows'}
        </small>
      </div>
    </div>
  );
};

// Solution Display Component
const SolutionDisplay: React.FC<{
  moveSequence: Array<{ from: string; to: string; notation: string; moveNumber: number }>;
  mode: ChessEditorMode;
  onRemoveMove: (moveIndex: number) => void;
  onRemoveLastMove: () => void;
}> = ({ moveSequence, mode, onRemoveMove, onRemoveLastMove }) => {
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

  return (
    <div className="solution-display">
      <div className="solution-header">
        <h4>📝 Solution</h4>
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
          <p className="no-moves">No moves recorded yet. Start making moves!</p>
        ) : (
          <>
            <div className="solution-table-container">
              <table className="solution-table">
                <thead>
                  <tr>
                    <th className="move-number-header">#</th>
                    <th className="white-move-header">White</th>
                    <th className="black-move-header">Black</th>
                  </tr>
                </thead>
                <tbody>
                  {movePairs.map((pair, pairIndex) => (
                    <tr key={pairIndex} className="move-pair-row">
                      <td className="move-number-cell">
                        <span className="move-number">{pair.moveNumber}.</span>
                      </td>
                      <td className="white-move-cell">
                        {pair.white && (
                          <div className="move-entry white-move">
                            <div className="move-content">
                              <span className="move-notation">{pair.white.notation}</span>
                              {mode === 'notation-with-arrows' && (
                                <span 
                                  className="move-arrow-indicator"
                                  style={{ 
                                    backgroundColor: ARROW_COLORS[pairIndex % ARROW_COLORS.length],
                                    color: 'white'
                                  }}
                                >
                                  ●
                                </span>
                              )}
                            </div>
                            <button
                              className="remove-move-btn white-remove"
                              onClick={() => onRemoveMove(pair.whiteIndex)}
                              title="Remove White's move and all subsequent moves"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="black-move-cell">
                        {pair.black && (
                          <div className="move-entry black-move">
                            <div className="move-content">
                              <span className="move-notation">{pair.black.notation}</span>
                              {mode === 'notation-with-arrows' && (
                                <span 
                                  className="move-arrow-indicator"
                                  style={{ 
                                    backgroundColor: ARROW_COLORS[pairIndex % ARROW_COLORS.length],
                                    color: 'white'
                                  }}
                                >
                                  ●
                                </span>
                              )}
                            </div>
                            <button
                              className="remove-move-btn black-remove"
                              onClick={() => onRemoveMove(pair.blackIndex)}
                              title="Remove Black's move and all subsequent moves"
                            >
                              ×
                            </button>
                          </div>
                        )}
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
          </>
        )}
        
        <div className="solution-actions">
          <button 
            className="solution-copy-btn"
            onClick={() => {
              const notation = moveSequence.map(m => m.notation).join(' ');
              navigator.clipboard.writeText(notation);
            }}
          >
            📋 Copy Notation
          </button>
          <button 
            className="solution-export-btn"
            onClick={() => {
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
              
              console.log('Exported PGN:', fullPgn);
              navigator.clipboard.writeText(fullPgn);
            }}
          >
            📤 Export PGN
          </button>
        </div>
      </div>
    </div>
  );
};

// Turn Indicator Component
const TurnIndicator: React.FC<{
  currentTurn: 'w' | 'b';
  mode: ChessEditorMode;
  moveCount: number;
}> = ({ currentTurn, mode, moveCount }) => {
  return (
    <div className="turn-indicator-container">
      <div className="turn-indicator-wrapper">
        <div className="turn-info">
          <span className="turn-label">Turn:</span>
          <span className="move-count">Move {Math.floor(moveCount / 2) + 1}</span>
        </div>
        <div className={`turn-circle ${currentTurn === 'w' ? 'white-turn' : 'black-turn'}`}>
          <div className="turn-inner-circle"></div>
        </div>
        <div className="turn-text">
          {currentTurn === 'w' ? 'White' : 'Black'} to move
        </div>
      </div>
      {mode !== 'normal' && (
        <div className="turn-mode-indicator">
          <small>
            {mode === 'notation-only' ? '📝 Recording notation' : '🏹 Recording with arrows'}
          </small>
        </div>
      )}
    </div>
  );
};

// Mode Selector Component
const ModeSelector: React.FC<{
  currentMode: ChessEditorMode;
  onModeChange: (mode: ChessEditorMode) => void;
  onClearSequence: () => void;
}> = ({ currentMode, onModeChange, onClearSequence }) => {
  return (
    <div className="mode-selector">
      <h4>🎮 Editor Mode</h4>
      <div className="mode-buttons">
        <button
          className={`mode-btn ${currentMode === 'normal' ? 'active' : ''}`}
          onClick={() => onModeChange('normal')}
          title="Normal chess play with piece movement"
        >
          <span className="mode-icon">♟️</span>
          <span className="mode-name">Normal</span>
          <small>Pieces move normally</small>
        </button>
        
        <button
          className={`mode-btn ${currentMode === 'notation-only' ? 'active' : ''}`}
          onClick={() => onModeChange('notation-only')}
          title="Record moves without moving pieces"
        >
          <span className="mode-icon">📝</span>
          <span className="mode-name">Notation Only</span>
          <small>Generate notation, pieces stay put</small>
        </button>
        
        <button
          className={`mode-btn ${currentMode === 'notation-with-arrows' ? 'active' : ''}`}
          onClick={() => onModeChange('notation-with-arrows')}
          title="Record moves with colored arrows"
        >
          <span className="mode-icon">🏹</span>
          <span className="mode-name">Arrows & Notation</span>
          <small>Show arrows + generate notation</small>
        </button>
      </div>
      
      <div className="mode-actions">
        <button 
          className="clear-sequence-btn"
          onClick={onClearSequence}
          title="Clear all recorded moves"
        >
          🗑️ Clear Sequence
        </button>
      </div>
      
      {currentMode === 'notation-with-arrows' && (
        <div className="arrow-legend">
          <h5>Arrow Colors</h5>
          <div className="color-legend">
            {ARROW_COLORS.slice(0, 4).map((color, index) => (
              <div key={index} className="color-item">
                <span 
                  className="color-dot"
                  style={{ backgroundColor: color }}
                ></span>
                <span>Move {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChessEditor: React.FC = () => {
  const [state, setState] = useState<ChessEditorState>({
    currentStudy: null,
    currentChapter: 0,
    studies: defaultStudies,
    annotations: {},
    newComment: '',
    isLoading: false,
    error: null
  });

  // Mode state
  const [modeState, setModeState] = useState<ChessEditorModeState>({
    mode: 'normal',
    moveSequence: [],
    arrows: []
  });

  // React transitions for non-urgent updates
  const [isPending, startTransition] = useTransition();
  const deferredStudies = useDeferredValue(state.studies);

  // Enhanced error handling
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // Optimistic updates for better UX
  const [optimisticStudies, setOptimisticStudies] = useState(state.studies);

  const {
    chess,
    position,
    moveHistory,
    currentMoveIndex,
    gameState,
    makeMove,
    goToMove,
    resetGame,
    loadPosition,
    loadPgn
  } = useChess();

  // Check if we're on the client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateState = useCallback((updates: Partial<ChessEditorState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
    
    // Update optimistic state immediately
    if (updates.studies) {
      setOptimisticStudies(updates.studies);
    }
  }, []);

  const handleError = useCallback((error: string | ChessError) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    updateState({ error: errorMessage, isLoading: false });
    
    if (typeof error === 'object') {
      setAsyncError(error);
    }
    
    console.error('Chess Editor Error:', error);
  }, [updateState]);

  const handleLoadStudy = useCallback((study: ChessStudy) => {
    try {
      console.log('Loading study:', study);
      
      if (!validateStudy(study)) {
        console.error('Study validation failed:', study);
        throw new Error('Invalid study format');
      }

      updateState({
        currentStudy: study,
        currentChapter: 0,
        error: null
      });

      const chapter = study.chapters[0];
      if (chapter) {
        console.log('Loading chapter:', chapter);
        console.log('Chapter FEN:', chapter.startingFen);
        
        const success = loadPosition(chapter.startingFen);
        if (!success) {
          console.warn('Failed to load chapter FEN, using default position');
          const fallbackSuccess = loadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
          if (!fallbackSuccess) {
            throw new Error('Failed to load chapter position and fallback failed');
          }
        }
        updateState({ annotations: chapter.annotations || {} });
      }
    } catch (error) {
      console.error('Error in handleLoadStudy:', error);
      handleError(error as ChessError);
    }
  }, [loadPosition, updateState, handleError]);

  // Load the first study by default (only on client)
  useEffect(() => {
    if (isClient && state.studies.length > 0 && !state.currentStudy) {
      try {
        console.log('Auto-loading first study:', state.studies[0]);
        handleLoadStudy(state.studies[0]);
      } catch (error) {
        console.error('Failed to auto-load first study:', error);
        updateState({ error: 'Failed to load default study' });
      }
    }
  }, [state.studies, state.currentStudy, isClient, handleLoadStudy, updateState]);

  const handleLoadChapter = useCallback((chapterIndex: number) => {
    if (!state.currentStudy || !state.currentStudy.chapters[chapterIndex]) {
      handleError('Invalid chapter index');
      return;
    }

    try {
      updateState({ currentChapter: chapterIndex, error: null });
      
      const chapter = state.currentStudy.chapters[chapterIndex];
      console.log('Loading chapter:', chapterIndex, chapter);
      
      const success = loadPosition(chapter.startingFen);
      if (!success) {
        console.warn('Failed to load chapter FEN, using default position');
        const fallbackSuccess = loadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        if (!fallbackSuccess) {
          throw new Error('Failed to load chapter position and fallback failed');
        }
      }
      
      updateState({ annotations: chapter.annotations || {} });
    } catch (error) {
      handleError(error as ChessError);
    }
  }, [state.currentStudy, loadPosition, updateState, handleError]);

  const handleMove = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    try {
      console.log('=== MOVE ATTEMPT ===');
      console.log('ChessEditor.handleMove called:', sourceSquare, 'to', targetSquare);
      console.log('Current mode:', modeState.mode);
      console.log('Current position before move:', position);
      
      // For notation-only modes, we need to validate the move but not actually make it on the board
      if (modeState.mode === 'notation-only' || modeState.mode === 'notation-with-arrows') {
        // Create a chess instance from the CURRENT theoretical position based on our move sequence
        const tempChess = new (require('chess.js').Chess)();
        
        // Replay all moves from the sequence to get the current theoretical position
        try {
          for (const move of modeState.moveSequence) {
            const moveResult = tempChess.move({
              from: move.from,
              to: move.to,
              promotion: 'q'
            });
            if (!moveResult) {
              console.error('Failed to replay move:', move);
              break;
            }
          }
          
          console.log('Current theoretical position:', tempChess.fen());
          console.log('Current turn:', tempChess.turn() === 'w' ? 'White' : 'Black');
          
          // Now try to make the new move from this position
          const moveResult = tempChess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
          });
          
          if (moveResult) {
            // Valid move - add to sequence but don't update the actual board
            const notation = moveResult.san;
            const moveNumber = Math.floor(modeState.moveSequence.length / 2) + 1;
            
            const newMove = {
              from: sourceSquare,
              to: targetSquare,
              notation: notation,
              moveNumber: moveNumber
            };
            
            // Update move sequence
            const newSequence = [...modeState.moveSequence, newMove];
            
            // Handle arrows for arrow mode
            let newArrows = [...modeState.arrows];
            if (modeState.mode === 'notation-with-arrows') {
              const arrowColor = ARROW_COLORS[Math.floor(modeState.moveSequence.length / 2) % ARROW_COLORS.length];
              newArrows.push({
                from: sourceSquare,
                to: targetSquare,
                color: arrowColor
              });
            }
            
            setModeState({
              ...modeState,
              moveSequence: newSequence,
              arrows: newArrows
            });
            
            console.log('Move added to sequence:', notation);
            console.log('New sequence length:', newSequence.length);
            console.log('Next turn:', newSequence.length % 2 === 0 ? 'White' : 'Black');
            console.log('=== END MOVE ATTEMPT (NOTATION MODE) ===');
            return true;
          } else {
            console.log('Invalid move in notation mode for current turn');
            return false;
          }
        } catch (error) {
          console.log('Move validation failed:', error);
          return false;
        }
      } else {
        // Normal mode - actually make the move
        const move = makeMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });
        
        console.log('Move result from makeMove:', move);
        console.log('New position after move:', position);
        console.log('=== END MOVE ATTEMPT (NORMAL MODE) ===');
        
        const success = move !== null;
        if (!success) {
          console.warn('Move was rejected as invalid');
        }
        
        return success;
      }
    } catch (error) {
      console.error('ChessEditor.handleMove error:', error);
      handleError(error as ChessError);
      return false;
    }
  }, [makeMove, position, handleError, modeState]);

  // Get current turn for notation modes
  const getCurrentTurn = useCallback((): 'w' | 'b' => {
    if (modeState.mode === 'normal') {
      return position.split(' ')[1] as 'w' | 'b';
    } else {
      // In notation modes, determine turn from move sequence length
      return modeState.moveSequence.length % 2 === 0 ? 'w' : 'b';
    }
  }, [modeState.mode, modeState.moveSequence.length, position]);

  const handleRemoveLastMove = useCallback(() => {
    if (modeState.moveSequence.length === 0) return;
    
    const newSequence = modeState.moveSequence.slice(0, -1);
    let newArrows = [...modeState.arrows];
    
    // Remove the last arrow if in arrow mode
    if (modeState.mode === 'notation-with-arrows' && modeState.arrows.length > 0) {
      newArrows = modeState.arrows.slice(0, -1);
    }
    
    setModeState({
      ...modeState,
      moveSequence: newSequence,
      arrows: newArrows
    });
    
    console.log('Removed last move, new sequence length:', newSequence.length);
  }, [modeState]);

  const handleRemoveMove = useCallback((moveIndex: number) => {
    if (moveIndex < 0 || moveIndex >= modeState.moveSequence.length) return;
    
    // Remove the move and all subsequent moves
    const newSequence = modeState.moveSequence.slice(0, moveIndex);
    let newArrows = [...modeState.arrows];
    
    // Remove corresponding arrows if in arrow mode
    if (modeState.mode === 'notation-with-arrows') {
      newArrows = modeState.arrows.slice(0, moveIndex);
    }
    
    setModeState({
      ...modeState,
      moveSequence: newSequence,
      arrows: newArrows
    });
    
    console.log('Removed move at index', moveIndex, 'new sequence length:', newSequence.length);
  }, [modeState]);

  const handleModeChange = useCallback((newMode: ChessEditorMode) => {
    console.log('Changing mode from', modeState.mode, 'to', newMode);
    setModeState({
      ...modeState,
      mode: newMode,
      // Clear sequence when changing modes
      moveSequence: [],
      arrows: []
    });
  }, [modeState]);

  const handleClearSequence = useCallback(() => {
    setModeState({
      ...modeState,
      moveSequence: [],
      arrows: []
    });
  }, [modeState]);

  const handleAddAnnotation = useCallback((moveIndex: number) => {
    if (!state.newComment.trim()) return;

    try {
      const updatedAnnotations: Annotation = {
        ...state.annotations,
        [moveIndex]: state.newComment.trim()
      };

      updateState({ 
        annotations: updatedAnnotations,
        newComment: '',
        error: null
      });

      // Save to current study
      if (state.currentStudy) {
        const updatedStudies = state.studies.map(study => 
          study.id === state.currentStudy!.id 
            ? {
                ...study,
                updatedAt: new Date().toISOString(),
                chapters: study.chapters.map((chapter, index) => 
                  index === state.currentChapter 
                    ? { 
                        ...chapter, 
                        annotations: updatedAnnotations,
                        updatedAt: new Date().toISOString()
                      }
                    : chapter
                )
              }
            : study
        );
        updateState({ studies: updatedStudies });
      }
    } catch (error) {
      handleError('Failed to add annotation');
    }
  }, [state.newComment, state.annotations, state.currentStudy, state.studies, state.currentChapter, updateState, handleError]);

  const handleCreateStudy = useCallback((studyData: CreateStudyData) => {
    try {
      const tempStudy = createNewStudy(
        studyData.name,
        studyData.description,
        studyData.startingFen
      );
      
      setOptimisticStudies(prev => [...prev, tempStudy]);
      updateState({ isLoading: true, error: null });

      startTransition(() => {
        try {
          const newStudy = createNewStudy(
            studyData.name,
            studyData.description,
            studyData.startingFen
          );

          const updatedStudies = [...state.studies, newStudy];
          updateState({ 
            studies: updatedStudies,
            isLoading: false
          });
          
          handleLoadStudy(newStudy);
        } catch (error) {
          setOptimisticStudies(state.studies);
          handleError('Failed to create study');
        }
      });
    } catch (error) {
      setOptimisticStudies(state.studies);
      handleError('Failed to create study');
    }
  }, [state.studies, updateState, handleError, handleLoadStudy, startTransition]);

  const handleDeleteStudy = useCallback((studyId: string) => {
    try {
      const originalStudies = state.studies;
      const updatedStudies = state.studies.filter(study => study.id !== studyId);
      setOptimisticStudies(updatedStudies);

      startTransition(() => {
        try {
          updateState({ studies: updatedStudies });

          if (state.currentStudy && state.currentStudy.id === studyId) {
            if (updatedStudies.length > 0) {
              handleLoadStudy(updatedStudies[0]);
            } else {
              updateState({ 
                currentStudy: null,
                currentChapter: 0,
                annotations: {}
              });
            }
          }
        } catch (error) {
          setOptimisticStudies(originalStudies);
          handleError('Failed to delete study');
        }
      });
    } catch (error) {
      handleError('Failed to delete study');
    }
  }, [state.studies, state.currentStudy, updateState, handleError, handleLoadStudy, startTransition]);

  const handleResetGame = useCallback(() => {
    try {
      resetGame();
      updateState({ error: null });
      // Clear sequence when resetting
      setModeState({
        ...modeState,
        moveSequence: [],
        arrows: []
      });
    } catch (error) {
      handleError('Failed to reset game');
    }
  }, [resetGame, updateState, handleError, modeState]);

  const handleGoToMove = useCallback((moveIndex: number) => {
    try {
      const success = goToMove(moveIndex);
      if (!success) {
        throw new Error('Failed to navigate to move');
      }
      updateState({ error: null });
    } catch (error) {
      handleError('Failed to navigate to move');
    }
  }, [goToMove, updateState, handleError]);

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="chess-editor loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Initializing chess editor...</span>
        </div>
      </div>
    );
  }

  if (asyncError) {
    throw asyncError;
  }

  if (state.isLoading || isPending) {
    return (
      <div className="chess-editor loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="chess-editor loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading chess editor...</span>
        </div>
      </div>
    }>
      <div className="chess-editor">
        <div className="chess-editor-header">
          <h1>Interactive Chess Editor</h1>
          {state.error && (
            <div className="error-message">
              <span>⚠️ {state.error}</span>
              <button 
                onClick={() => updateState({ error: null })}
                className="error-dismiss"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Mode Selector */}
          <ModeSelector
            currentMode={modeState.mode}
            onModeChange={handleModeChange}
            onClearSequence={handleClearSequence}
          />
          
          <div className="study-selector">
            {state.currentStudy && (
              <>
                <h2>{state.currentStudy.name}</h2>
                <div className="chapter-tabs">
                  {state.currentStudy.chapters.map((chapter, index) => (
                    <button
                      key={chapter.id || index}
                      className={`chapter-tab ${index === state.currentChapter ? 'active' : ''}`}
                      onClick={() => handleLoadChapter(index)}
                      type="button"
                    >
                      {chapter.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="chess-editor-content">
          <div className="chess-board-section">
            <ChessBoard
              position={position}
              onMove={handleMove}
              moveHistory={modeState.mode === 'normal' ? moveHistory : []}
              currentMoveIndex={modeState.mode === 'normal' ? currentMoveIndex : 0}
              arrows={modeState.mode === 'notation-with-arrows' ? modeState.arrows : []}
              disabled={false}
            />
            
            <div className="game-controls">
              <button 
                onClick={handleResetGame} 
                className="control-btn"
                type="button"
              >
                Reset Game
              </button>
              {modeState.mode === 'normal' && (
                <>
                  <button 
                    onClick={() => handleGoToMove(0)} 
                    className="control-btn"
                    disabled={currentMoveIndex === 0}
                    type="button"
                  >
                    ⏮ Start
                  </button>
                  <button 
                    onClick={() => handleGoToMove(currentMoveIndex - 1)} 
                    className="control-btn"
                    disabled={currentMoveIndex === 0}
                    type="button"
                  >
                    ◀ Previous
                  </button>
                  <button 
                    onClick={() => handleGoToMove(currentMoveIndex + 1)} 
                    className="control-btn"
                    disabled={currentMoveIndex >= moveHistory.length}
                    type="button"
                  >
                    Next ▶
                  </button>
                  <button 
                    onClick={() => handleGoToMove(moveHistory.length)} 
                    className="control-btn"
                    disabled={currentMoveIndex >= moveHistory.length}
                    type="button"
                  >
                    End ⏭
                  </button>
                </>
              )}
            </div>

            {gameState.isGameOver && modeState.mode === 'normal' && (
              <div className="game-over-notice">
                <h3>Game Over</h3>
                <p>{gameState.result}</p>
              </div>
            )}

            {/* Current Position Info */}
            <div className="position-summary">
              <h4>Current Position</h4>
              <div className="position-details">
                <div className="detail-item">
                  <strong>Turn:</strong> {getCurrentTurn() === 'w' ? 'White' : 'Black'}
                </div>
                <div className="detail-item">
                  <strong>Move:</strong> 
                  {modeState.mode === 'normal' 
                    ? `${currentMoveIndex} / ${moveHistory.length}`
                    : `${modeState.moveSequence.length} recorded`
                  }
                </div>
                <div className="detail-item">
                  <strong>Mode:</strong> 
                  <span className={`mode-indicator ${modeState.mode}`}>
                    {modeState.mode === 'normal' ? 'Normal' : 
                     modeState.mode === 'notation-only' ? 'Notation Only' : 'Arrows & Notation'}
                  </span>
                </div>
                {gameState.isCheck && modeState.mode === 'normal' && (
                  <div className="detail-item check-warning">
                    <strong>⚠️ Check!</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Turn Indicator */}
            <TurnIndicator
              currentTurn={getCurrentTurn()}
              mode={modeState.mode}
              moveCount={modeState.mode === 'normal' ? moveHistory.length : modeState.moveSequence.length}
            />
          </div>

          <div className="chess-sidebar">
            {/* Solution Display for notation modes */}
            {(modeState.mode === 'notation-only' || modeState.mode === 'notation-with-arrows') && (
              <SolutionDisplay
                moveSequence={modeState.moveSequence}
                mode={modeState.mode}
                onRemoveMove={handleRemoveMove}
                onRemoveLastMove={handleRemoveLastMove}
              />
            )}
            
            <div className="move-list-section">
              <h3>Move List</h3>
              {modeState.mode === 'normal' ? (
                <MoveList
                  moves={moveHistory}
                  currentMoveIndex={currentMoveIndex}
                  onMoveClick={handleGoToMove}
                  annotations={state.annotations}
                />
              ) : (
                <div className="notation-mode-moves">
                  <p>In {modeState.mode} mode - see Solution panel for recorded moves</p>
                </div>
              )}
              
              {/* Move Input for algebraic notation */}
              <div className="move-input-section">
                <h4>Enter Move (Algebraic Notation)</h4>
                <MoveInput 
                  onMove={handleMove} 
                  mode={modeState.mode}
                  moveSequence={modeState.moveSequence}
                />
              </div>
            </div>

            <div className="annotation-section">
              <h3>Add Annotation</h3>
              <div className="annotation-input">
                <textarea
                  value={state.newComment}
                  onChange={(e) => updateState({ newComment: e.target.value })}
                  placeholder="Add a comment for the current move..."
                  rows={3}
                  aria-label="Comment for current move"
                />
                <button 
                  onClick={() => handleAddAnnotation(modeState.mode === 'normal' ? currentMoveIndex : modeState.moveSequence.length)}
                  className="add-annotation-btn"
                  disabled={!state.newComment.trim()}
                  type="button"
                >
                  Add Comment
                </button>
              </div>
            </div>

            <div className="study-manager-section">
              <h3>Study Management</h3>
              <StudyManager
                studies={optimisticStudies}
                currentStudy={state.currentStudy}
                onStudySelect={handleLoadStudy}
                onCreateStudy={handleCreateStudy}
                onDeleteStudy={handleDeleteStudy}
              />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default ChessEditor;