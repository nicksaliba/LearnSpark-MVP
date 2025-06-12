// types.ts - Chess Puzzle System Type Definitions

export interface ChessMove {
  from: string;
  to: string;
  san: string;
  piece?: string;
  captured?: string;
  promotion?: string;
  flags?: string;
  color?: 'w' | 'b';
}

export interface VariationNode {
  id: string;
  move: ChessMove | null;
  notation: string;
  fen: string;
  children: string[];
  parent: string | null;
  depth: number;
  isMainLine: boolean;
  isRequired: boolean;
  moveNumber: number;
  color: 'w' | 'b';
  annotation?: string;
  evaluation?: string;
}

export interface ChessPuzzle {
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
    result?: string;
    eco?: string;
    opening?: string;
  };
}

export interface PuzzleMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

export interface PuzzleState {
  puzzleData: ChessPuzzle;
  currentPosition: string;
  currentMoveId: string | null;
  isInstructorMode: boolean;
  requiredNodes: Set<string>;
  revealedNodes: Set<string>;
  solveMode: boolean;
  message: PuzzleMessage | null;
  lastMove: ChessMove | null;
}

// Props interfaces
export interface ChessBoardProps {
  position: string;
  onMove: (from: string, to: string) => boolean;
  lastMove?: ChessMove | null;
  disabled?: boolean;
  orientation?: 'white' | 'black';
}

export interface HorizontalVariationTreeProps {
  variations: VariationNode[];
  currentMoveId: string | null;
  onMoveClick: (nodeId: string, fen: string) => void;
  onToggleRequired: (nodeId: string, required: boolean) => void;
  isInstructor: boolean;
  requiredNodes: Set<string>;
  revealedNodes: Set<string>;
  title?: string;
  showOnlyRequired?: boolean;
  hintableNodes?: Set<string>;
  onToggleHintable?: (nodeId: string, hintable: boolean) => void;
}

export interface EnhancedPuzzleManagerProps {
  onLoadPosition: (fen: string) => void;
  onLoadPuzzles?: (puzzles: ChessPuzzle[]) => void;
  isInstructor: boolean;
}

// Utility types
export type PuzzleDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PlayerColor = 'w' | 'b';
export type MessageType = 'success' | 'error' | 'info' | 'warning';

// Tree structure for rendering (different from flat VariationNode structure)
export interface TreeNode {
  id: string;
  move: ChessMove | null;
  notation: string;
  fen: string;
  children: TreeNode[]; // TreeNode children, not string IDs
  parent: string | null;
  depth: number;
  isMainLine: boolean;
  isRequired: boolean;
  moveNumber: number;
  color: 'w' | 'b';
  annotation?: string;
  evaluation?: string;
}

export interface StudentProgress {
  totalMoves: number;
  requiredMoves: number;
  revealedMoves: number;
  correctAttempts: number;
  totalAttempts: number;
  currentStreak: number;
  hintsUsed: number;
}

export interface InstructorControls {
  canMarkRequired: boolean;
  canMarkHintable: boolean;
  canEditAnnotations: boolean;
  canExportConfiguration: boolean;
}

// Events and callbacks
export type MoveCallback = (from: string, to: string) => boolean;
export type VariationClickCallback = (nodeId: string, fen: string) => void;
export type RequiredToggleCallback = (nodeId: string, required: boolean) => void;
export type HintableToggleCallback = (nodeId: string, hintable: boolean) => void;
export type PuzzleLoadCallback = (puzzles: ChessPuzzle[]) => void;
export type PositionLoadCallback = (fen: string) => void;