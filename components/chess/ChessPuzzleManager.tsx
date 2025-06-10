// components/chess/ChessPuzzleManager.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ChessVariationTree from './ChessVariationTree';

interface ChessPuzzle {
  id: string;
  title: string;
  description: string;
  fen: string;
  solution: string[];
  variations: VariationNode[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  themes: string[];
  requiredVariations: string[];
  annotations: Record<string, string>;
  metadata: {
    source?: string;
    date?: string;
    white?: string;
    black?: string;
    event?: string;
  };
}

interface VariationNode {
  id: string;
  move: any;
  notation: string;
  fen: string;
  children: VariationNode[];
  parent?: string;
  depth: number;
  isMainLine: boolean;
  isRequired?: boolean;
  annotation?: string;
  evaluation?: string;
}

interface ChessPuzzleManagerProps {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  onPuzzleChange: (index: number) => void;
  onPuzzleUpdate: (puzzleId: string, updates: Partial<ChessPuzzle>) => void;
  onLoadPosition: (fen: string) => void;
  isInstructor: boolean;
}

const ChessPuzzleManager: React.FC<ChessPuzzleManagerProps> = ({
  puzzles,
  currentPuzzleIndex,
  onPuzzleChange,
  onPuzzleUpdate,
  onLoadPosition,
  isInstructor
}) => {
  const [selectedVariationMode, setSelectedVariationMode] = useState<'all' | 'required' | 'main'>('all');
  const [currentMoveId, setCurrentMoveId] = useState<string | null>(null);
  const [showPuzzleEditor, setShowPuzzleEditor] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Partial<ChessPuzzle> | null>(null);

  const currentPuzzle = useMemo(() => {
    return puzzles[currentPuzzleIndex] || null;
  }, [puzzles, currentPuzzleIndex]);

  const filteredVariations = useMemo(() => {
    if (!currentPuzzle) return [];
    
    switch (selectedVariationMode) {
      case 'required':
        return currentPuzzle.variations.filter(v => v.isRequired || v.isMainLine);
      case 'main':
        return currentPuzzle.variations.filter(v => v.isMainLine);
      default:
        return currentPuzzle.variations;
    }
  }, [currentPuzzle, selectedVariationMode]);

  const handleMoveClick = useCallback((nodeId: string, fen: string) => {
    setCurrentMoveId(nodeId);
    onLoadPosition(fen);
  }, [onLoadPosition]);

  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!currentPuzzle || !isInstructor) return;

    const updatedVariations = currentPuzzle.variations.map(variation => 
      variation.id === nodeId ? { ...variation, isRequired: required } : variation
    );

    const updatedRequiredVariations = required 
      ? [...currentPuzzle.requiredVariations, nodeId]
      : currentPuzzle.requiredVariations.filter(id => id !== nodeId);

    onPuzzleUpdate(currentPuzzle.id, {
      variations: updatedVariations,
      requiredVariations: updatedRequiredVariations
    });
  }, [currentPuzzle, isInstructor, onPuzzleUpdate]);

  const handlePuzzleEdit = useCallback((field: keyof ChessPuzzle, value: any) => {
    if (!currentPuzzle || !isInstructor) return;
    
    onPuzzleUpdate(currentPuzzle.id, { [field]: value });
  }, [currentPuzzle, isInstructor, onPuzzleUpdate]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const puzzleStats = useMemo(() => {
    if (!currentPuzzle) return null;
    
    return {
      totalVariations: currentPuzzle.variations.length,
      requiredVariations: currentPuzzle.variations.filter(v => v.isRequired).length,
      mainLineLength: currentPuzzle.variations.filter(v => v.isMainLine).length,
      maxDepth: Math.max(...currentPuzzle.variations.map(v => v.depth), 0)
    };
  }, [currentPuzzle]);

  if (!currentPuzzle) {
    return (
      <div className="puzzle-manager-empty">
        <div className="empty-state">
          <div className="empty-icon">🧩</div>
          <h3>No Puzzles Loaded</h3>
          <p>Import a PGN file to load chess puzzles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-puzzle-manager">
      {/* Puzzle Header */}
      <div className="puzzle-header">
        <div className="puzzle-title-section">
          <h3 className="puzzle-title">
            {isInstructor && showPuzzleEditor ? (
              <input
                type="text"
                value={currentPuzzle.title}
                onChange={(e) => handlePuzzleEdit('title', e.target.value)}
                className="title-edit-input"
              />
            ) : (
              currentPuzzle.title
            )}
          </h3>
          
          <div className="puzzle-meta">
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(currentPuzzle.difficulty) }}
            >
              {currentPuzzle.difficulty}
            </span>
            
            {currentPuzzle.themes.map((theme, index) => (
              <span key={index} className="theme-tag">
                {theme}
              </span>
            ))}
          </div>
        </div>

        {isInstructor && (
          <div className="instructor-controls">
            <button
              className={`edit-toggle ${showPuzzleEditor ? 'active' : ''}`}
              onClick={() => setShowPuzzleEditor(!showPuzzleEditor)}
            >
              {showPuzzleEditor ? '💾 Save' : '✏️ Edit'}
            </button>
          </div>
        )}
      </div>

      {/* Puzzle Navigation */}
      <div className="puzzle-navigation">
        <div className="puzzle-selector">
          <button
            className="nav-btn prev"
            onClick={() => onPuzzleChange(Math.max(0, currentPuzzleIndex - 1))}
            disabled={currentPuzzleIndex === 0}
          >
            ← Previous
          </button>
          
          <div className="puzzle-counter">
            <span className="current-puzzle">{currentPuzzleIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total-puzzles">{puzzles.length}</span>
          </div>
          
          <button
            className="nav-btn next"
            onClick={() => onPuzzleChange(Math.min(puzzles.length - 1, currentPuzzleIndex + 1))}
            disabled={currentPuzzleIndex === puzzles.length - 1}
          >
            Next →
          </button>
        </div>

        <div className="puzzle-quick-selector">
          <select
            value={currentPuzzleIndex}
            onChange={(e) => onPuzzleChange(parseInt(e.target.value))}
            className="puzzle-dropdown"
          >
            {puzzles.map((puzzle, index) => (
              <option key={puzzle.id} value={index}>
                {index + 1}. {puzzle.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Puzzle Description */}
      <div className="puzzle-description">
        {isInstructor && showPuzzleEditor ? (
          <textarea
            value={currentPuzzle.description}
            onChange={(e) => handlePuzzleEdit('description', e.target.value)}
            className="description-edit-input"
            placeholder="Enter puzzle description..."
            rows={3}
          />
        ) : (
          <p>{currentPuzzle.description}</p>
        )}
      </div>

      {/* Variation Controls */}
      {isInstructor && (
        <div className="variation-controls">
          <div className="view-mode-selector">
            <h4>Variation View:</h4>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${selectedVariationMode === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedVariationMode('all')}
              >
                All Variations
              </button>
              <button
                className={`mode-btn ${selectedVariationMode === 'required' ? 'active' : ''}`}
                onClick={() => setSelectedVariationMode('required')}
              >
                Required Only
              </button>
              <button
                className={`mode-btn ${selectedVariationMode === 'main' ? 'active' : ''}`}
                onClick={() => setSelectedVariationMode('main')}
              >
                Main Line
              </button>
            </div>
          </div>

          {puzzleStats && (
            <div className="puzzle-statistics">
              <div className="stat-grid">
                <div className="stat-item">
                  <div className="stat-value">{puzzleStats.totalVariations}</div>
                  <div className="stat-label">Total Moves</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{puzzleStats.requiredVariations}</div>
                  <div className="stat-label">Required</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{puzzleStats.mainLineLength}</div>
                  <div className="stat-label">Main Line</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{puzzleStats.maxDepth}</div>
                  <div className="stat-label">Max Depth</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Variation Tree */}
      <ChessVariationTree
        variations={filteredVariations}
        currentMoveId={currentMoveId}
        onMoveClick={handleMoveClick}
        onToggleRequired={handleToggleRequired}
        isInstructor={isInstructor}
        showOnlyRequired={selectedVariationMode === 'required'}
      />

      {/* Student Instructions */}
      {!isInstructor && currentPuzzle.requiredVariations.length > 0 && (
        <div className="student-instructions">
          <h4>📚 Study Instructions</h4>
          <p>Focus on the starred (★) variations - these are the key moves you need to understand for this puzzle.</p>
          <div className="required-count">
            <strong>{currentPuzzle.requiredVariations.length}</strong> variations marked as required
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessPuzzleManager;