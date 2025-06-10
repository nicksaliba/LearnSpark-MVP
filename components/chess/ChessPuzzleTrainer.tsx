import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ChessBoard from './ChessBoard';
import ChessVariationTree from './ChessVariationTree';
import { useChess } from '../../hooks/useChess';
import { EnhancedPGNParser, ChessPuzzle, VariationNode } from '../../utils/enhancedPgnParser';

interface PuzzleTrainerState {
  puzzles: ChessPuzzle[];
  currentPuzzleIndex: number;
  isInstructorMode: boolean;
  showVariationTree: boolean;
  selectedVariationFilter: 'all' | 'required' | 'main';
  currentMoveId: string | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const ChessPuzzleTrainer: React.FC = () => {
  const [state, setState] = useState<PuzzleTrainerState>({
    puzzles: [],
    currentPuzzleIndex: 0,
    isInstructorMode: true, // For demo - should come from auth
    showVariationTree: false,
    selectedVariationFilter: 'all',
    currentMoveId: null,
    isLoading: false,
    error: null,
    success: null
  });

  const [pgnImportData, setPgnImportData] = useState({
    showImporter: false,
    pgnText: '',
    fileName: ''
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

  const filteredVariations = useMemo(() => {
    if (!currentPuzzle) return [];
    
    switch (state.selectedVariationFilter) {
      case 'required':
        return currentPuzzle.variations.filter(v => v.isRequired || v.isMainLine);
      case 'main':
        return currentPuzzle.variations.filter(v => v.isMainLine);
      default:
        return currentPuzzle.variations;
    }
  }, [currentPuzzle, state.selectedVariationFilter]);

  const updateState = useCallback((updates: Partial<PuzzleTrainerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearMessages = useCallback(() => {
    updateState({ error: null, success: null });
  }, [updateState]);

  // Handle PGN file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPgnImportData({
        showImporter: true,
        pgnText: content,
        fileName: file.name
      });
    };
    reader.readAsText(file);
  }, []);

