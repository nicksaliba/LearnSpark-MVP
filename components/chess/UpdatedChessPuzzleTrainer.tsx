// components/chess/UpdatedChessPuzzleTrainer.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ChessBoard from './ChessBoard';
import EnhancedPuzzleManager from './EnhancedPuzzleManager';
import { useChess } from '../../hooks/useChess';
import { EnhancedPGNParser, ChessPuzzle, VariationNode } from '../../utils/enhancedPgnParser';

interface PuzzleTrainerState {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  isInstructorMode: boolean;
  currentMoveId: string | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  showSolution: boolean;
  studentProgress: {
    [puzzleId: string]: {
      completed: boolean;
      attempts: number;
      lastAttempt: Date;
      requiredVariationsCompleted: string[];
    };
  };
}

interface MoveAttempt {
  from: string;
  to: string;
  correct: boolean;
  timestamp: Date;
}

const UpdatedChessPuzzleTrainer: React.FC = () => {
  const [state, setState] = useState<PuzzleTrainerState>({
    puzzles: [],
    currentPuzzleIndex: 0,
    isInstructorMode: true, // Start in instructor mode for demo
    currentMoveId: null,
    isLoading: false,
    error: null,
    success: null,
    showSolution: false,
    studentProgress: {}
  });

  const [moveAttempts, setMoveAttempts] = useState<MoveAttempt[]>([]);
  const [currentVariationPath, setCurrentVariationPath] = useState<string[]>([]);

  const {
    chess,
    position,
    moveHistory,
    currentMoveIndex,
    gameState,
    makeMove,
    goToMove,
    resetGame,
    loadPosition
  } = useChess();

  const currentPuzzle = useMemo(() => {
    return state.puzzles[state.currentPuzzleIndex] || null;
  }, [state.puzzles, state.currentPuzzleIndex]);

  const updateState = useCallback((updates: Partial<PuzzleTrainerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    updateState({ error: null, success: null });
  }, [updateState]);

  // Toggle between instructor and student modes
  const toggleMode = useCallback(() => {
    updateState({ 
      isInstructorMode: !state.isInstructorMode,
      showSolution: false 
    });
    clearMessages();
  }, [state.isInstructorMode, updateState, clearMessages]);

  // Handle puzzle loading from manager
  const handleLoadPuzzles = useCallback((puzzles: ChessPuzzle[]) => {
    updateState({ 
      puzzles,
      currentPuzzleIndex: 0,
      currentMoveId: null,
      showSolution: false
    });
    
    if (puzzles.length > 0) {
      loadPosition(puzzles[0].fen);
      setCurrentVariationPath([]);
      setMoveAttempts([]);
    }
  }, [updateState, loadPosition]);

  // Handle position loading from manager
  const handleLoadPosition = useCallback((fen: string) => {
    loadPosition(fen);
  }, [loadPosition]);

  // Handle move attempts (for students)
  const handleMoveAttempt = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (!currentPuzzle || state.isInstructorMode) {
      // In instructor mode, allow free movement
      return makeMove({ from: sourceSquare, to: targetSquare }) !== null;
    }

    // Student mode - check if move is in the solution path
    const moveNotation = `${sourceSquare}${targetSquare}`;
    const currentPosition = position;
    
    // Try to make the move first
    const move = makeMove({ from: sourceSquare, to: targetSquare });
    const isValidMove = move !== null;
    
    if (!isValidMove) {
      return false;
    }

    // Check if this move is part of the required variations
    const isCorrectMove = currentPuzzle.variations.some(variation => {
      // This is a simplified check - in a real implementation, you'd need to track the exact position
      return variation.move.from === sourceSquare && variation.move.to === targetSquare;
    });

    // Record the attempt
    const attempt: MoveAttempt = {
      from: sourceSquare,
      to: targetSquare,
      correct: isCorrectMove,
      timestamp: new Date()
    };
    
    setMoveAttempts(prev => [...prev, attempt]);

    // Update student progress
    if (isCorrectMove) {
      updateState({ 
        success: '✅ Correct move! Well done!',
        error: null 
      });
      
      // Update progress tracking
      const updatedProgress = { ...state.studentProgress };
      if (!updatedProgress[currentPuzzle.id]) {
        updatedProgress[currentPuzzle.id] = {
          completed: false,
          attempts: 0,
          lastAttempt: new Date(),
          requiredVariationsCompleted: []
        };
      }
      updatedProgress[currentPuzzle.id].attempts += 1;
      updatedProgress[currentPuzzle.id].lastAttempt = new Date();
      
      updateState({ studentProgress: updatedProgress });
    } else {
      updateState({ 
        error: '❌ This move is not part of the main solution. Try again!',
        success: null 
      });
    }

    return true;
  }, [currentPuzzle, state.isInstructorMode, state.studentProgress, position, makeMove, updateState]);

  // Reset puzzle to starting position
  const handleResetPuzzle = useCallback(() => {
    if (currentPuzzle) {
      loadPosition(currentPuzzle.fen);
      setCurrentVariationPath([]);
      updateState({ currentMoveId: null, showSolution: false });
      clearMessages();
    }
  }, [currentPuzzle, loadPosition, updateState, clearMessages]);

  // Show/hide solution (instructor only)
  const toggleSolution = useCallback(() => {
    if (state.isInstructorMode) {
      updateState({ showSolution: !state.showSolution });
    }
  }, [state.isInstructorMode, state.showSolution, updateState]);

  // Get student progress for current puzzle
  const getStudentProgress = useCallback(() => {
    if (!currentPuzzle) return null;
    
    const progress = state.studentProgress[currentPuzzle.id];
    if (!progress) return null;

    const requiredVariations = currentPuzzle.requiredVariations.length;
    const completedVariations = progress.requiredVariationsCompleted.length;
    const completionPercentage = requiredVariations > 0 ? (completedVariations / requiredVariations) * 100 : 0;

    return {
      ...progress,
      completionPercentage,
      requiredVariations,
      completedVariations
    };
  }, [currentPuzzle, state.studentProgress]);

  // Student hint system
  const getHint = useCallback(() => {
    if (!currentPuzzle || state.isInstructorMode) return;

    const requiredMoves = currentPuzzle.variations.filter(v => v.isRequired);
    if (requiredMoves.length === 0) return;

    const nextMove = requiredMoves[0]; // Simplified - get first required move
    updateState({ 
      success: `💡 Hint: Try moving the ${nextMove.move.piece} to ${nextMove.move.to}`,
      error: null 
    });
  }, [currentPuzzle, state.isInstructorMode, updateState]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (state.error || state.success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.success, clearMessages]);

  const studentProgress = getStudentProgress();

  return (
    <div className="updated-chess-puzzle-trainer">
      {/* Header */}
      <div className="trainer-header">
        <div className="header-content">
          <h1>🧩 Advanced Chess Puzzle Trainer</h1>
          <p>Interactive puzzle training with horizontal variation trees</p>
        </div>
        
        <div className="header-controls">
          <button
            className={`mode-toggle ${state.isInstructorMode ? 'instructor' : 'student'}`}
            onClick={toggleMode}
          >
            {state.isInstructorMode ? '👨‍🏫 Instructor Mode' : '👨‍🎓 Student Mode'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {state.error && (
        <div className="message error">
          <span>{state.error}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {state.success && (
        <div className="message success">
          <span>{state.success}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="trainer-content">
        {/* Enhanced Puzzle Manager */}
        <EnhancedPuzzleManager
          onLoadPosition={handleLoadPosition}
          onLoadPuzzles={handleLoadPuzzles}
          isInstructor={state.isInstructorMode}
        />

        {/* Chess Board and Controls */}
        {currentPuzzle && (
          <div className="board-section">
            <div className="board-container">
              <div className="board-header">
                <h3>{currentPuzzle.title}</h3>
                <div className="board-controls">
                  <button
                    className="control-btn reset"
                    onClick={handleResetPuzzle}
                  >
                    🔄 Reset
                  </button>
                  
                  {state.isInstructorMode && (
                    <button
                      className={`control-btn solution ${state.showSolution ? 'active' : ''}`}
                      onClick={toggleSolution}
                    >
                      {state.showSolution ? '🙈 Hide Solution' : '👁️ Show Solution'}
                    </button>
                  )}
                  
                  {!state.isInstructorMode && (
                    <button
                      className="control-btn hint"
                      onClick={getHint}
                    >
                      💡 Hint
                    </button>
                  )}
                </div>
              </div>

              <ChessBoard
                position={position}
                onMove={handleMoveAttempt}
                moveHistory={moveHistory}
                currentMoveIndex={currentMoveIndex}
                disabled={false}
              />

              {/* Student Progress */}
              {!state.isInstructorMode && studentProgress && (
                <div className="student-progress">
                  <h4>📊 Your Progress</h4>
                  <div className="progress-stats">
                    <div className="stat">
                      <span className="stat-value">{studentProgress.attempts}</span>
                      <span className="stat-label">Attempts</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{studentProgress.completedVariations}</span>
                      <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{Math.round(studentProgress.completionPercentage)}%</span>
                      <span className="stat-label">Progress</span>
                    </div>
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${studentProgress.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Move Attempts History (Student Mode) */}
              {!state.isInstructorMode && moveAttempts.length > 0 && (
                <div className="move-attempts">
                  <h4>📝 Your Attempts</h4>
                  <div className="attempts-list">
                    {moveAttempts.slice(-5).map((attempt, index) => (
                      <div key={index} className={`attempt ${attempt.correct ? 'correct' : 'incorrect'}`}>
                        <span className="attempt-move">{attempt.from}→{attempt.to}</span>
                        <span className="attempt-result">
                          {attempt.correct ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .updated-chess-puzzle-trainer {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .trainer-header {
          max-width: 1400px;
          margin: 0 auto 20px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          padding: 20px 24px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          margin: 0 0 4px 0;
          color: #2c3e50;
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: #6c757d;
          font-size: 1.1rem;
        }

        .mode-toggle {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .mode-toggle.instructor {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .mode-toggle.student {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          color: white;
        }

        .mode-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .message {
          max-width: 1400px;
          margin: 0 auto 20px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .message.error {
          background: rgba(248, 215, 218, 0.9);
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message.success {
          background: rgba(212, 237, 218, 0.9);
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0 4px;
        }

        .trainer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .board-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .board-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f3f4;
        }

        .board-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .board-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          padding: 8px 16px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .control-btn.reset {
          border-color: #6c757d;
          color: #6c757d;
        }

        .control-btn.reset:hover {
          background: #6c757d;
          color: white;
        }

        .control-btn.solution {
          border-color: #17a2b8;
          color: #17a2b8;
        }

        .control-btn.solution:hover,
        .control-btn.solution.active {
          background: #17a2b8;
          color: white;
        }

        .control-btn.hint {
          border-color: #ffc107;
          color: #856404;
        }

        .control-btn.hint:hover {
          background: #ffc107;
          color: #856404;
        }

        .student-progress {
          background: linear-gradient(135deg, #e8f5e8, #d4edda);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          border: 2px solid #28a745;
        }

        .student-progress h4 {
          margin: 0 0 16px 0;
          color: #155724;
          font-size: 1.1rem;
        }

        .progress-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }

        .stat {
          text-align: center;
          background: white;
          padding: 12px;
          border-radius: 8px;
          min-width: 80px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #28a745;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.7);
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          transition: width 0.3s ease;
          border-radius: 4px;
        }

        .move-attempts {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
          border: 1px solid #dee2e6;
        }

        .move-attempts h4 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1rem;
        }

        .attempts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .attempt {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .attempt.correct {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .attempt.incorrect {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .attempt-move {
          font-weight: 600;
        }

        .attempt-result {
          font-size: 1.1rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .trainer-content {
            gap: 16px;
          }

          .board-section {
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .updated-chess-puzzle-trainer {
            padding: 10px;
          }

          .trainer-header {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }

          .header-content {
            text-align: center;
          }

          .header-content h1 {
            font-size: 1.6rem;
          }

          .board-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .board-controls {
            width: 100%;
            justify-content: space-between;
          }

          .progress-stats {
            flex-direction: column;
            gap: 12px;
          }

          .stat {
            min-width: auto;
          }

          .mode-toggle {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .header-content h1 {
            font-size: 1.4rem;
          }

          .header-content p {
            font-size: 1rem;
          }

          .board-controls {
            flex-direction: column;
            gap: 8px;
          }

          .control-btn {
            width: 100%;
            text-align: center;
          }

          .attempts-list {
            gap: 4px;
          }

          .attempt {
            padding: 6px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdatedChessPuzzleTrainer;