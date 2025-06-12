// index.ts - Main export file for Enhanced Chess Puzzle System
'use client';
// Main Components
export { default as EnhancedPuzzleSystem } from '../../components/chess/EnhancedPyzzleSystem';
export { default as ChessBoard } from '../../components/chess//ChessBoard';
export { default as HorizontalVariationTree } from '../../components/chess/HorizontalVariationTree';

// Types
export type {
  ChessMove,
  VariationNode,
  ChessPuzzle,
  PuzzleMessage,
  PuzzleState,
  ChessBoardProps,
  HorizontalVariationTreeProps,
  EnhancedPuzzleManagerProps,
  PuzzleDifficulty,
  PlayerColor,
  MessageType,
  TreeNode,
  StudentProgress,
  InstructorControls,
  MoveCallback,
  VariationClickCallback,
  RequiredToggleCallback,
  HintableToggleCallback,
  PuzzleLoadCallback,
  PositionLoadCallback
} from '../../types/types';

// Sample Data
export { samplePuzzleData } from '../../data/samplePuzzleData';

// Utility Functions
export const createEmptyPuzzle = (): ChessPuzzle => ({
  id: `puzzle-${Date.now()}`,
  title: "New Puzzle",
  description: "Add your puzzle description here",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  solution: [],
  variations: [],
  difficulty: "beginner",
  themes: [],
  requiredVariations: [],
  annotations: {},
  metadata: {
    source: "Custom",
    date: new Date().toISOString().split('T')[0],
    white: "Student",
    black: "Computer",
    event: "Training",
    result: "*"
  }
});

export const validatePuzzleData = (puzzle: Partial<ChessPuzzle>): string[] => {
  const errors: string[] = [];
  
  if (!puzzle.id) errors.push("Puzzle ID is required");
  if (!puzzle.title) errors.push("Puzzle title is required");
  if (!puzzle.fen) errors.push("Starting FEN position is required");
  if (!puzzle.variations || puzzle.variations.length === 0) {
    errors.push("At least one variation is required");
  }
  
  // Validate FEN format (basic check)
  if (puzzle.fen && !puzzle.fen.match(/^[rnbqkpRNBQKP1-8\/]+\s[wb]\s[KQkq-]+\s[a-h3-6-]+\s\d+\s\d+$/)) {
    errors.push("Invalid FEN format");
  }
  
  return errors;
};

export const calculatePuzzleStats = (puzzle: ChessPuzzle) => {
  const stats = {
    totalVariations: puzzle.variations.length,
    requiredVariations: puzzle.variations.filter(v => v.isRequired).length,
    mainLineLength: puzzle.variations.filter(v => v.isMainLine).length,
    maxDepth: Math.max(...puzzle.variations.map(v => v.depth), 0),
    annotatedMoves: puzzle.variations.filter(v => v.annotation).length,
    themes: puzzle.themes.length,
    difficulty: puzzle.difficulty
  };
  
  return stats;
};

// Hook for managing puzzle state
import { useState, useCallback, useMemo } from 'react';
import type { ChessPuzzle, PuzzleMessage, ChessMove, VariationNode } from './types';

export const usePuzzleState = (initialPuzzle: ChessPuzzle) => {
  const [currentPosition, setCurrentPosition] = useState<string>(initialPuzzle.fen);
  const [currentMoveId, setCurrentMoveId] = useState<string | null>(null);
  const [requiredNodes, setRequiredNodes] = useState<Set<string>>(
    new Set(initialPuzzle.variations.filter(v => v.isRequired).map(v => v.id))
  );
  const [revealedNodes, setRevealedNodes] = useState<Set<string>>(new Set());
  const [solveMode, setSolveMode] = useState<boolean>(false);
  const [message, setMessage] = useState<PuzzleMessage | null>(null);
  const [lastMove, setLastMove] = useState<ChessMove | null>(null);

  const variationMap = useMemo(() => {
    const map: Record<string, VariationNode> = {};
    initialPuzzle.variations.forEach(variation => {
      map[variation.id] = variation;
    });
    return map;
  }, [initialPuzzle.variations]);

  const resetPuzzle = useCallback(() => {
    setCurrentPosition(initialPuzzle.fen);
    setCurrentMoveId(null);
    setRevealedNodes(new Set());
    setSolveMode(false);
    setLastMove(null);
    setMessage(null);
  }, [initialPuzzle.fen]);

  const toggleRequired = useCallback((nodeId: string) => {
    setRequiredNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const revealNode = useCallback((nodeId: string) => {
    setRevealedNodes(prev => new Set([...prev, nodeId]));
  }, []);

  const showMessage = useCallback((type: PuzzleMessage['type'], text: string) => {
    setMessage({ type, text });
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return {
    // State
    currentPosition,
    currentMoveId,
    requiredNodes,
    revealedNodes,
    solveMode,
    message,
    lastMove,
    variationMap,
    
    // Setters
    setCurrentPosition,
    setCurrentMoveId,
    setSolveMode,
    setLastMove,
    
    // Actions
    resetPuzzle,
    toggleRequired,
    revealNode,
    showMessage,
    clearMessage
  };
};