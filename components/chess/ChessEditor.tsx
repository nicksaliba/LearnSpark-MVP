// src/components/chess/ChessEditor.tsx - Improved Version with Variation Tree
'use client';

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useTransition, 
  useDeferredValue,
  Suspense,
  useMemo
} from 'react';
import dynamic from 'next/dynamic';
import ChessBoard from './ChessBoard';
import MoveList from './MoveList';
import HorizontalVariationTree from './HorizontalVariationTree';
import EnhancedPuzzleManager from './EnhancedPuzzleManager';
import { useChess } from '../../hooks/useChess';
import { 
  ChessStudy, 
  ChessEditorState, 
  Annotation, 
  CreateStudyData,
  ChessError,
  ChessPuzzle,
  VariationNode
} from '../../types/chess';
import { 
  createNewStudy, 
  validateStudy,
  generateId,
  formatDate,
  formatRelativeTime
} from '../../utils/chessUtils';
import './chess.css';

// Chess Editor Modes
export type ChessEditorMode = 'normal' | 'notation-only' | 'notation-with-arrows' | 'puzzle-mode';

interface ChessEditorModeState {
  mode: ChessEditorMode;
  moveSequence: Array<{ from: string; to: string; notation: string; moveNumber: number }>;
  arrows: Array<{ from: string; to: string; color: string }>;
}

// Mode colors for arrows
const ARROW_COLORS = ['#007bff', '#28a745', '#ffc107', '#6f42c1', '#dc3545', '#17a2b8', '#fd7e14', '#e83e8c'];

