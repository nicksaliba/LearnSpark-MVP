'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ChessBoard from '../../components/chess/ChessBoard';
import EnhancedPuzzleManager from '../../components/chess/EnhancedPuzzleManager';
import HorizontalVariationTree from '../../components/chess/HorizontalVariationTree';
import { useChess } from '../../hooks/useChess';
import { EnhancedPGNParser, ChessPuzzle, VariationNode } from '../../utils/enhancedPgnParser';

interface PuzzleTrainingState {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  isInstructorMode: boolean;
  showVariationTree: boolean;
  selectedVariationFilter: 'all' | 'required' | 'main';
  currentMoveId: string | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  solveMode: boolean;
  studentAttempts: Array<{
    from: string;
    to: string;
    correct: boolean;
    timestamp: Date;
  }>;
  hintLevel: number;
  showSolution: boolean;
  revealedNodes: Set<string>; // Nodes revealed to student
  hintableNodes: Set<string>; // Nodes that can be shown as hints
  currentPath: string[]; // Current path of node IDs
}

const EnhancedChessPuzzlePage: React.FC = () => {
  const [state, setState] = useState<PuzzleTrainingState>({
    puzzles: [],
    currentPuzzleIndex: 0,
    isInstructorMode: true,
    showVariationTree: false,
    selectedVariationFilter: 'all',
    currentMoveId: null,
    isLoading: false,
    error: null,
    success: null,
    solveMode: false,
    studentAttempts: [],
    hintLevel: 0,
    showSolution: false,
    revealedNodes: new Set(),
    hintableNodes: new Set(),
    currentPath: []
  });

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

  // Get variations filtered for student view
  const getStudentVariations = useCallback(() => {
    if (!currentPuzzle || state.isInstructorMode) {
      return currentPuzzle?.variations || [];
    }

    // For students, only show revealed nodes
    const filterVariations = (nodes: VariationNode[]): VariationNode[] => {
      return nodes
        .filter(node => state.revealedNodes.has(node.id))
        .map(node => ({
          ...node,
          children: filterVariations(node.children)
        }));
    };

    return filterVariations(currentPuzzle.variations);
  }, [currentPuzzle, state.isInstructorMode, state.revealedNodes]);

  const filteredVariations = useMemo(() => {
    const variations = state.isInstructorMode 
      ? currentPuzzle?.variations || []
      : getStudentVariations();
    
    if (!currentPuzzle) return [];
    
    switch (state.selectedVariationFilter) {
      case 'required':
        return variations.filter(v => v.isRequired || v.isMainLine);
      case 'main':
        return variations.filter(v => v.isMainLine);
      default:
        return variations;
    }
  }, [currentPuzzle, state.selectedVariationFilter, state.isInstructorMode, getStudentVariations]);

  const updateState = useCallback((updates: Partial<PuzzleTrainingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    updateState({ error: null, success: null });
  }, [updateState]);

  // Handle puzzle loading from Enhanced Puzzle Manager
  const handleLoadPuzzles = useCallback((puzzles: ChessPuzzle[]) => {
    updateState({ 
      puzzles,
      currentPuzzleIndex: 0,
      currentMoveId: null,
      showVariationTree: true,
      solveMode: false,
      studentAttempts: [],
      hintLevel: 0,
      showSolution: false,
      revealedNodes: new Set(),
      hintableNodes: new Set(),
      currentPath: []
    });
    
    if (puzzles.length > 0) {
      loadPosition(puzzles[0].fen);
      // Initialize hintable nodes with some key positions
      initializeHintableNodes(puzzles[0]);
    }
  }, [updateState, loadPosition]);

  // Initialize hintable nodes for a puzzle
  const initializeHintableNodes = useCallback((puzzle: ChessPuzzle) => {
    const hintable = new Set<string>();
    
    // Add all required variations as hintable
    puzzle.variations.forEach(variation => {
      if (variation.isRequired || variation.isMainLine) {
        hintable.add(variation.id);
      }
    });
    
    // Add some random non-required variations as hintable (instructor can modify)
    const nonRequired = puzzle.variations.filter(v => !v.isRequired && !v.isMainLine);
    const randomCount = Math.min(3, Math.floor(nonRequired.length * 0.3));
    for (let i = 0; i < randomCount; i++) {
      const randomIndex = Math.floor(Math.random() * nonRequired.length);
      hintable.add(nonRequired[randomIndex].id);
    }
    
    updateState({ hintableNodes: hintable });
  }, [updateState]);

  // Handle position loading from manager
  const handleLoadPosition = useCallback((fen: string) => {
    loadPosition(fen);
    updateState({ 
      solveMode: false,
      studentAttempts: [],
      hintLevel: 0,
      currentMoveId: null,
      revealedNodes: new Set(),
      currentPath: []
    });
  }, [loadPosition, updateState]);

  // Toggle between instructor and student modes
  const toggleMode = useCallback(() => {
    updateState({ 
      isInstructorMode: !state.isInstructorMode,
      solveMode: false,
      showSolution: false,
      studentAttempts: [],
      hintLevel: 0,
      revealedNodes: new Set(),
      currentPath: []
    });
    clearMessages();
  }, [state.isInstructorMode, updateState, clearMessages]);

  // Navigate between puzzles
  const handlePuzzleChange = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= state.puzzles.length) return;
    
    const puzzle = state.puzzles[newIndex];
    updateState({ 
      currentPuzzleIndex: newIndex, 
      currentMoveId: null,
      solveMode: false,
      studentAttempts: [],
      hintLevel: 0,
      showSolution: false,
      revealedNodes: new Set(),
      hintableNodes: new Set(),
      currentPath: []
    });
    loadPosition(puzzle.fen);
    initializeHintableNodes(puzzle);
    clearMessages();
  }, [state.puzzles, updateState, loadPosition, clearMessages, initializeHintableNodes]);

  // Handle variation tree move clicks
  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    updateState({ currentMoveId: nodeId });
    loadPosition(fen);
  }, [updateState, loadPosition]);

  // Toggle whether a node can be shown as hint (instructor only)
  const handleToggleHintable = useCallback((nodeId: string) => {
    if (!state.isInstructorMode) return;
    
    const newHintableNodes = new Set(state.hintableNodes);
    if (newHintableNodes.has(nodeId)) {
      newHintableNodes.delete(nodeId);
    } else {
      newHintableNodes.add(nodeId);
    }
    
    updateState({ hintableNodes: newHintableNodes });
  }, [state.isInstructorMode, state.hintableNodes, updateState]);

  // Toggle variation requirement (instructor only)
  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!currentPuzzle || !state.isInstructorMode) return;

    const updatedPuzzles = state.puzzles.map(puzzle => {
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

    updateState({ puzzles: updatedPuzzles });
  }, [currentPuzzle, state.isInstructorMode, state.puzzles, updateState]);

  // Find variation node by move
  const findNodeByMove = useCallback((from: string, to: string, parentPath: string[]): VariationNode | null => {
    if (!currentPuzzle) return null;
    
    // Search through variations to find matching move
    const searchVariations = (nodes: VariationNode[], currentPath: string[]): VariationNode | null => {
      for (const node of nodes) {
        // Check if we're on the right path
        if (currentPath.length > 0 && !currentPath.includes(node.parent || '')) {
          continue;
        }
        
        if (node.move.from === from && node.move.to === to) {
          return node;
        }
        
        // Search children
        const found = searchVariations(node.children, [...currentPath, node.id]);
        if (found) return found;
      }
      return null;
    };
    
    return searchVariations(currentPuzzle.variations, parentPath);
  }, [currentPuzzle]);

  // Handle move attempts in solve mode
  const handleMoveAttempt = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    if (!currentPuzzle) {
      return makeMove({ from: sourceSquare, to: targetSquare }) !== null;
    }

    if (state.isInstructorMode || !state.solveMode) {
      // In instructor mode or when not solving, allow free movement
      return makeMove({ from: sourceSquare, to: targetSquare }) !== null;
    }

    // Student solve mode
    const move = makeMove({ from: sourceSquare, to: targetSquare });
    const isValidMove = move !== null;
    
    if (!isValidMove) {
      return false;
    }

    // Find the variation node for this move
    const moveNode = findNodeByMove(sourceSquare, targetSquare, state.currentPath);
    
    if (moveNode) {
      // Reveal this node to the student
      const newRevealedNodes = new Set(state.revealedNodes);
      newRevealedNodes.add(moveNode.id);
      
      // Update current path
      const newPath = [...state.currentPath, moveNode.id];
      
      // Check if this is a correct move (part of required variations)
      const isCorrectMove = moveNode.isRequired || moveNode.isMainLine;
      
      // Record the attempt
      const attempt = {
        from: sourceSquare,
        to: targetSquare,
        correct: isCorrectMove,
        timestamp: new Date()
      };
      
      updateState({ 
        studentAttempts: [...state.studentAttempts, attempt],
        revealedNodes: newRevealedNodes,
        currentPath: newPath,
        currentMoveId: moveNode.id
      });
      
      if (isCorrectMove) {
        updateState({ 
          success: '✅ Excellent move! That\'s part of the solution.',
          error: null 
        });
        
        // Check if puzzle is solved
        const requiredNodes = currentPuzzle.variations.filter(v => v.isRequired);
        const revealedRequired = requiredNodes.filter(n => newRevealedNodes.has(n.id));
        
        if (revealedRequired.length >= requiredNodes.length) {
          updateState({ 
            success: '🎉 Puzzle solved! Well done!',
            solveMode: false
          });
        }
      } else {
        updateState({ 
          error: '❌ Valid move, but not the best. Try to find the key continuation.',
          success: null 
        });
      }
    } else {
      // Move not in variations
      updateState({ 
        error: '❌ This move is not part of the puzzle variations.',
        success: null 
      });
    }

    return true;
  }, [currentPuzzle, state.isInstructorMode, state.solveMode, state.studentAttempts, 
      state.revealedNodes, state.currentPath, makeMove, updateState, findNodeByMove]);

  // Start solve mode for students
  const handleStartSolving = useCallback(() => {
    if (!currentPuzzle) return;
    
    loadPosition(currentPuzzle.fen);
    updateState({
      solveMode: true,
      studentAttempts: [],
      hintLevel: 0,
      showSolution: false,
      error: null,
      success: 'Try to find the best moves. The variation tree will reveal as you play!',
      revealedNodes: new Set(),
      currentPath: []
    });
  }, [currentPuzzle, loadPosition, updateState]);

  // Reset puzzle to starting position
  const handleResetPuzzle = useCallback(() => {
    if (currentPuzzle) {
      loadPosition(currentPuzzle.fen);
      updateState({ 
        currentMoveId: null,
        solveMode: false,
        studentAttempts: [],
        hintLevel: 0,
        showSolution: false,
        revealedNodes: new Set(),
        currentPath: []
      });
      clearMessages();
    }
  }, [currentPuzzle, loadPosition, updateState, clearMessages]);

  // Show hint for students
  const handleShowHint = useCallback(() => {
    if (!currentPuzzle || state.isInstructorMode) return;

    // Find hintable nodes that haven't been revealed yet
    const unrevealedHintable = Array.from(state.hintableNodes)
      .filter(nodeId => !state.revealedNodes.has(nodeId));
    
    if (unrevealedHintable.length === 0) {
      updateState({ 
        error: 'No more hints available. Keep trying!',
        success: null 
      });
      return;
    }

    // Reveal a random hintable node
    const randomIndex = Math.floor(Math.random() * unrevealedHintable.length);
    const hintNodeId = unrevealedHintable[randomIndex];
    
    // Find the node
    const hintNode = currentPuzzle.variations.find(v => v.id === hintNodeId);
    if (!hintNode) return;

    const newRevealedNodes = new Set(state.revealedNodes);
    newRevealedNodes.add(hintNodeId);

    updateState({
      revealedNodes: newRevealedNodes,
      hintLevel: state.hintLevel + 1,
      success: `💡 Hint: Consider the move ${hintNode.notation} (${hintNode.move.piece} from ${hintNode.move.from} to ${hintNode.move.to})`,
      error: null
    });
  }, [currentPuzzle, state.isInstructorMode, state.hintableNodes, state.revealedNodes, 
      state.hintLevel, updateState]);

  // Show/hide solution (instructor only)
  const toggleSolution = useCallback(() => {
    if (state.isInstructorMode) {
      updateState({ showSolution: !state.showSolution });
    }
  }, [state.isInstructorMode, state.showSolution, updateState]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (state.error || state.success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.success, clearMessages]);

  return (
    <div className="enhanced-puzzle-page">
      {/* Header */}
      <div className="puzzle-page-header">
        <div className="header-content">
          <h1>🧩 Enhanced Chess Puzzle Training</h1>
          <p>Interactive puzzle training with progressive variation revelation</p>
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
      <div className="puzzle-page-content">
        {/* Enhanced Puzzle Manager */}
        <div className="puzzle-manager-section">
          <EnhancedPuzzleManager
            onLoadPosition={handleLoadPosition}
            onLoadPuzzles={handleLoadPuzzles}
            isInstructor={state.isInstructorMode}
          />
        </div>

        {/* Chess Board and Controls */}
        {currentPuzzle && (
          <div className="puzzle-board-section">
            <div className="puzzle-info-bar">
              <div className="puzzle-navigation">
                <button
                  className="nav-btn prev"
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
                  className="nav-btn next"
                  onClick={() => handlePuzzleChange(state.currentPuzzleIndex + 1)}
                  disabled={state.currentPuzzleIndex === state.puzzles.length - 1}
                >
                  Next →
                </button>
              </div>

              <div className="puzzle-meta">
                <h3>{currentPuzzle.title}</h3>
                <div className="meta-tags">
                  <span className={`difficulty ${currentPuzzle.difficulty}`}>
                    {currentPuzzle.difficulty}
                  </span>
                  {currentPuzzle.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="theme">{theme}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="board-and-controls">
              <div className="board-container">
                <div className="board-header">
                  <div className="board-controls">
                    <button
                      className="control-btn reset"
                      onClick={handleResetPuzzle}
                    >
                      🔄 Reset
                    </button>
                    
                    {!state.isInstructorMode && !state.solveMode && (
                      <button
                        className="control-btn solve"
                        onClick={handleStartSolving}
                      >
                        🎯 Start Solving
                      </button>
                    )}
                    
                    {!state.isInstructorMode && state.solveMode && (
                      <button
                        className="control-btn hint"
                        onClick={handleShowHint}
                      >
                        💡 Hint ({state.hintLevel})
                      </button>
                    )}
                    
                    {state.isInstructorMode && (
                      <button
                        className={`control-btn solution ${state.showSolution ? 'active' : ''}`}
                        onClick={toggleSolution}
                      >
                        {state.showSolution ? '🙈 Hide Solution' : '👁️ Show Solution'}
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
                {!state.isInstructorMode && state.studentAttempts.length > 0 && (
                  <div className="student-progress">
                    <h4>📊 Your Progress</h4>
                    <div className="attempts-list">
                      {state.studentAttempts.slice(-5).map((attempt, index) => (
                        <div key={index} className={`attempt ${attempt.correct ? 'correct' : 'incorrect'}`}>
                          <span className="attempt-move">{attempt.from}→{attempt.to}</span>
                          <span className="attempt-result">
                            {attempt.correct ? '✅' : '❌'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="progress-stats">
                      <span>Correct: {state.studentAttempts.filter(a => a.correct).length}</span>
                      <span>Total: {state.studentAttempts.length}</span>
                      <span>Revealed: {state.revealedNodes.size} moves</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="puzzle-description">
                <p>{currentPuzzle.description}</p>
                {!state.isInstructorMode && currentPuzzle.requiredVariations.length > 0 && (
                  <div className="student-hint">
                    <strong>💡 The variation tree will reveal as you play correct moves!</strong>
                  </div>
                )}
                {state.isInstructorMode && (
                  <div className="instructor-info">
                    <strong>🎯 Instructor Controls:</strong>
                    <ul>
                      <li>Click ⭐ to mark variations as required</li>
                      <li>Click 💡 to mark moves as hintable</li>
                      <li>Students will see the tree progressively</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Variation Tree */}
        {state.showVariationTree && currentPuzzle && (
          <div className="variation-tree-section">
            {state.isInstructorMode && (
              <div className="tree-controls">
                <h4>Variation Filter:</h4>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${state.selectedVariationFilter === 'all' ? 'active' : ''}`}
                    onClick={() => updateState({ selectedVariationFilter: 'all' })}
                  >
                    All Variations
                  </button>
                  <button
                    className={`filter-btn ${state.selectedVariationFilter === 'required' ? 'active' : ''}`}
                    onClick={() => updateState({ selectedVariationFilter: 'required' })}
                  >
                    Required Only
                  </button>
                  <button
                    className={`filter-btn ${state.selectedVariationFilter === 'main' ? 'active' : ''}`}
                    onClick={() => updateState({ selectedVariationFilter: 'main' })}
                  >
                    Main Line
                  </button>
                </div>
              </div>
            )}

            <HorizontalVariationTree
              variations={filteredVariations}
              currentMoveId={state.currentMoveId}
              onMoveClick={handleVariationMoveClick}
              onToggleRequired={handleToggleRequired}
              onToggleHintable={handleToggleHintable}
              hintableNodes={state.hintableNodes}
              isInstructor={state.isInstructorMode}
              showOnlyRequired={state.selectedVariationFilter === 'required'}
              title={`${currentPuzzle.title} - ${state.isInstructorMode ? 'Full Variation Tree' : 'Your Progress'}`}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .enhanced-puzzle-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .puzzle-page-header {
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

        .puzzle-page-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .puzzle-manager-section {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .puzzle-board-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .puzzle-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 2px solid #f1f3f4;
          margin-bottom: 24px;
        }

        .puzzle-navigation {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-btn:hover:not(:disabled) {
          background: #007bff;
          color: white;
          border-color: #007bff;
          transform: translateY(-1px);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .puzzle-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1.2rem;
          font-weight: 600;
          color: #495057;
        }

        .puzzle-indicator .current {
          color: #007bff;
          font-size: 1.4rem;
        }

        .puzzle-meta h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .meta-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .difficulty {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          color: white;
        }

        .difficulty.beginner { background: #28a745; }
        .difficulty.intermediate { background: #ffc107; color: #856404; }
        .difficulty.advanced { background: #dc3545; }

        .theme {
          background: #e9ecef;
          color: #495057;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .board-and-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .board-header {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }

        .board-controls {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          padding: 10px 18px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
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

        .control-btn.solve {
          border-color: #28a745;
          color: #28a745;
        }

        .control-btn.solve:hover {
          background: #28a745;
          color: white;
        }

        .control-btn.hint {
          border-color: #ffc107;
          color: #856404;
        }

        .control-btn.hint:hover:not(:disabled) {
          background: #ffc107;
          color: #856404;
        }

        .control-btn.hint:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .board-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .student-progress {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-top: 16px;
          border: 1px solid #dee2e6;
        }

        .student-progress h4 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1rem;
        }

        .attempts-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
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

        .progress-stats {
          display: flex;
          gap: 16px;
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }

        .puzzle-description {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .puzzle-description p {
          margin: 0 0 8px 0;
          color: #495057;
          line-height: 1.5;
        }

        .student-hint {
          background: #d4edda;
          color: #155724;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .instructor-info {
          background: #e3f2fd;
          color: #1565c0;
          padding: 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .instructor-info ul {
          margin: 8px 0 0 20px;
          padding: 0;
        }

        .instructor-info li {
          margin: 4px 0;
        }

        .variation-tree-section {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .tree-controls {
          background: #f8f9fa;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .tree-controls h4 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1rem;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 8px 16px;
          background: white;
          border: 2px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .filter-btn:hover {
          border-color: #007bff;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .puzzle-page-content {
            gap: 16px;
          }

          .puzzle-board-section {
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .enhanced-puzzle-page {
            padding: 10px;
          }

          .puzzle-page-header {
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

          .puzzle-info-bar {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .puzzle-navigation {
            width: 100%;
            justify-content: space-between;
          }

          .board-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .filter-buttons {
            flex-direction: column;
          }

          .filter-btn {
            text-align: center;
          }

          .mode-toggle {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .meta-tags {
            flex-direction: column;
            align-items: flex-start;
          }

          .board-controls {
            flex-direction: column;
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

          .progress-stats {
            justify-content: space-around;
          }

          .puzzle-navigation {
            flex-direction: column;
            gap: 12px;
          }

          .nav-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedChessPuzzlePage;