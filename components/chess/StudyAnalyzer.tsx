// src/components/chess/StudyAnalyzer.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { ChessStudy, ChessMove } from '../../types/chess';
import { calculateMaterial, isTheoreticalDraw } from '../../utils/chessUtils';

interface StudyAnalyzerProps {
  study: ChessStudy | null;
  currentChapter: number;
  moveHistory: ChessMove[];
  currentMoveIndex: number;
}

interface PositionAnalysis {
  material: {
    white: number;
    black: number;
    balance: number;
  };
  pieceActivity: {
    whitePieces: number;
    blackPieces: number;
    centerControl: number;
  };
  kingSafety: {
    whiteKingSafety: 'safe' | 'exposed' | 'danger';
    blackKingSafety: 'safe' | 'exposed' | 'danger';
  };
  isTheoreticalDraw: boolean;
  phase: 'opening' | 'middlegame' | 'endgame';
}

interface StudyStatistics {
  totalMoves: number;
  averageMovesPerChapter: number;
  annotationCoverage: number;
  tacticalMoves: number;
  openingMoves: number;
  endgameMoves: number;
}

const StudyAnalyzer: React.FC<StudyAnalyzerProps> = ({
  study,
  currentChapter,
  moveHistory,
  currentMoveIndex
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [analysis, setAnalysis] = useState<PositionAnalysis | null>(null);
  const [studyStats, setStudyStats] = useState<StudyStatistics | null>(null);

  // Analyze current position
  const analyzePosition = useMemo(() => {
    if (!currentPosition) return null;

    try {
      const chess = new Chess(currentPosition);
      const material = calculateMaterial(currentPosition);
      
      // Count developed pieces (rough heuristic)
      const board = chess.board();
      let whitePieces = 0;
      let blackPieces = 0;
      let centerControl = 0;

      // Analyze board squares
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece) {
            if (piece.color === 'w') {
              whitePieces++;
              // Center squares bonus
              if ((rank >= 3 && rank <= 4) && (file >= 3 && file <= 4)) {
                centerControl += 1;
              }
            } else {
              blackPieces++;
              // Center squares bonus
              if ((rank >= 3 && rank <= 4) && (file >= 3 && file <= 4)) {
                centerControl -= 1;
              }
            }
          }
        }
      }

      // Determine game phase
      let phase: 'opening' | 'middlegame' | 'endgame' = 'opening';
      const totalPieces = whitePieces + blackPieces;
      if (totalPieces <= 12) {
        phase = 'endgame';
      } else if (currentMoveIndex > 15) {
        phase = 'middlegame';
      }

      // Basic king safety evaluation (corrected for chess.js v1.3.1)
      let whiteKingSafety: 'safe' | 'exposed' | 'danger' = 'safe';
      let blackKingSafety: 'safe' | 'exposed' | 'danger' = 'safe';
      
      // Find king positions by iterating through the board
      let whiteKingSquare = '';
      let blackKingSquare = '';
      
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const piece = board[rank][file];
          if (piece && piece.type === 'k') {
            const square = String.fromCharCode(97 + file) + (8 - rank).toString();
            if (piece.color === 'w') {
              whiteKingSquare = square;
            } else {
              blackKingSquare = square;
            }
          }
        }
      }
      
      // Evaluate king safety based on position and game state
      if (chess.inCheck()) {
        if (chess.turn() === 'w') {
          whiteKingSafety = 'danger';
        } else {
          blackKingSafety = 'danger';
        }
      } else {
        // King safety heuristics
        if (whiteKingSquare === 'e1') {
          whiteKingSafety = 'exposed'; // King still in center
        } else if (whiteKingSquare === 'g1' || whiteKingSquare === 'c1') {
          whiteKingSafety = 'safe'; // Castled
        }
        
        if (blackKingSquare === 'e8') {
          blackKingSafety = 'exposed'; // King still in center
        } else if (blackKingSquare === 'g8' || blackKingSquare === 'c8') {
          blackKingSafety = 'safe'; // Castled
        }
      }

      return {
        material,
        pieceActivity: {
          whitePieces,
          blackPieces,
          centerControl
        },
        kingSafety: {
          whiteKingSafety,
          blackKingSafety
        },
        isTheoreticalDraw: isTheoreticalDraw(currentPosition),
        phase
      };
    } catch (error) {
      console.error('Error analyzing position:', error);
      return null;
    }
  }, [currentPosition, currentMoveIndex]);

  // Calculate study statistics
  const calculateStudyStats = useMemo((): StudyStatistics | null => {
    if (!study) return null;

    let totalMoves = 0;
    let totalAnnotations = 0;
    let totalPossibleAnnotations = 0;
    let tacticalMoves = 0;
    let openingMoves = 0;
    let endgameMoves = 0;

    study.chapters.forEach(chapter => {
      const chapterMoves = chapter.moves?.length || 0;
      totalMoves += chapterMoves;

      // Count annotations
      const annotations = Object.keys(chapter.annotations || {});
      totalAnnotations += annotations.length;
      totalPossibleAnnotations += chapterMoves;

      // Categorize moves (basic heuristics)
      if (chapterMoves > 0) {
        if (chapterMoves <= 20) {
          openingMoves += chapterMoves;
        } else if (chapterMoves <= 40) {
          // Middle game moves might contain tactics
          tacticalMoves += Math.floor(chapterMoves * 0.3);
        } else {
          endgameMoves += chapterMoves - 40;
        }
      }
    });

    return {
      totalMoves,
      averageMovesPerChapter: totalMoves / study.chapters.length,
      annotationCoverage: totalPossibleAnnotations > 0 ? 
        (totalAnnotations / totalPossibleAnnotations) * 100 : 0,
      tacticalMoves,
      openingMoves,
      endgameMoves
    };
  }, [study]);

  // Update current position based on move history
  useEffect(() => {
    if (moveHistory.length > 0 && currentMoveIndex >= 0) {
      try {
        const chess = new Chess();
        for (let i = 0; i < currentMoveIndex; i++) {
          if (moveHistory[i]) {
            chess.move(moveHistory[i]);
          }
        }
        setCurrentPosition(chess.fen());
      } catch (error) {
        console.error('Error updating position:', error);
      }
    } else {
      setCurrentPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
  }, [moveHistory, currentMoveIndex]);

  // Update analysis when position changes
  useEffect(() => {
    setAnalysis(analyzePosition);
  }, [analyzePosition]);

  // Update study stats when study changes
  useEffect(() => {
    setStudyStats(calculateStudyStats);
  }, [calculateStudyStats]);

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'opening': return '🏁';
      case 'middlegame': return '⚔️';
      case 'endgame': return '👑';
      default: return '♟️';
    }
  };

  const getKingSafetyColor = (safety: string) => {
    switch (safety) {
      case 'safe': return '#28a745';
      case 'exposed': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (!study) {
    return (
      <div className="study-analyzer">
        <p>No study selected for analysis.</p>
      </div>
    );
  }

  return (
    <div className="study-analyzer">
      <h4>📊 Study Analysis</h4>
      
      {/* Current Position Analysis */}
      {analysis && (
        <div className="position-analysis">
          <h5>Current Position</h5>
          
          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="card-header">
                <span className="card-icon">{getPhaseIcon(analysis.phase)}</span>
                <span className="card-title">Game Phase</span>
              </div>
              <div className="card-content">
                <span className="phase-badge">{analysis.phase}</span>
              </div>
            </div>

            <div className="analysis-card">
              <div className="card-header">
                <span className="card-icon">⚖️</span>
                <span className="card-title">Material</span>
              </div>
              <div className="card-content">
                <div className="material-balance">
                  <span className="white-material">♔ {analysis.material.white}</span>
                  <span className="balance" 
                        style={{ color: analysis.material.balance > 0 ? '#fff' : 
                                      analysis.material.balance < 0 ? '#000' : '#666' }}>
                    {analysis.material.balance > 0 ? '+' : ''}{analysis.material.balance}
                  </span>
                  <span className="black-material">♚ {analysis.material.black}</span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <div className="card-header">
                <span className="card-icon">🎯</span>
                <span className="card-title">Center Control</span>
              </div>
              <div className="card-content">
                <div className="center-control">
                  <div className="control-bar">
                    <div 
                      className="control-fill"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, 50 + (analysis.pieceActivity.centerControl * 10)))}%`,
                        background: analysis.pieceActivity.centerControl > 0 ? '#007bff' : '#dc3545'
                      }}
                    ></div>
                  </div>
                  <span className="control-value">
                    {analysis.pieceActivity.centerControl > 0 ? '+' : ''}{analysis.pieceActivity.centerControl}
                  </span>
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <div className="card-header">
                <span className="card-icon">🛡️</span>
                <span className="card-title">King Safety</span>
              </div>
              <div className="card-content">
                <div className="king-safety">
                  <div className="king-status">
                    <span style={{ color: getKingSafetyColor(analysis.kingSafety.whiteKingSafety) }}>
                      ♔ {analysis.kingSafety.whiteKingSafety}
                    </span>
                  </div>
                  <div className="king-status">
                    <span style={{ color: getKingSafetyColor(analysis.kingSafety.blackKingSafety) }}>
                      ♚ {analysis.kingSafety.blackKingSafety}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analysis.isTheoreticalDraw && (
            <div className="draw-notice">
              <span className="draw-icon">🤝</span>
              <span>Theoretical Draw Position</span>
            </div>
          )}
        </div>
      )}

      {/* Study Statistics */}
      {studyStats && (
        <div className="study-statistics">
          <h5>📈 Study Statistics</h5>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{studyStats.totalMoves}</div>
              <div className="stat-label">Total Moves</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{study.chapters.length}</div>
              <div className="stat-label">Chapters</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{Math.round(studyStats.averageMovesPerChapter)}</div>
              <div className="stat-label">Avg Moves/Chapter</div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">{Math.round(studyStats.annotationCoverage)}%</div>
              <div className="stat-label">Annotation Coverage</div>
            </div>
          </div>

          <div className="move-distribution">
            <h6>Move Distribution</h6>
            <div className="distribution-bars">
              <div className="distribution-item">
                <span className="distribution-label">Opening</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill opening"
                    style={{ width: `${(studyStats.openingMoves / studyStats.totalMoves) * 100}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{studyStats.openingMoves}</span>
              </div>
              
              <div className="distribution-item">
                <span className="distribution-label">Tactical</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill tactical"
                    style={{ width: `${(studyStats.tacticalMoves / studyStats.totalMoves) * 100}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{studyStats.tacticalMoves}</span>
              </div>
              
              <div className="distribution-item">
                <span className="distribution-label">Endgame</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill endgame"
                    style={{ width: `${(studyStats.endgameMoves / studyStats.totalMoves) * 100}%` }}
                  ></div>
                </div>
                <span className="distribution-value">{studyStats.endgameMoves}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(StudyAnalyzer);