  // Load puzzles from PGN
  const handleLoadPuzzles = useCallback(() => {
    if (!pgnImportData.pgnText.trim()) return;

    updateState({ isLoading: true, error: null });

    try {
      const validation = EnhancedPGNParser.validatePGN(pgnImportData.pgnText);
      
      if (!validation.isValid) {
        updateState({ 
          error: `Invalid PGN: ${validation.errors.join(', ')}`,
          isLoading: false 
        });
        return;
      }

      const parsed = EnhancedPGNParser.parse(pgnImportData.pgnText);
      
      if (parsed.puzzles.length === 0) {
        updateState({ 
          error: 'No valid puzzles found in PGN file',
          isLoading: false 
        });
        return;
      }

      // Load puzzles and first puzzle position
      const firstPuzzle = parsed.puzzles[0];
      loadPosition(firstPuzzle.fen);

      updateState({
        puzzles: parsed.puzzles,
        currentPuzzleIndex: 0,
        showVariationTree: true,
        isLoading: false,
        success: `Successfully loaded ${parsed.puzzles.length} puzzle${parsed.puzzles.length !== 1 ? 's' : ''}!`
      });

      // Reset import state
      setPgnImportData({
        showImporter: false,
        pgnText: '',
        fileName: ''
      });

    } catch (error) {
      updateState({
        error: `Failed to load puzzles: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false
      });
    }
  }, [pgnImportData.pgnText, loadPosition, updateState]);

  // Navigate between puzzles
  const handlePuzzleChange = useCallback((newIndex: number) => {
    if (newIndex < 0 || newIndex >= state.puzzles.length) return;
    
    const puzzle = state.puzzles[newIndex];
    updateState({ currentPuzzleIndex: newIndex, currentMoveId: null });
    loadPosition(puzzle.fen);
    clearMessages();
  }, [state.puzzles, updateState, loadPosition, clearMessages]);

  // Handle variation tree move clicks
  const handleVariationMoveClick = useCallback((nodeId: string, fen: string) => {
    updateState({ currentMoveId: nodeId });
    loadPosition(fen);
  }, [updateState, loadPosition]);

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

  // Export puzzles to PGN
  const handleExportPuzzles = useCallback(() => {
    if (state.puzzles.length === 0) return;

    try {
      const pgnText = EnhancedPGNParser.puzzlesToPGN(state.puzzles);
      navigator.clipboard.writeText(pgnText);
      updateState({ success: 'Puzzles exported to clipboard!' });
    } catch (error) {
      updateState({ error: 'Failed to export puzzles' });
    }
  }, [state.puzzles, updateState]);

  // Clear all puzzles
  const handleClearPuzzles = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all puzzles?')) {
      updateState({
        puzzles: [],
        currentPuzzleIndex: 0,
        showVariationTree: false,
        currentMoveId: null
      });
      resetGame();
      clearMessages();
    }
  }, [updateState, resetGame, clearMessages]);

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
    <div className="chess-puzzle-trainer">
      {/* Header */}
      <div className="trainer-header">
        <div className="header-controls">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${state.isInstructorMode ? 'instructor' : 'student'}`}
              onClick={() => updateState({ isInstructorMode: !state.isInstructorMode })}
            >
              {state.isInstructorMode ? '👨‍🏫 Instructor Mode' : '👨‍🎓 Student Mode'}
            </button>
          </div>
          
          <div className="quick-actions">
            {state.puzzles.length > 0 && (
              <>
                <button
                  className="action-btn export"
                  onClick={handleExportPuzzles}
                  title="Export puzzles to clipboard"
                >
                  📤 Export
                </button>
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
      </div>

      {/* Main Content */}
      <div className="trainer-content">
        {state.puzzles.length === 0 ? (
          // Import Section
          <div className="import-section">
            <div className="import-card">
              <h2>🧩 Import Chess Puzzles</h2>
              <p>Load PGN files containing tactical puzzles with variations to start training</p>
              
              <div className="import-methods">
                <div className="file-upload">
                  <label htmlFor="pgn-upload" className="upload-label">
                    📁 Upload PGN File
                    <input
                      id="pgn-upload"
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
                  onClick={() => setPgnImportData({
                    showImporter: true,
                    pgnText: samplePgn,
                    fileName: 'sample-puzzles.pgn'
                  })}
                >
                  🎯 Try Sample Puzzles
                </button>
              </div>

              <div className="features-list">
                <h3>Features:</h3>
                <ul>
                  <li>✨ Interactive variation trees</li>
                  <li>⭐ Mark essential moves for students</li>
                  <li>🎯 Multiple puzzle navigation</li>
                  <li>📊 Automatic difficulty detection</li>
                  <li>🏷️ Theme recognition (tactics, endgames, etc.)</li>
                  <li>📤 Export modified puzzles</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Puzzle Interface
          <div className="puzzle-interface">
            {/* Puzzle Info */}
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

              {currentPuzzle && (
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
              )}
            </div>

            {/* Board and Tree Layout */}
            <div className="board-tree-layout">
              {/* Chess Board */}
              <div className="board-section">
                <ChessBoard
                  position={position}
                  onMove={(from, to) => makeMove({ from, to })}
                  moveHistory={moveHistory}
                  currentMoveIndex={currentMoveIndex}
                  disabled={false}
                />
                
                {currentPuzzle && (
                  <div className="puzzle-description">
                    <p>{currentPuzzle.description}</p>
                    {!state.isInstructorMode && currentPuzzle.requiredVariations.length > 0 && (
                      <div className="student-hint">
                        <strong>💡 Focus on starred (★) moves in the variation tree</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Variation Tree */}
              {state.showVariationTree && currentPuzzle && (
                <div className="tree-section">
                  {state.isInstructorMode && (
                    <div className="tree-controls">
                      <h4>Variation Filter:</h4>
                      <div className="filter-buttons">
                        <button
                          className={`filter-btn ${state.selectedVariationFilter === 'all' ? 'active' : ''}`}
                          onClick={() => updateState({ selectedVariationFilter: 'all' })}
                        >
                          All
                        </button>
                        <button
                          className={`filter-btn ${state.selectedVariationFilter === 'required' ? 'active' : ''}`}
                          onClick={() => updateState({ selectedVariationFilter: 'required' })}
                        >
                          Required
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

                  <ChessVariationTree
                    variations={filteredVariations}
                    currentMoveId={state.currentMoveId}
                    onMoveClick={handleVariationMoveClick}
                    onToggleRequired={handleToggleRequired}
                    isInstructor={state.isInstructorMode}
                    showOnlyRequired={state.selectedVariationFilter === 'required'}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PGN Import Modal */}
      {pgnImportData.showImporter && (
        <div className="modal-overlay">
          <div className="pgn-import-modal">
            <div className="modal-header">
              <h3>Import Chess Puzzles</h3>
              <button
                className="close-btn"
                onClick={() => setPgnImportData({ showImporter: false, pgnText: '', fileName: '' })}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {pgnImportData.fileName && (
                <div className="file-info">
                  📁 File: {pgnImportData.fileName}
                </div>
              )}
              
              <textarea
                value={pgnImportData.pgnText}
                onChange={(e) => setPgnImportData(prev => ({ ...prev, pgnText: e.target.value }))}
                placeholder="Paste PGN content here or upload a file..."
                rows={12}
                className="pgn-textarea"
              />
              
              <div className="modal-actions">
                <button
                  className="load-btn"
                  onClick={handleLoadPuzzles}
                  disabled={!pgnImportData.pgnText.trim() || state.isLoading}
                >
                  {state.isLoading ? 'Loading...' : '🧩 Load Puzzles'}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setPgnImportData({ showImporter: false, pgnText: '', fileName: '' })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chess-puzzle-trainer {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .trainer-header {
          max-width: 1400px;
          margin: 0 auto 20px auto;
        }

        .header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.95);
          padding: 16px 24px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .mode-toggle .mode-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mode-btn.instructor {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .mode-btn.student {
          background: linear-gradient(135deg, #f093fb, #f5576c);
          color: white;
        }

        .quick-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 16px;
          border: 2px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-btn.export {
          background: #28a745;
          color: white;
        }

        .action-btn.clear {
          background: #dc3545;
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 12px;
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

        .trainer-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .import-section {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .import-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }

        .import-card h2 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 2rem;
        }

        .import-card p {
          margin: 0 0 32px 0;
          color: #6c757d;
          line-height: 1.6;
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
          background: white;
          padding: 0 16px;
        }

        .sample-btn {
          padding: 12px 24px;
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sample-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .features-list {
          text-align: left;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .features-list h3 {
          margin: 0 0 12px 0;
          color: #495057;
        }

        .features-list ul {
          margin: 0;
          padding-left: 0;
          list-style: none;
        }

        .features-list li {
          padding: 4px 0;
          color: #6c757d;
        }

        .puzzle-interface {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .puzzle-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-bottom: 2px solid #dee2e6;
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

        .board-tree-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 24px;
          min-height: 600px;
        }

        .board-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .puzzle-description {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 12px;
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

        .tree-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tree-controls {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
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
          padding: 6px 12px;
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
          .board-tree-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .tree-section {
            order: -1;
          }
        }

        @media (max-width: 768px) {
          .chess-puzzle-trainer {
            padding: 10px;
          }

          .header-controls {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
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

          .board-tree-layout {
            padding: 16px;
          }

          .import-card {
            padding: 24px;
            margin: 10px;
          }

          .import-card h2 {
            font-size: 1.5rem;
          }

          .filter-buttons {
            flex-direction: column;
          }

          .filter-btn {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .meta-tags {
            flex-direction: column;
            align-items: flex-start;
          }

          .quick-actions {
            flex-direction: column;
            width: 100%;
          }

          .action-btn {
            width: 100%;
            text-align: center;
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
      `}</style>
    </div>
  );
};

export default ChessPuzzleTrainer;