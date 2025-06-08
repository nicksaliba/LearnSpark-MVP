// src/components/chess/ChessEditor.tsx
'use client'; // Next.js: Mark as client component

import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useTransition, 
  useDeferredValue,
  use,
  Suspense
} from 'react';
import dynamic from 'next/dynamic';
import ChessBoard from './ChessBoard';
import MoveList from './MoveList';
import StudyManager from './StudyManager';
import { useChess } from '../../hooks/useChess';
import { defaultStudies } from '../../data/defaultStudies';
import { debugChessJs } from '../../utils/chess-debug';
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

// Next.js: Dynamic imports for heavy components (optional optimization)
const StudyAnalyzer = dynamic(
  () => import('./StudyAnalyzer'),
  { 
    ssr: false,
    loading: () => <div className="loading-component">Loading analyzer...</div>
  }
);

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

  // React 19: Use transitions for non-urgent updates
  const [isPending, startTransition] = useTransition();
  const deferredStudies = useDeferredValue(state.studies);

  // React 19: Enhanced error boundaries and async handling
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  // React 19: Optimistic updates for better UX
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

  // Next.js: Check if we're on the client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Debug chess.js in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Running chess.js debug...');
      debugChessJs();
    }
  }, []);

  const updateState = useCallback((updates: Partial<ChessEditorState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
    
    // React 19: Update optimistic state immediately
    if (updates.studies) {
      setOptimisticStudies(updates.studies);
    }
  }, []);

  const handleError = useCallback((error: string | ChessError) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    updateState({ error: errorMessage, isLoading: false });
    
    // React 19: Better error handling
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
          // Fallback to default starting position
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
        // Continue without a study loaded
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
        // Fallback to default starting position
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
      const move = makeMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Auto-promote to queen for MVP
      });
      
      return move !== null;
    } catch (error) {
      handleError(error as ChessError);
      return false;
    }
  }, [makeMove, handleError]);

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
      // React 19: Optimistic update - show new study immediately
      const tempStudy = createNewStudy(
        studyData.name,
        studyData.description,
        studyData.startingFen
      );
      
      setOptimisticStudies(prev => [...prev, tempStudy]);
      updateState({ isLoading: true, error: null });

      // Use transition for actual update
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
          // Rollback optimistic update on error
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
      // React 19: Optimistic removal
      const originalStudies = state.studies;
      const updatedStudies = state.studies.filter(study => study.id !== studyId);
      setOptimisticStudies(updatedStudies);

      startTransition(() => {
        try {
          updateState({ studies: updatedStudies });

          // If we deleted the current study, load the first available study
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
          // Rollback on error
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
    } catch (error) {
      handleError('Failed to reset game');
    }
  }, [resetGame, updateState, handleError]);

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

  // Next.js: Prevent hydration mismatch
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

  // React 19: Throw async errors to nearest error boundary
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
              moveHistory={moveHistory}
              currentMoveIndex={currentMoveIndex}
            />
            
            <div className="game-controls">
              <button 
                onClick={handleResetGame} 
                className="control-btn"
                type="button"
              >
                Reset Game
              </button>
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
            </div>

            {gameState.isGameOver && (
              <div className="game-over-notice">
                <h3>Game Over</h3>
                <p>{gameState.result}</p>
              </div>
            )}
          </div>

          <div className="chess-sidebar">
            <div className="move-list-section">
              <h3>Move List</h3>
              <MoveList
                moves={moveHistory}
                currentMoveIndex={currentMoveIndex}
                onMoveClick={handleGoToMove}
                annotations={state.annotations}
              />
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
                  onClick={() => handleAddAnnotation(currentMoveIndex)}
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

            {/* Advanced Study Analysis */}
            <div className="study-analyzer-section">
              <StudyAnalyzer
                study={state.currentStudy}
                currentChapter={state.currentChapter}
                moveHistory={moveHistory}
                currentMoveIndex={currentMoveIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default ChessEditor;