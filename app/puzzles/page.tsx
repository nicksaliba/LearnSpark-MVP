// app/puzzles/page.tsx - Fixed Layout with 50/50 Split
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../../components/chess/ChessBoard';
import EnhancedPuzzleManager from '../../components/chess/EnhancedPuzzleManager';
import HorizontalVariationTree from '../../components/chess/HorizontalVariationTree';
import { EnhancedPGNParser, ChessPuzzle, VariationNode } from '../../utils/enhancedPgnParser';

interface PuzzlePageState {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  currentPosition: string;
  isInstructorMode: boolean;
  selectedVariations: Set<string>;
  currentMoveId: string | null;
  chess: Chess;
  error: string | null;
  success: string | null;
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function EnhancedChessPuzzlesPage() {
  const [state, setState] = useState<PuzzlePageState>({
    puzzles: [],
    currentPuzzleIndex: 0,
    currentPosition: STARTING_FEN,
    isInstructorMode: true,
    selectedVariations: new Set(),
    currentMoveId: null,
    chess: new Chess(),
    error: null,
    success: null,
  });

  const currentPuzzle = useMemo(() => {
    return state.puzzles[state.currentPuzzleIndex] || null;
  }, [state.puzzles, state.currentPuzzleIndex]);

  const updateState = useCallback((updates: Partial<PuzzlePageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    updateState({ error: null, success: null });
  }, [updateState]);

  // Load position from FEN
  const handleLoadPosition = useCallback((fen: string) => {
    try {
      console.log('Loading position:', fen);
      const success = state.chess.load(fen);
      if (success) {
        updateState({ 
          currentPosition: fen,
          currentMoveId: null 
        });
        console.log('Position loaded successfully');
      } else {
        console.error('Failed to load FEN:', fen);
        updateState({ error: 'Invalid chess position' });
      }
    } catch (error) {
      console.error('Error loading position:', error);
      updateState({ error: 'Failed to load chess position' });
    }
  }, [state.chess, updateState]);

  // Load puzzles from PGN manager
  const handleLoadPuzzles = useCallback((puzzles: ChessPuzzle[]) => {
    console.log('Loading puzzles:', puzzles.length);
    
    if (puzzles.length === 0) {
      updateState({ error: 'No puzzles loaded' });
      return;
    }

    const firstPuzzle = puzzles[0];
    
    // Load the first puzzle's position
    handleLoadPosition(firstPuzzle.fen);
    
    // Initialize selected variations with main line moves
    const mainLineVariations = new Set(
      firstPuzzle.variations
        .filter(v => v.isMainLine)
        .map(v => v.id)
    );

    updateState({
      puzzles,
      currentPuzzleIndex: 0,
      selectedVariations: mainLineVariations,
      success: `Successfully loaded ${puzzles.length} puzzle${puzzles.length !== 1 ? 's' : ''}!`,
      error: null
    });
  }, [handleLoadPosition, updateState]);

  // Handle variation tree move clicks
  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    console.log('Variation move clicked:', nodeId, fen);
    updateState({
      currentMoveId: nodeId,
      currentPosition: fen
    });
    clearMessages();
  }, [updateState, clearMessages]);

  // Handle board moves (for interactive solving)
  const handleBoardMove = useCallback((from: string, to: string): boolean => {
    if (!currentPuzzle) return false;

    try {
      // Try the move on current position
      const tempChess = new Chess(state.currentPosition);
      const move = tempChess.move({ from, to });
      
      if (move) {
        const newFen = tempChess.fen();
        
        // Check if this move exists in the puzzle variations
        const matchingVariation = currentPuzzle.variations.find(v => 
          v.move && v.move.from === from && v.move.to === to
        );

        if (matchingVariation) {
          updateState({
            currentPosition: newFen,
            currentMoveId: matchingVariation.id,
            success: `Correct move: ${move.san}`
          });
          return true;
        } else {
          updateState({
            error: 'This move is not part of the puzzle solution'
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
      updateState({ error: 'Invalid move' });
    }
    
    return false;
  }, [currentPuzzle, state.currentPosition, updateState]);

  // Handle instructor variation selection
  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!state.isInstructorMode || !currentPuzzle) return;

    const newSelectedVariations = new Set(state.selectedVariations);
    if (required) {
      newSelectedVariations.add(nodeId);
    } else {
      newSelectedVariations.delete(nodeId);
    }

    updateState({ selectedVariations: newSelectedVariations });
  }, [state.isInstructorMode, state.selectedVariations, currentPuzzle, updateState]);

  // Navigate between puzzles
  const handlePuzzleChange = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= state.puzzles.length) return;
    
    const puzzle = state.puzzles[newIndex];
    handleLoadPosition(puzzle.fen);
    
    // Update selected variations for new puzzle
    const mainLineVariations = new Set(
      puzzle.variations
        .filter(v => v.isMainLine)
        .map(v => v.id)
    );
    
    updateState({ 
      currentPuzzleIndex: newIndex,
      selectedVariations: mainLineVariations,
      currentMoveId: null
    });
    clearMessages();
  }, [state.puzzles, handleLoadPosition, updateState, clearMessages]);

  // Clear messages after timeout
  useEffect(() => {
    if (state.error || state.success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.success, clearMessages]);

  return (
    <div className="enhanced-puzzle-page">
      {/* Header */}
      <div className="puzzle-page-header">
        <div className="header-content">
          <h1>🧩 Enhanced Chess Puzzles</h1>
          <p>Interactive chess puzzle training with horizontal variation trees</p>
          
          <div className="header-controls">
            <div className="mode-toggle">
              <button
                className={`mode-btn ${state.isInstructorMode ? 'active instructor' : 'student'}`}
                onClick={() => updateState({ isInstructorMode: !state.isInstructorMode })}
              >
                {state.isInstructorMode ? '👨‍🏫 Instructor Mode' : '👨‍🎓 Student Mode'}
              </button>
            </div>

            {/* Puzzle Navigation in Header */}
            {state.puzzles.length > 1 && (
              <div className="puzzle-navigation-header">
                <button
                  className="nav-btn"
                  onClick={() => handlePuzzleChange(state.currentPuzzleIndex - 1)}
                  disabled={state.currentPuzzleIndex === 0}
                >
                  ← Previous
                </button>
                
                <div className="puzzle-indicator">
                  <span className="current">{state.currentPuzzleIndex + 1}</span>
                  <span className="separator">/</span>
                  <span className="total">{state.puzzles.length}</span>
                </div>
                
                <button
                  className="nav-btn"
                  onClick={() => handlePuzzleChange(state.currentPuzzleIndex + 1)}
                  disabled={state.currentPuzzleIndex === state.puzzles.length - 1}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {state.error && (
        <div className="message error">
          <span>❌ {state.error}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {state.success && (
        <div className="message success">
          <span>✅ {state.success}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* Puzzle Manager Section - Top when no puzzles loaded */}
      {state.puzzles.length === 0 && (
        <div className="puzzle-manager-section">
          <EnhancedPuzzleManager
            onLoadPosition={handleLoadPosition}
            onLoadPuzzles={handleLoadPuzzles}
            isInstructor={state.isInstructorMode}
          />
        </div>
      )}

      {/* Current Puzzle Info - Below header when puzzle is loaded */}
      {currentPuzzle && (
        <div className="puzzle-info-section">
          <div className="puzzle-info-card">
            <div className="puzzle-header">
              <h2>{currentPuzzle.title}</h2>
              <div className="puzzle-meta">
                <span className={`difficulty ${currentPuzzle.difficulty}`}>
                  {currentPuzzle.difficulty}
                </span>
                {currentPuzzle.themes.slice(0, 4).map((theme, index) => (
                  <span key={index} className="theme">{theme}</span>
                ))}
              </div>
            </div>
            <p className="puzzle-description">{currentPuzzle.description}</p>
            
            {!state.isInstructorMode && currentPuzzle.requiredVariations.length > 0 && (
              <div className="student-hint">
                <strong>💡 Study Focus:</strong> Your instructor has marked <strong>{currentPuzzle.requiredVariations.length}</strong> essential variations. 
                Look for starred (★) moves in the variation tree!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Split Layout: 50% Chess Board | 50% Variation Tree */}
      {currentPuzzle && (
        <div className="main-split-layout">
          {/* Left Side - Chess Board (50%) */}
          <div className="board-section">
            <div className="board-container">
              <ChessBoard
                position={state.currentPosition}
                onMove={handleBoardMove}
                moveHistory={[]}
                currentMoveIndex={0}
                disabled={false}
              />
            </div>
            
            {/* Board Info */}
            <div className="board-info">
              <div className="position-info">
                <div className="info-row">
                  <strong>Turn:</strong> 
                  <span className={`turn-indicator ${state.currentPosition.split(' ')[1] === 'w' ? 'white' : 'black'}`}>
                    {state.currentPosition.split(' ')[1] === 'w' ? 'White' : 'Black'}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Mode:</strong> 
                  <span className={`mode-indicator ${state.isInstructorMode ? 'instructor' : 'student'}`}>
                    {state.isInstructorMode ? 'Instructor' : 'Student'}
                  </span>
                </div>
                {state.currentMoveId && (
                  <div className="info-row">
                    <strong>Selected Move:</strong> 
                    <span className="selected-move">{state.currentMoveId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Variation Tree (50%) */}
          <div className="variation-section">
            <HorizontalVariationTree
              variations={currentPuzzle.variations}
              currentMoveId={state.currentMoveId}
              onMoveClick={handleVariationMoveClick}
              onToggleRequired={handleToggleRequired}
              isInstructor={state.isInstructorMode}
              requiredNodes={state.selectedVariations}
              revealedNodes={new Set(currentPuzzle.variations.map(v => v.id))}
              showOnlyRequired={false}
              title="Variation Analysis"
            />
          </div>
        </div>
      )}

      {/* Bottom Section - Additional Controls and Stats */}
      {currentPuzzle && (
        <div className="bottom-section">
          {/* Instructor Stats */}
          {state.isInstructorMode && (
            <div className="instructor-stats">
              <h3>📊 Puzzle Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{currentPuzzle.variations.length}</span>
                  <span className="stat-label">Total Variations</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{state.selectedVariations.size}</span>
                  <span className="stat-label">Required Moves</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{currentPuzzle.variations.filter(v => v.isMainLine).length}</span>
                  <span className="stat-label">Main Line</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.max(...currentPuzzle.variations.map(v => v.depth), 0)}</span>
                  <span className="stat-label">Max Depth</span>
                </div>
              </div>
            </div>
          )}

          {/* Student Progress */}
          {!state.isInstructorMode && (
            <div className="student-progress">
              <h3>📚 Your Progress</h3>
              <div className="progress-stats">
                <div className="stat-item">
                  <span className="stat-label">Current Puzzle:</span>
                  <span className="stat-value">{state.currentPuzzleIndex + 1} / {state.puzzles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Required Moves:</span>
                  <span className="stat-value">{state.selectedVariations.size}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Difficulty:</span>
                  <span className="stat-value">{currentPuzzle.difficulty}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="action-btn"
              onClick={() => handleLoadPosition(currentPuzzle.fen)}
            >
              🔄 Reset Position
            </button>
            
            {state.puzzles.length > 0 && (
              <div className="puzzle-manager-compact">
                <EnhancedPuzzleManager
                  onLoadPosition={handleLoadPosition}
                  onLoadPuzzles={handleLoadPuzzles}
                  isInstructor={state.isInstructorMode}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}