// Default studies data
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

  // Puzzle state
  const [puzzles, setPuzzles] = useState<ChessPuzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [isInstructorMode, setIsInstructorMode] = useState(true);
  const [currentMoveId, setCurrentMoveId] = useState<string | null>(null);
  const [requiredNodes, setRequiredNodes] = useState<Set<string>>(new Set());
  const [revealedNodes, setRevealedNodes] = useState<Set<string>>(new Set());

  // Study manager state
  const [showStudyManager, setShowStudyManager] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateStudyData>({
    name: '',
    description: '',
    startingFen: '',
    isPublic: false,
    tags: []
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateStudyData>>({});

  // PGN Import state
  const [showPgnImport, setShowPgnImport] = useState(false);
  const [pgnText, setPgnText] = useState('');

  // React transitions for non-urgent updates
  const [isPending, startTransition] = useTransition();
  const deferredStudies = useDeferredValue(state.studies);

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
  }, []);

  const handleError = useCallback((error: string | ChessError) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    updateState({ error: errorMessage, isLoading: false });
    console.error('Chess Editor Error:', error);
  }, [updateState]);

  const clearMessages = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Get current puzzle
  const currentPuzzle = useMemo(() => {
    return puzzles[currentPuzzleIndex] || null;
  }, [puzzles, currentPuzzleIndex]);

  // Study management functions
  const handleLoadStudy = useCallback((study: ChessStudy) => {
    try {
      if (!validateStudy(study)) {
        throw new Error('Invalid study format');
      }

      updateState({
        currentStudy: study,
        currentChapter: 0,
        error: null
      });

      const chapter = study.chapters[0];
      if (chapter) {
        const success = loadPosition(chapter.startingFen);
        if (!success) {
          const fallbackSuccess = loadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
          if (!fallbackSuccess) {
            throw new Error('Failed to load chapter position');
          }
        }
        updateState({ annotations: chapter.annotations || {} });
      }
      
      setShowStudyManager(false);
    } catch (error) {
      handleError(error as ChessError);
    }
  }, [loadPosition, updateState, handleError]);

  const handleCreateStudy = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    
    // Validate form
    const errors: Partial<CreateStudyData> = {};
    if (!createFormData.name.trim()) {
      errors.name = 'Study name is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateState({ isLoading: true });

    try {
      const newStudy = createNewStudy(
        createFormData.name.trim(),
        createFormData.description?.trim(),
        createFormData.startingFen?.trim()
      );

      const updatedStudies = [...state.studies, newStudy];
      updateState({ 
        studies: updatedStudies,
        isLoading: false
      });
      
      handleLoadStudy(newStudy);
      
      // Reset form
      setCreateFormData({
        name: '',
        description: '',
        startingFen: '',
        isPublic: false,
        tags: []
      });
      setShowCreateForm(false);
    } catch (error) {
      handleError(error as ChessError);
    }
  }, [createFormData, state.studies, updateState, handleError, handleLoadStudy, clearMessages]);

  const handleDeleteStudy = useCallback((studyId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this study?');
    
    if (confirmed) {
      try {
        const updatedStudies = state.studies.filter(study => study.id !== studyId);
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
        handleError('Failed to delete study');
      }
    }
  }, [state.studies, state.currentStudy, updateState, handleError, handleLoadStudy]);

  const handleLoadChapter = useCallback((chapterIndex: number) => {
    if (!state.currentStudy || !state.currentStudy.chapters[chapterIndex]) {
      handleError('Invalid chapter index');
      return;
    }

    try {
      updateState({ currentChapter: chapterIndex, error: null });
      
      const chapter = state.currentStudy.chapters[chapterIndex];
      const success = loadPosition(chapter.startingFen);
      if (!success) {
        const fallbackSuccess = loadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        if (!fallbackSuccess) {
          throw new Error('Failed to load chapter position');
        }
      }
      
      updateState({ annotations: chapter.annotations || {} });
    } catch (error) {
      handleError(error as ChessError);
    }
  }, [state.currentStudy, loadPosition, updateState, handleError]);

  const handleMove = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    try {
      // For notation-only modes, we need to validate the move but not actually make it on the board
      if (modeState.mode === 'notation-only' || modeState.mode === 'notation-with-arrows') {
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
          
          // Now try to make the new move from this position
          const moveResult = tempChess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
          });
          
          if (moveResult) {
            const notation = moveResult.san;
            const moveNumber = Math.floor(modeState.moveSequence.length / 2) + 1;
            
            const newMove = {
              from: sourceSquare,
              to: targetSquare,
              notation: notation,
              moveNumber: moveNumber
            };
            
            const newSequence = [...modeState.moveSequence, newMove];
            
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
            
            return true;
          } else {
            return false;
          }
        } catch (error) {
          console.log('Move validation failed:', error);
          return false;
        }
      } else if (modeState.mode === 'puzzle-mode' && currentPuzzle) {
        // Puzzle mode - check if move matches a variation
        const matchingVariation = currentPuzzle.variations.find(v => 
          v.move && v.move.from === sourceSquare && v.move.to === targetSquare
        );

        if (matchingVariation) {
          // Reveal this node
          setRevealedNodes(prev => new Set([...prev, matchingVariation.id]));
          setCurrentMoveId(matchingVariation.id);
          
          // Make the actual move
          const move = makeMove({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
          });
          
          if (requiredNodes.has(matchingVariation.id)) {
            updateState({ error: null });
            // Show success message
            setTimeout(() => {
              updateState({ error: '✅ Excellent! That\'s a key move.' });
              setTimeout(clearMessages, 3000);
            }, 100);
          }
          
          return move !== null;
        } else {
          updateState({ error: '❌ This move is not part of the puzzle variations.' });
          setTimeout(clearMessages, 3000);
          return false;
        }
      } else {
        // Normal mode - actually make the move
        const move = makeMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q'
        });
        
        return move !== null;
      }
    } catch (error) {
      console.error('ChessEditor.handleMove error:', error);
      handleError(error as ChessError);
      return false;
    }
  }, [makeMove, handleError, modeState, currentPuzzle, requiredNodes, updateState, clearMessages]);

  const handleModeChange = useCallback((newMode: ChessEditorMode) => {
    setModeState({
      ...modeState,
      mode: newMode,
      moveSequence: [],
      arrows: []
    });
    
    // Reset puzzle state when leaving puzzle mode
    if (modeState.mode === 'puzzle-mode' && newMode !== 'puzzle-mode') {
      setCurrentMoveId(null);
      setRevealedNodes(new Set());
    }
  }, [modeState]);

  const handlePgnImport = useCallback(async () => {
    if (!pgnText.trim()) return;

    updateState({ isLoading: true });
    try {
      await loadPgn(pgnText.trim());
      setPgnText('');
      setShowPgnImport(false);
      updateState({ isLoading: false });
    } catch (error) {
      handleError('Failed to import PGN');
    }
  }, [pgnText, loadPgn, updateState, handleError]);

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

  // Puzzle-related callbacks
  const handleLoadPuzzles = useCallback((loadedPuzzles: ChessPuzzle[]) => {
    setPuzzles(loadedPuzzles);
    setCurrentPuzzleIndex(0);
    
    if (loadedPuzzles.length > 0) {
      const firstPuzzle = loadedPuzzles[0];
      loadPosition(firstPuzzle.fen);
      
      // Initialize required nodes
      const requiredNodesSet = new Set(
        firstPuzzle.variations
          .filter(v => v.isRequired)
          .map(v => v.id)
      );
      setRequiredNodes(requiredNodesSet);
      setRevealedNodes(new Set(['move-1'])); // Reveal first move
      setCurrentMoveId(null);
    }
  }, [loadPosition]);

  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    setCurrentMoveId(nodeId);
    loadPosition(fen);
  }, [loadPosition]);

  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!isInstructorMode || !currentPuzzle) return;
    
    setRequiredNodes(prev => {
      const newSet = new Set(prev);
      if (required) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
    
    // Update the puzzle data
    const updatedPuzzles = puzzles.map(puzzle => {
      if (puzzle.id === currentPuzzle.id) {
        const updatedVariations = puzzle.variations.map(variation =>
          variation.id === nodeId ? { ...variation, isRequired: required } : variation
        );
        
        const updatedRequiredVariations = required
          ? [...puzzle.requiredVariations, nodeId]
          : puzzle.requiredVariations.filter(id => id !== nodeId);

        return {
          ...puzzle,
          variations: updatedVariations,
          requiredVariations: updatedRequiredVariations
        };
      }
      return puzzle;
    });
    
    setPuzzles(updatedPuzzles);
  }, [isInstructorMode, currentPuzzle, puzzles]);

  // Load the first study by default (only on client)
  useEffect(() => {
    if (isClient && state.studies.length > 0 && !state.currentStudy) {
      try {
        handleLoadStudy(state.studies[0]);
      } catch (error) {
        console.error('Failed to auto-load first study:', error);
        updateState({ error: 'Failed to load default study' });
      }
    }
  }, [state.studies, state.currentStudy, isClient, handleLoadStudy, updateState]);

  // Sort studies by last updated
  const sortedStudies = useMemo(() => {
    return [...deferredStudies].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [deferredStudies]);

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
                onClick={clearMessages}
                className="error-dismiss"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="study-info-bar">
            {state.currentStudy ? (
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
            ) : (
              <p>No study loaded</p>
            )}
            
            <button
              className="manage-studies-btn"
              onClick={() => setShowStudyManager(!showStudyManager)}
              type="button"
            >
              📚 Manage Studies
            </button>
          </div>
        </div>

        <div className="chess-editor-content">
          <div className="chess-board-section">
            {/* Mode Selector */}
            <div className="mode-selector">
              <h4>🎮 Editor Mode</h4>
              <div className="mode-buttons">
                <button
                  className={`mode-btn ${modeState.mode === 'normal' ? 'active' : ''}`}
                  onClick={() => handleModeChange('normal')}
                  title="Normal chess play with piece movement"
                >
                  <span className="mode-icon">♟️</span>
                  <span className="mode-name">Normal</span>
                  <small>Pieces move normally</small>
                </button>
                
                <button
                  className={`mode-btn ${modeState.mode === 'notation-only' ? 'active' : ''}`}
                  onClick={() => handleModeChange('notation-only')}
                  title="Record moves without moving pieces"
                >
                  <span className="mode-icon">📝</span>
                  <span className="mode-name">Notation Only</span>
                  <small>Generate notation</small>
                </button>
                
                <button
                  className={`mode-btn ${modeState.mode === 'notation-with-arrows' ? 'active' : ''}`}
                  onClick={() => handleModeChange('notation-with-arrows')}
                  title="Record moves with colored arrows"
                >
                  <span className="mode-icon">🏹</span>
                  <span className="mode-name">Arrows & Notation</span>
                  <small>Show arrows + notation</small>
                </button>
                
                <button
                  className={`mode-btn ${modeState.mode === 'puzzle-mode' ? 'active' : ''}`}
                  onClick={() => handleModeChange('puzzle-mode')}
                  title="Puzzle solving mode with variation trees"
                >
                  <span className="mode-icon">🧩</span>
                  <span className="mode-name">Puzzle Mode</span>
                  <small>Study with variations</small>
                </button>
              </div>
              
              {modeState.mode === 'puzzle-mode' && (
                <div className="puzzle-mode-controls">
                  <button
                    className={`instructor-toggle ${isInstructorMode ? 'active' : ''}`}
                    onClick={() => setIsInstructorMode(!isInstructorMode)}
                  >
                    {isInstructorMode ? '👨‍🏫 Instructor' : '👨‍🎓 Student'} View
                  </button>
                </div>
              )}
            </div>

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
                onClick={resetGame} 
                className="control-btn"
                type="button"
              >
                Reset Game
              </button>
              <button
                onClick={() => setShowPgnImport(true)}
                className="control-btn"
                type="button"
              >
                📥 Import PGN
              </button>
              {modeState.mode === 'normal' && (
                <>
                  <button 
                    onClick={() => goToMove(0)} 
                    className="control-btn"
                    disabled={currentMoveIndex === 0}
                    type="button"
                  >
                    ⏮ Start
                  </button>
                  <button 
                    onClick={() => goToMove(currentMoveIndex - 1)} 
                    className="control-btn"
                    disabled={currentMoveIndex === 0}
                    type="button"
                  >
                    ◀ Previous
                  </button>
                  <button 
                    onClick={() => goToMove(currentMoveIndex + 1)} 
                    className="control-btn"
                    disabled={currentMoveIndex >= moveHistory.length}
                    type="button"
                  >
                    Next ▶
                  </button>
                  <button 
                    onClick={() => goToMove(moveHistory.length)} 
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

            {/* Puzzle Manager for Puzzle Mode */}
            {modeState.mode === 'puzzle-mode' && (
              <EnhancedPuzzleManager
                onLoadPosition={loadPosition}
                onLoadPuzzles={handleLoadPuzzles}
                isInstructor={isInstructorMode}
              />
            )}
          </div>

          <div className="chess-sidebar">
            {/* Variation Tree for Puzzle Mode */}
            {modeState.mode === 'puzzle-mode' && currentPuzzle && (
              <div className="variation-tree-section">
                <HorizontalVariationTree
                  variations={currentPuzzle.variations}
                  currentMoveId={currentMoveId}
                  onMoveClick={handleVariationMoveClick}
                  onToggleRequired={handleToggleRequired}
                  isInstructor={isInstructorMode}
                  requiredNodes={requiredNodes}
                  revealedNodes={revealedNodes}
                  showOnlyRequired={false}
                  title={currentPuzzle.title}
                />
              </div>
            )}

            <div className="move-list-section">
              <h3>Move List</h3>
              {modeState.mode === 'normal' ? (
                <MoveList
                  moves={moveHistory}
                  currentMoveIndex={currentMoveIndex}
                  onMoveClick={goToMove}
                  annotations={state.annotations}
                />
              ) : modeState.mode === 'puzzle-mode' ? (
                <div className="puzzle-mode-moves">
                  <p>Moves are shown in the variation tree above</p>
                </div>
              ) : (
                <div className="notation-mode-moves">
                  <p>In {modeState.mode} mode - moves are recorded separately</p>
                  {modeState.moveSequence.length > 0 && (
                    <div className="recorded-moves">
                      {modeState.moveSequence.map((move, index) => (
                        <span key={index} className="recorded-move">
                          {move.notation}{' '}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
          </div>
        </div>

        {/* Study Manager Modal */}
        {showStudyManager && (
          <div className="modal-overlay" onClick={() => setShowStudyManager(false)}>
            <div className="study-manager-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Study Manager</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowStudyManager(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="study-actions">
                  <button
                    className="create-study-btn primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    type="button"
                  >
                    {showCreateForm ? 'Cancel' : '+ New Study'}
                  </button>
                </div>

                {showCreateForm && (
                  <form className="create-study-form" onSubmit={handleCreateStudy}>
                    <div className="form-group">
                      <label htmlFor="study-name">
                        Study Name <span className="required">*</span>
                      </label>
                      <input
                        id="study-name"
                        type="text"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        placeholder="Enter study name..."
                        required
                      />
                      {formErrors.name && (
                        <span className="error-text">{formErrors.name}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="study-description">Description</label>
                      <textarea
                        id="study-description"
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        placeholder="Describe what this study covers..."
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="starting-fen">Starting Position (FEN)</label>
                      <input
                        id="starting-fen"
                        type="text"
                        value={createFormData.startingFen}
                        onChange={(e) => setCreateFormData({ ...createFormData, startingFen: e.target.value })}
                        placeholder="Leave empty for starting position..."
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn primary">
                        Create Study
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn secondary"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="study-list">
                  <h3>Your Studies ({sortedStudies.length})</h3>
                  
                  {sortedStudies.length === 0 ? (
                    <div className="no-studies">
                      <p>No studies yet. Create your first study!</p>
                    </div>
                  ) : (
                    <div className="studies">
                      {sortedStudies.map((study) => (
                        <div
                          key={study.id}
                          className={`study-item ${state.currentStudy?.id === study.id ? 'active' : ''}`}
                        >
                          <div className="study-content" onClick={() => handleLoadStudy(study)}>
                            <h4>{study.name}</h4>
                            {study.description && <p>{study.description}</p>}
                            <div className="study-meta">
                              <span>{study.chapters.length} chapters</span>
                              <span>Updated {formatRelativeTime(study.updatedAt || study.createdAt)}</span>
                            </div>
                          </div>
                          <div className="study-actions-menu">
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudy(study.id);
                              }}
                              title="Delete study"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PGN Import Modal */}
        {showPgnImport && (
          <div className="modal-overlay" onClick={() => setShowPgnImport(false)}>
            <div className="pgn-import-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Import PGN</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowPgnImport(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-content">
                <textarea
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                  placeholder="Paste PGN content here..."
                  rows={12}
                  className="pgn-textarea"
                />
                
                <div className="modal-actions">
                  <button
                    className="import-btn primary"
                    onClick={handlePgnImport}
                    disabled={!pgnText.trim() || state.isLoading}
                  >
                    {state.isLoading ? 'Loading...' : 'Import Game'}
                  </button>
                  <button
                    className="cancel-btn secondary"
                    onClick={() => {
                      setShowPgnImport(false);
                      setPgnText('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default ChessEditor;