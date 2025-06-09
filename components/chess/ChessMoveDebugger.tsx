// src/components/chess/ChessMoveDebugger.tsx
'use client';

import React, { useState } from 'react';
import { ChessMove } from '../../types/chess';

interface ChessMoveDebuggerProps {
  position: string;
  moveHistory: ChessMove[];
  currentMoveIndex: number;
  onTestMove: (from: string, to: string) => boolean;
  onLoadPosition: (fen: string) => boolean;
}

const ChessMoveDebugger: React.FC<ChessMoveDebuggerProps> = ({
  position,
  moveHistory,
  currentMoveIndex,
  onTestMove,
  onLoadPosition
}) => {
  const [testFrom, setTestFrom] = useState('e2');
  const [testTo, setTestTo] = useState('e4');
  const [testFen, setTestFen] = useState('');
  const [lastMoveResult, setLastMoveResult] = useState<boolean | null>(null);

  const handleTestMove = () => {
    console.log('Testing move:', testFrom, 'to', testTo);
    const result = onTestMove(testFrom, testTo);
    setLastMoveResult(result);
    console.log('Move result:', result);
  };

  const handleLoadTestPosition = () => {
    if (testFen.trim()) {
      const result = onLoadPosition(testFen.trim());
      console.log('Load position result:', result);
    }
  };

  const commonTestPositions = [
    {
      name: 'Starting Position',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    },
    {
      name: 'After 1.e4',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
    },
    {
      name: 'After 1.e4 e5',
      fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2'
    },
    {
      name: 'Scholar\'s Mate Setup',
      fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3'
    }
  ];

  const commonTestMoves = [
    { from: 'e2', to: 'e4', name: 'King\'s Pawn' },
    { from: 'g1', to: 'f3', name: 'King\'s Knight' },
    { from: 'f1', to: 'c4', name: 'Bishop' },
    { from: 'e1', to: 'g1', name: 'Castling (if legal)' }
  ];

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="chess-move-debugger">
      <h4>🐛 Chess Move Debugger (Dev Only)</h4>
      
      {/* Current State */}
      <div className="debug-section">
        <h5>Current State</h5>
        <div className="debug-info-grid">
          <div className="debug-item">
            <strong>Position FEN:</strong>
            <code className="fen-code">{position}</code>
          </div>
          <div className="debug-item">
            <strong>Move Count:</strong>
            <span>{moveHistory.length}</span>
          </div>
          <div className="debug-item">
            <strong>Current Index:</strong>
            <span>{currentMoveIndex}</span>
          </div>
          <div className="debug-item">
            <strong>Turn:</strong>
            <span>{position.split(' ')[1] === 'w' ? 'White' : 'Black'}</span>
          </div>
        </div>
      </div>

      {/* Test Moves */}
      <div className="debug-section">
        <h5>Test Move</h5>
        <div className="test-move-controls">
          <div className="input-group">
            <label>From:</label>
            <input
              type="text"
              value={testFrom}
              onChange={(e) => setTestFrom(e.target.value)}
              placeholder="e2"
              maxLength={2}
            />
          </div>
          <div className="input-group">
            <label>To:</label>
            <input
              type="text"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="e4"
              maxLength={2}
            />
          </div>
          <button onClick={handleTestMove} className="test-btn">
            Test Move
          </button>
          {lastMoveResult !== null && (
            <span className={`result ${lastMoveResult ? 'success' : 'failure'}`}>
              {lastMoveResult ? '✅ Valid' : '❌ Invalid'}
            </span>
          )}
        </div>
        
        <div className="quick-moves">
          <strong>Quick Test Moves:</strong>
          <div className="quick-move-buttons">
            {commonTestMoves.map((move, index) => (
              <button
                key={index}
                onClick={() => {
                  setTestFrom(move.from);
                  setTestTo(move.to);
                }}
                className="quick-move-btn"
                title={move.name}
              >
                {move.from}-{move.to}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Load Test Positions */}
      <div className="debug-section">
        <h5>Load Test Position</h5>
        <div className="position-controls">
          <div className="input-group full-width">
            <label>FEN:</label>
            <input
              type="text"
              value={testFen}
              onChange={(e) => setTestFen(e.target.value)}
              placeholder="Enter FEN string..."
              className="fen-input"
            />
          </div>
          <button onClick={handleLoadTestPosition} className="test-btn">
            Load Position
          </button>
        </div>
        
        <div className="preset-positions">
          <strong>Preset Positions:</strong>
          <div className="preset-buttons">
            {commonTestPositions.map((pos, index) => (
              <button
                key={index}
                onClick={() => setTestFen(pos.fen)}
                className="preset-btn"
                title={pos.fen}
              >
                {pos.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Move History Debug */}
      <div className="debug-section">
        <h5>Move History</h5>
        <div className="move-history-debug">
          {moveHistory.length === 0 ? (
            <span className="no-moves">No moves yet</span>
          ) : (
            <div className="moves-grid">
              {moveHistory.map((move, index) => (
                <div
                  key={index}
                  className={`move-debug-item ${index === currentMoveIndex - 1 ? 'current' : ''}`}
                >
                  <span className="move-number">{index + 1}.</span>
                  <span className="move-san">{move.san}</span>
                  <span className="move-from-to">{move.from}-{move.to}</span>
                  <span className="move-flags">{move.flags}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .chess-move-debugger {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .chess-move-debugger h4 {
          margin: 0 0 16px 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .debug-section {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #dee2e6;
        }

        .debug-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .debug-section h5 {
          margin: 0 0 12px 0;
          color: #6c757d;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .debug-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .debug-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .debug-item strong {
          font-size: 0.8rem;
          color: #495057;
        }

        .fen-code {
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          border: 1px solid #dee2e6;
          word-break: break-all;
        }

        .test-move-controls {
          display: flex;
          align-items: end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .input-group.full-width {
          flex: 1;
          min-width: 300px;
        }

        .input-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #495057;
        }

        .input-group input {
          padding: 6px 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          font-size: 0.9rem;
          width: 60px;
        }

        .fen-input {
          width: 100% !important;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
        }

        .test-btn {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .test-btn:hover {
          background: #0056b3;
        }

        .result {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .result.success {
          background: #d4edda;
          color: #155724;
        }

        .result.failure {
          background: #f8d7da;
          color: #721c24;
        }

        .quick-moves, .preset-positions {
          margin-top: 12px;
        }

        .quick-moves strong, .preset-positions strong {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: #495057;
        }

        .quick-move-buttons, .preset-buttons {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .quick-move-btn, .preset-btn {
          padding: 4px 8px;
          background: #e9ecef;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          font-family: 'Courier New', monospace;
        }

        .quick-move-btn:hover, .preset-btn:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .position-controls {
          display: flex;
          gap: 12px;
          align-items: end;
        }

        .move-history-debug {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background: white;
        }

        .no-moves {
          display: block;
          padding: 16px;
          text-align: center;
          color: #6c757d;
          font-style: italic;
        }

        .moves-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1px;
          background: #dee2e6;
        }

        .move-debug-item {
          background: white;
          padding: 8px;
          display: grid;
          grid-template-columns: 30px 1fr 1fr 40px;
          gap: 8px;
          align-items: center;
          font-size: 0.8rem;
        }

        .move-debug-item.current {
          background: #e3f2fd;
          font-weight: 600;
        }

        .move-number {
          color: #6c757d;
        }

        .move-san {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .move-from-to {
          font-family: 'Courier New', monospace;
          color: #495057;
          font-size: 0.75rem;
        }

        .move-flags {
          font-family: 'Courier New', monospace;
          color: #6c757d;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
};

export default ChessMoveDebugger;