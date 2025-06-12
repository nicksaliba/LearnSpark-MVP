'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from './ChessBoard';
import HorizontalVariationTree from './HorizontalVariationTree';
import { ChessPuzzle, PuzzleMessage, ChessMove, VariationNode } from '../../types/types';
import { samplePuzzleData } from '../../data/samplePuzzleData';

interface EnhancedPuzzleSystemProps {
  puzzleData?: ChessPuzzle;
  onPuzzleChange?: (puzzleId: string) => void;
  enableInstructorMode?: boolean;
}

const EnhancedPuzzleSystem: React.FC<EnhancedPuzzleSystemProps> = ({
  puzzleData = samplePuzzleData,
  onPuzzleChange,
  enableInstructorMode = true
}) => {
  const [currentPosition, setCurrentPosition] = useState<string>(puzzleData.fen);
  const [currentMoveId, setCurrentMoveId] = useState<string | null>(null);
  const [isInstructorMode, setIsInstructorMode] = useState<boolean>(true);
  const [requiredNodes, setRequiredNodes] = useState<Set<string>>(
    new Set(puzzleData.variations.filter(v => v.isRequired).map(v => v.id))
  );
  const [revealedNodes, setRevealedNodes] = useState<Set<string>>(new Set(['move-1']));
  const [solveMode, setSolveMode] = useState<boolean>(false);
  const [message, setMessage] = useState<PuzzleMessage | null>(null);
  const [lastMove, setLastMove] = useState<ChessMove | null>(null);

  // Create chess instance for move validation
  const [chess] = useState(() => new Chess());

  // Build variation map for quick lookup
  const variationMap = useMemo(() => {
    const map: Record<string, VariationNode> = {};
    puzzleData.variations.forEach(variation => {
      map[variation.id] = variation;
    });
    return map;
  }, [puzzleData.variations]);

  // Reset state when puzzle data changes
  useEffect(() => {
    setCurrentPosition(puzzleData.fen);
    setCurrentMoveId(null);
    setRequiredNodes(new Set(puzzleData.variations.filter(v => v.isRequired).map(v => v.id)));
    setRevealedNodes(new Set(['move-1']));
    setSolveMode(false);
    setLastMove(null);
    setMessage(null);
  }, [puzzleData]);

  // Handle variation tree move clicks
  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    setCurrentMoveId(nodeId);
    setCurrentPosition(fen);
    
    const variation = variationMap[nodeId];
    if (variation && variation.move) {
      setLastMove(variation.move);
    }
    
    clearMessage();
  }, [variationMap]);

  // Handle board moves (when in solve mode)
  const handleBoardMove = useCallback((from: string, to: string): boolean => {
    if (!solveMode) {
      // In free play mode, allow any legal move
      try {
        chess.load(currentPosition);
        const move = chess.move({ from, to });
        if (move) {
          setCurrentPosition(chess.fen());
          setLastMove({
            from: move.from,
            to: move.to,
            san: move.san,
            piece: move.piece,
            captured: move.captured,
            promotion: move.promotion
          });
          return true;
        }
      } catch (error) {
        console.error('Invalid move:', error);
      }
      return false;
    }

    // In solve mode, check if move matches a variation
    const matchingVariation = puzzleData.variations.find(v => 
      v.move && v.move.from === from && v.move.to === to
    );

    if (matchingVariation) {
      // Reveal this node
      setRevealedNodes(prev => new Set([...prev, matchingVariation.id]));
      setCurrentMoveId(matchingVariation.id);
      setCurrentPosition(matchingVariation.fen);
      setLastMove(matchingVariation.move);
      
      if (requiredNodes.has(matchingVariation.id)) {
        setMessage({ type: 'success', text: '✅ Excellent! That\'s a key move.' });
      } else {
        setMessage({ type: 'info', text: '✓ Valid move, but not the main continuation.' });
      }
      
      return true;
    } else {
      setMessage({ type: 'error', text: '❌ This move is not part of the puzzle variations.' });
      return false;
    }
  }, [solveMode, currentPosition, puzzleData.variations, requiredNodes, chess]);

  // Toggle required status for a variation (instructor only)
  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!isInstructorMode) return;
    
    setRequiredNodes(prev => {
      const newSet = new Set(prev);
      if (required) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }, [isInstructorMode]);

  // Reset puzzle
  const handleReset = useCallback(() => {
    setCurrentPosition(puzzleData.fen);
    setCurrentMoveId(null);
    setRevealedNodes(new Set(['move-1']));
    setSolveMode(false);
    setLastMove(null);
    clearMessage();
  }, [puzzleData.fen]);

  // Start solve mode
  const handleStartSolving = useCallback(() => {
    setSolveMode(true);
    setCurrentPosition(puzzleData.fen);
    setCurrentMoveId(null);
    setRevealedNodes(new Set(['move-1']));
    setLastMove(null);
    setMessage({ type: 'info', text: '🎯 Solve mode activated! Find the best moves.' });
  }, [puzzleData.fen]);

  // Show hint (reveal a random required unrevealed node)
  const handleShowHint = useCallback(() => {
    if (isInstructorMode) return;

    const unrevealedRequired = Array.from(requiredNodes).filter(nodeId => 
      !revealedNodes.has(nodeId)
    );

    if (unrevealedRequired.length === 0) {
      setMessage({ type: 'info', text: '💡 No more hints available!' });
      return;
    }

    const randomHint = unrevealedRequired[Math.floor(Math.random() * unrevealedRequired.length)];
    const hintVariation = variationMap[randomHint];
    
    if (hintVariation) {
      setRevealedNodes(prev => new Set([...prev, randomHint]));
      setMessage({ 
        type: 'info', 
        text: `💡 Hint: Consider ${hintVariation.notation}${hintVariation.annotation ? ` - ${hintVariation.annotation}` : ''}` 
      });
    }
  }, [isInstructorMode, requiredNodes, revealedNodes, variationMap]);

  // Export puzzle configuration (instructor only)
  const handleExportConfig = useCallback(() => {
    if (!isInstructorMode) return;

    const config = {
      puzzleId: puzzleData.id,
      requiredNodes: Array.from(requiredNodes),
      timestamp: new Date().toISOString()
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      .then(() => {
        setMessage({ type: 'success', text: '📋 Configuration copied to clipboard!' });
      })
      .catch(() => {
        setMessage({ type: 'error', text: '❌ Failed to copy configuration.' });
      });
  }, [isInstructorMode, puzzleData.id, requiredNodes]);

  // Clear message after timeout
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const totalRequired = requiredNodes.size;
    const revealed = revealedNodes.size;
    const percentage = totalRequired > 0 ? Math.round((revealed / totalRequired) * 100) : 0;
    
    return {
      totalRequired,
      revealed,
      percentage,
      remaining: Math.max(0, totalRequired - revealed)
    };
  }, [requiredNodes.size, revealedNodes.size]);

  return (
    <div className="enhanced-chess-puzzle-system">
      {/* Header */}
      <div className="puzzle-header">
        <div className="puzzle-info">
          <h1>{puzzleData.title}</h1>
          <p>{puzzleData.description}</p>
          <div className="puzzle-meta">
            <span className={`difficulty ${puzzleData.difficulty}`}>
              {puzzleData.difficulty}
            </span>
            {puzzleData.themes.slice(0, 3).map((theme, index) => (
              <span key={index} className="theme">{theme}</span>
            ))}
            {!isInstructorMode && (
              <span className="progress-indicator">
                Progress: {progressStats.percentage}%
              </span>
            )}
          </div>
        </div>
        
        <div className="header-controls">
          {enableInstructorMode && (
            <button
              className={`mode-toggle ${isInstructorMode ? 'instructor' : 'student'}`}
              onClick={() => setIsInstructorMode(!isInstructorMode)}
            >
              {isInstructorMode ? '👨‍🏫 Instructor' : '👨‍🎓 Student'} Mode
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`message ${message.type}`}>
          <span>{message.text}</span>
          <button onClick={clearMessage}>×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="puzzle-content">
        {/* Chess Board Section */}
        <div className="board-section">
          <div className="board-controls">
            <button className="control-btn reset" onClick={handleReset}>
              🔄 Reset
            </button>
            
            {!isInstructorMode && !solveMode && (
              <button className="control-btn solve" onClick={handleStartSolving}>
                🎯 Start Solving
              </button>
            )}
            
            {!isInstructorMode && solveMode && (
              <button className="control-btn hint" onClick={handleShowHint}>
                💡 Show Hint
              </button>
            )}
            
            {isInstructorMode && (
              <button className="control-btn export" onClick={handleExportConfig}>
                📋 Export Config
              </button>
            )}
            
            {solveMode && (
              <div className="solve-status">
                <span>🎯 Solve Mode Active</span>
              </div>
            )}
          </div>
          
          <ChessBoard 
            position={currentPosition}
            onMove={handleBoardMove}
            lastMove={lastMove}
          />
          
          {/* Board Info */}
          <div className="board-info">
            <div className="position-info">
              <strong>Position:</strong>
              <span className="fen-display" title={currentPosition}>
                {currentPosition.split(' ')[0]}
              </span>
            </div>
            
            {currentMoveId && variationMap[currentMoveId] && (
              <div className="current-move-info">
                <strong>Current Move:</strong>
                <span>{variationMap[currentMoveId].notation}</span>
                {variationMap[currentMoveId].annotation && (
                  <div className="move-annotation">
                    💭 {variationMap[currentMoveId].annotation}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isInstructorMode && (
            <div className="student-instructions">
              <h4>📚 Instructions</h4>
              <p>
                Click moves in the variation tree to jump to that position, or use solve mode to play the moves on the board.
              </p>
              <p>
                Required moves are marked with ★ - these are the key patterns you need to master!
              </p>
              {solveMode && (
                <div className="solve-instructions">
                  <p><strong>🎯 Solve Mode:</strong> Make moves on the board to reveal the variation tree progressively.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Variation Tree Section */}
        <div className="tree-section">
          <HorizontalVariationTree
            variations={puzzleData.variations}
            currentMoveId={currentMoveId}
            onMoveClick={handleVariationMoveClick}
            onToggleRequired={handleToggleRequired}
            isInstructor={isInstructorMode}
            requiredNodes={requiredNodes}
            revealedNodes={revealedNodes}
          />
          
          {/* Additional Stats for Instructors */}
          {isInstructorMode && (
            <div className="instructor-stats">
              <h4>📊 Puzzle Statistics</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{puzzleData.variations.length}</span>
                  <span className="stat-label">Total Variations</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{requiredNodes.size}</span>
                  <span className="stat-label">Required Moves</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{puzzleData.variations.filter(v => v.isMainLine).length}</span>
                  <span className="stat-label">Main Line</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{Math.max(...puzzleData.variations.map(v => v.depth), 0)}</span>
                  <span className="stat-label">Max Depth</span>
                </div>
              </div>
              
              <div className="instructor-tips">
                <h5>💡 Tips:</h5>
                <ul>
                  <li>Click ⭐ to mark moves as required for students</li>
                  <li>Use "Export Config" to save your puzzle setup</li>
                  <li>Required moves will appear as placeholders for students</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPuzzleSystem;