// components/chess/EnhancedPuzzleManager.tsx
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import HorizontalVariationTree from './HorizontalVariationTree';
import { EnhancedPGNParser, ChessPuzzle, VariationNode } from '../../utils/enhancedPgnParser';

interface EnhancedPuzzleManagerProps {
  onLoadPosition: (fen: string) => void;
  onLoadPuzzles?: (puzzles: ChessPuzzle[]) => void;
  isInstructor: boolean;
}

interface PuzzleManagerState {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  showImporter: boolean;
  pgnText: string;
  fileName: string;
}

const EnhancedPuzzleManager: React.FC<EnhancedPuzzleManagerProps> = ({
  onLoadPosition,
  onLoadPuzzles,
  isInstructor
}) => {
  const [state, setState] = useState<PuzzleManagerState>({
    puzzles: [],
    currentPuzzleIndex: 0,
    isLoading: false,
    error: null,
    success: null,
    showImporter: false,
    pgnText: '',
    fileName: ''
  });

  const [selectedVariations, setSelectedVariations] = useState<Set<string>>(new Set());

  const currentPuzzle = useMemo(() => {
    return state.puzzles[state.currentPuzzleIndex] || null;
  }, [state.puzzles, state.currentPuzzleIndex]);

  const updateState = useCallback((updates: Partial<PuzzleManagerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    updateState({ error: null, success: null });
  }, [updateState]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      updateState({
        showImporter: true,
        pgnText: content,
        fileName: file.name
      });
    };
    reader.readAsText(file);
  }, [updateState]);

  // Load puzzles from PGN
  const handleLoadPuzzles = useCallback(async () => {
    if (!state.pgnText.trim()) return;

    updateState({ isLoading: true, error: null });

    try {
      const validation = EnhancedPGNParser.validatePGN(state.pgnText);
      
      if (!validation.isValid) {
        updateState({ 
          error: `Invalid PGN: ${validation.errors.join(', ')}`,
          isLoading: false 
        });
        return;
      }

      const parsed = EnhancedPGNParser.parse(state.pgnText);
      
      if (parsed.puzzles.length === 0) {
        updateState({ 
          error: 'No valid puzzles found in PGN file',
          isLoading: false 
        });
        return;
      }

      // Load puzzles and first puzzle position
      const firstPuzzle = parsed.puzzles[0];
      onLoadPosition(firstPuzzle.fen);

      // Initialize selected variations with main line moves
      const mainLineVariations = new Set(
        firstPuzzle.variations
          .filter(v => v.isMainLine)
          .map(v => v.id)
      );
      setSelectedVariations(mainLineVariations);

      updateState({
        puzzles: parsed.puzzles,
        currentPuzzleIndex: 0,
        isLoading: false,
        success: `Successfully loaded ${parsed.puzzles.length} puzzle${parsed.puzzles.length !== 1 ? 's' : ''}!`,
        showImporter: false,
        pgnText: '',
        fileName: ''
      });

      // Notify parent component
      if (onLoadPuzzles) {
        onLoadPuzzles(parsed.puzzles);
      }

    } catch (error) {
      updateState({
        error: `Failed to load puzzles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false
      });
    }
  }, [state.pgnText, onLoadPosition, onLoadPuzzles, updateState]);

  // Navigate between puzzles
  const handlePuzzleChange = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= state.puzzles.length) return;
    
    const puzzle = state.puzzles[newIndex];
    updateState({ currentPuzzleIndex: newIndex });
    onLoadPosition(puzzle.fen);
    
    // Update selected variations for new puzzle
    const mainLineVariations = new Set(
      puzzle.variations
        .filter(v => v.isMainLine)
        .map(v => v.id)
    );
    setSelectedVariations(mainLineVariations);
    
    clearMessages();
  }, [state.puzzles, updateState, onLoadPosition, clearMessages]);

  // Handle variation selection (instructor only)
  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (!currentPuzzle || !isInstructor) return;

    // Update the puzzle's variation requirements
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

    // Update selected variations set
    const newSelectedVariations = new Set(selectedVariations);
    if (required) {
      newSelectedVariations.add(nodeId);
    } else {
      newSelectedVariations.delete(nodeId);
    }
    setSelectedVariations(newSelectedVariations);

  }, [currentPuzzle, isInstructor, state.puzzles, selectedVariations, updateState]);

  // Handle variation tree move clicks
  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    onLoadPosition(fen);
  }, [onLoadPosition]);

  // Export puzzles with instructor selections
  const handleExportPuzzles = useCallback(() => {
    if (state.puzzles.length === 0) return;

    try {
      const pgnText = EnhancedPGNParser.puzzlesToPGN(state.puzzles);
      navigator.clipboard.writeText(pgnText);
      updateState({ success: 'Puzzles exported to clipboard with your selections!' });
    } catch (error) {
      updateState({ error: 'Failed to export puzzles' });
    }
  }, [state.puzzles, updateState]);

  // Clear all puzzles
  const handleClearPuzzles = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all puzzles?')) {
      updateState({
        puzzles: [],
        currentPuzzleIndex: 0
      });
      setSelectedVariations(new Set());
      clearMessages();
    }
  }, [updateState, clearMessages]);

  // Save puzzle configuration for students
  const handleSavePuzzleConfig = useCallback(() => {
    if (!currentPuzzle || !isInstructor) return;

    const config = {
      puzzleId: currentPuzzle.id,
      requiredVariations: Array.from(selectedVariations),
      title: currentPuzzle.title,
      description: currentPuzzle.description,
      difficulty: currentPuzzle.difficulty,
      themes: currentPuzzle.themes
    };

    // In a real application, you would save this to a database
    console.log('Saving puzzle configuration:', config);
    updateState({ success: 'Puzzle configuration saved for students!' });
  }, [currentPuzzle, isInstructor, selectedVariations, updateState]);

  // Get puzzle statistics
  const getPuzzleStats = useCallback((puzzle: ChessPuzzle) => {
    const totalVariations = puzzle.variations.length;
    const requiredVariations = puzzle.variations.filter(v => v.isRequired).length;
    const mainLineLength = puzzle.variations.filter(v => v.isMainLine).length;
    const maxDepth = Math.max(...puzzle.variations.map(v => v.depth), 0);

    return {
      totalVariations,
      requiredVariations,
      mainLineLength,
      maxDepth
    };
  }, []);

  // Sample PGN for demonstration
  const samplePgn = `[Event "Tactical Training"]
[Site "LearnSpark"]
[Date "2024.01.15"]
[White "Student"]
[Black "Computer"]
[Result "*"]
[FEN "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 4"]

4. Ng5 d6 (4... Qe7 5. Nxf7 Qxe4+ 6. Be2 Kxf7 7. d4) 5. Nxf7 Kxf7 6. Qf3+ Ke6 (6... Ke8 7. Qf5 Rf8 8. Qh5+ g6 9. Qxe5+) 7. Nc3 Ncb4 8. Qf5+ Kd7 9. Be6+ Kc6 10. Qc5# *

[Event "Fork Tactic"]
[Site "LearnSpark"] 
[Date "2024.01.15"]
[White "Student"]
[Black "Computer"]
[Result "*"]
[FEN "rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 0 5"]

5. Qa4+ Nc6 (5... Qd7 6. Qxb4 Nc6 7. Qb5) 6. Nxd5 exd5 (6... Nxd5 7. cxd5 exd5 8. Qxb4) 7. Qxb4 Nxd4 8. Nxd4 Qxd4 9. Be3 *`;

  return (
    <div className="enhanced-puzzle-manager">
      {/* Header */}
      <div className="manager-header">
        <div className="header-title">
          <h2>🧩 Interactive Puzzle Manager</h2>
          <div className="mode-indicator">
            <span className={`mode-badge ${isInstructor ? 'instructor' : 'student'}`}>
              {isInstructor ? '👨‍🏫 Instructor Mode' : '👨‍🎓 Student Mode'}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          {state.puzzles.length > 0 && (
            <>
              {isInstructor && (
                <>
                  <button
                    className="action-btn save"
                    onClick={handleSavePuzzleConfig}
                    title="Save current puzzle configuration for students"
                  >
                    💾 Save Config
                  </button>
                  <button
                    className="action-btn export"
                    onClick={handleExportPuzzles}
                    title="Export puzzles with selections"
                  >
                    📤 Export
                  </button>
                </>
              )}
              <button
                className="action-btn clear"
                onClick={handleClearPuzzles}
                title="Clear all puzzles"
              >
                🗑️ Clear
              </button>
            </>
          )}
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

      {/* Main Content */}
      {state.puzzles.length === 0 ? (
        // Import Section
        <div className="import-section">
          <div className="import-card">
            <h3>📁 Import Chess Puzzles</h3>
            <p>Load PGN files containing tactical puzzles with variations</p>
            
            <div className="import-methods">
              <div className="file-upload">
                <label htmlFor="puzzle-upload" className="upload-label">
                  📁 Upload PGN File
                  <input
                    id="puzzle-upload"
                    type="file"
                    accept=".pgn,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              
              <div className="or-divider">
                <span>OR</span>
              </div>
              
              <button
                className="sample-btn"
                onClick={() => updateState({
                  showImporter: true,
                  pgnText: samplePgn,
                  fileName: 'sample-puzzles.pgn'
                })}
              >
                🎯 Try Sample Puzzles
              </button>
            </div>

            <div className="features-list">
              <h4>Features for Instructors:</h4>
              <ul>
                <li>🌳 Interactive horizontal variation trees</li>
                <li>⭐ Mark essential variations for students</li>
                <li>🎯 Multiple puzzle navigation and management</li>
                <li>📊 Automatic difficulty and theme detection</li>
                <li>💾 Save puzzle configurations for student use</li>
                <li>📤 Export customized puzzle sets</li>
              </ul>
              
              <h4>Features for Students:</h4>
              <ul>
                <li>🎯 Focus on instructor-selected key variations</li>
                <li>⭐ Clear marking of essential moves to study</li>
                <li>📈 Progressive difficulty and themed learning</li>
                <li>🧩 Interactive puzzle solving with hints</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // Puzzle Interface
        <div className="puzzle-interface">
          {/* Puzzle Navigation */}
          <div className="puzzle-navigation">
            <div className="nav-controls">
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

            <div className="puzzle-selector">
              <select
                value={state.currentPuzzleIndex}
                onChange={(e) => handlePuzzleChange(parseInt(e.target.value))}
                className="puzzle-dropdown"
              >
                {state.puzzles.map((puzzle, index) => (
                  <option key={puzzle.id} value={index}>
                    {index + 1}. {puzzle.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Puzzle Info */}
          {currentPuzzle && (
            <div className="puzzle-info">
              <div className="puzzle-header">
                <h3>{currentPuzzle.title}</h3>
                <div className="puzzle-meta">
                  <span className={`difficulty ${currentPuzzle.difficulty}`}>
                    {currentPuzzle.difficulty}
                  </span>
                  {currentPuzzle.themes.slice(0, 3).map((theme, index) => (
                    <span key={index} className="theme">{theme}</span>
                  ))}
                </div>
              </div>
              
              <p className="puzzle-description">{currentPuzzle.description}</p>
              
              {isInstructor && (
                <div className="instructor-stats">
                  <div className="stats-grid">
                    {(() => {
                      const stats = getPuzzleStats(currentPuzzle);
                      return (
                        <>
                          <div className="stat-item">
                            <span className="stat-value">{stats.totalVariations}</span>
                            <span className="stat-label">Total Moves</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{stats.requiredVariations}</span>
                            <span className="stat-label">Required</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{stats.mainLineLength}</span>
                            <span className="stat-label">Main Line</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-value">{stats.maxDepth}</span>
                            <span className="stat-label">Max Depth</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {!isInstructor && currentPuzzle.requiredVariations.length > 0 && (
                <div className="student-instructions">
                  <div className="instruction-box">
                    <h4>📚 Study Focus</h4>
                    <p>Your instructor has marked <strong>{currentPuzzle.requiredVariations.length}</strong> essential variations for this puzzle.</p>
                    <p>Look for the starred (★) moves in the variation tree below - these are the key patterns you need to master!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Horizontal Variation Tree */}
          {currentPuzzle && (
            <HorizontalVariationTree
              variations={currentPuzzle.variations}
              onMoveClick={handleVariationMoveClick}
              onToggleRequired={handleToggleRequired}
              isInstructor={isInstructor}
              showOnlyRequired={false}
              title={`${currentPuzzle.title} - Variation Analysis`}
            />
          )}
        </div>
      )}

      {/* PGN Import Modal */}
      {state.showImporter && (
        <div className="modal-overlay">
          <div className="pgn-import-modal">
            <div className="modal-header">
              <h3>Import Chess Puzzles</h3>
              <button
                className="close-btn"
                onClick={() => updateState({ showImporter: false, pgnText: '', fileName: '' })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {state.fileName && (
                <div className="file-info">
                  📁 File: {state.fileName}
                </div>
              )}
              
              <textarea
                value={state.pgnText}
                onChange={(e) => updateState({ pgnText: e.target.value })}
                placeholder="Paste PGN content here or upload a file..."
                rows={12}
                className="pgn-textarea"
              />
              
              <div className="modal-actions">
                <button
                  className="load-btn"
                  onClick={handleLoadPuzzles}
                  disabled={!state.pgnText.trim() || state.isLoading}
                >
                  {state.isLoading ? 'Loading...' : '🧩 Load Puzzles'}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => updateState({ showImporter: false, pgnText: '', fileName: '' })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .enhanced-puzzle-manager {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f3f4;
        }

        .header-title h2 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.6rem;
          font-weight: 700;
        }

        .mode-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .mode-badge.instructor {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .mode-badge.student {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          color: white;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 16px;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.85rem;
        }

        .action-btn.save {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
        }

        .action-btn.export {
          background: linear-gradient(135deg, #17a2b8, #6f42c1);
          color: white;
        }

        .action-btn.clear {
          background: linear-gradient(135deg, #dc3545, #fd7e14);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message.success {
          background: #d4edda;
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

        .import-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .import-card {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 600px;
          width: 100%;
          border: 2px solid #dee2e6;
        }

        .import-card h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .import-card p {
          margin: 0 0 32px 0;
          color: #6c757d;
          line-height: 1.6;
          font-size: 1.1rem;
        }

        .import-methods {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .upload-label {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          font-size: 1rem;
        }

        .upload-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .or-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 16px 0;
          color: #6c757d;
          font-weight: 600;
        }

        .or-divider::before,
        .or-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background: #dee2e6;
        }

        .or-divider::before { left: 0; }
        .or-divider::after { right: 0; }

        .or-divider span {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 0 16px;
        }

        .sample-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sample-btn:hover {
          background: linear-gradient(135deg, #e9ecef, #dee2e6);
          transform: translateY(-1px);
        }

        .features-list {
          text-align: left;
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .features-list h4 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1rem;
        }

        .features-list ul {
          margin: 0 0 20px 0;
          padding-left: 0;
          list-style: none;
        }

        .features-list li {
          padding: 4px 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .puzzle-interface {
          background: linear-gradient(135deg, #f8f9fa, #ffffff);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e9ecef;
        }

        .puzzle-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .nav-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          color: white;
          transition: all 0.2s ease;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
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
        }

        .puzzle-indicator .current {
          font-size: 1.4rem;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .puzzle-selector {
          min-width: 200px;
        }

        .puzzle-dropdown {
          width: 100%;
          padding: 8px 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .puzzle-dropdown option {
          color: #2c3e50;
          background: white;
        }

        .puzzle-info {
          padding: 24px;
        }

        .puzzle-header {
          margin-bottom: 16px;
        }

        .puzzle-header h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .puzzle-meta {
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

        .puzzle-description {
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .instructor-stats {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #2196f3;
          margin-bottom: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;
        }

        .stat-item {
          text-align: center;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1976d2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
        }

        .student-instructions {
          background: linear-gradient(135deg, #e8f5e8, #d4edda);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #28a745;
          margin-bottom: 16px;
        }

        .instruction-box h4 {
          margin: 0 0 8px 0;
          color: #155724;
          font-size: 1.1rem;
        }

        .instruction-box p {
          margin: 0 0 8px 0;
          color: #155724;
          line-height: 1.5;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .pgn-import-modal {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.3rem;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-content {
          padding: 24px;
        }

        .file-info {
          background: #e3f2fd;
          color: #1976d2;
          padding: 8px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          font-size: 0.9rem;
        }

        .pgn-textarea {
          width: 100%;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          resize: vertical;
          margin-bottom: 16px;
        }

        .pgn-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .load-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .load-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .load-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel-btn {
          padding: 12px 24px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: #545b62;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .enhanced-puzzle-manager {
            padding: 16px;
          }

          .manager-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .puzzle-navigation {
            flex-direction: column;
            gap: 16px;
          }

          .nav-controls {
            width: 100%;
            justify-content: space-between;
          }

          .puzzle-selector {
            width: 100%;
            min-width: auto;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .import-card {
            padding: 24px;
            margin: 10px;
          }

          .import-card h3 {
            font-size: 1.5rem;
          }

          .header-title h2 {
            font-size: 1.4rem;
          }

          .action-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .puzzle-header h3 {
            font-size: 1.2rem;
          }

          .puzzle-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .nav-controls {
            flex-direction: column;
            gap: 12px;
          }

          .puzzle-indicator {
            font-size: 1rem;
          }

          .puzzle-indicator .current {
            font-size: 1.2rem;
          }

          .modal-content {
            padding: 16px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .load-btn,
          .cancel-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .enhanced-puzzle-manager {
            padding: 12px;
          }

          .header-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .features-list {
            padding: 16px;
          }

          .features-list ul {
            margin-bottom: 16px;
          }

          .instructor-stats {
            padding: 12px;
          }

          .student-instructions {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(EnhancedPuzzleManager);