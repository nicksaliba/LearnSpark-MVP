// src/types/chess.ts

// Chess.js v1.3.1 types
export interface ChessMove {
  color: 'w' | 'b';
  from: string;
  to: string;
  flags: string;
  piece: string;
  san: string;
  captured?: string;
  promotion?: string;
  lan?: string;
}

export interface ChessPiece {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
}

export interface ChessInstance {
  ascii(): string;
  board(): Array<Array<ChessPiece | null>>;
  clear(): void;
  fen(): string;
  isGameOver(): boolean;
  gameOver(): boolean; // Alternative method name
  get(square: string): ChessPiece | null;
  history(options?: { verbose: boolean }): string[] | ChessMove[];
  inCheck(): boolean;
  isCheckmate(): boolean;
  isDraw(): boolean;
  isStalemate(): boolean;
  isThreefoldRepetition(): boolean;
  isInsufficientMaterial(): boolean;
  load(fen: string): boolean | void; // Can return boolean or void depending on version
  loadPgn(pgn: string, options?: any): boolean;
  move(move: string | { from: string; to: string; promotion?: string }): ChessMove | null;
  moves(options?: { square?: string; verbose?: boolean }): string[] | ChessMove[];
  pgn(): string;
  put(piece: ChessPiece, square: string): boolean;
  remove(square: string): ChessPiece | null;
  reset(): void; // Always returns void
  squareColor(square: string): 'light' | 'dark';
  turn(): 'w' | 'b';
  undo(): ChessMove | null;
  validateFen(fen: string): { valid: boolean; error_number: number; error: string };
}

export interface ChessPosition {
  fen: string;
  turn: 'w' | 'b';
  castling: string;
  enPassant: string | null;
  halfmove: number;
  fullmove: number;
}

export interface Annotation {
  [moveIndex: number]: string;
}

export interface ChessChapter {
  id?: string;
  name: string;
  description?: string;
  startingFen: string;
  moves?: ChessMove[];
  annotations: Annotation;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChessStudy {
  id: string;
  name: string;
  description: string;
  chapters: ChessChapter[];
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface GameState {
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  result: string;
  winner?: 'white' | 'black' | 'draw';
}

export interface ChessBoardProps {
  position: string;
  onMove: (sourceSquare: string, targetSquare: string) => boolean;
  moveHistory: ChessMove[];
  currentMoveIndex: number;
  orientation?: 'white' | 'black';
  disabled?: boolean;
}

export interface MoveListProps {
  moves: ChessMove[];
  currentMoveIndex: number;
  onMoveClick: (moveIndex: number) => void;
  annotations: Annotation;
}

export interface StudyManagerProps {
  studies: ChessStudy[];
  currentStudy: ChessStudy | null;
  onStudySelect: (study: ChessStudy) => void;
  onCreateStudy: (studyData: CreateStudyData) => void; // Changed to use CreateStudyData
  onDeleteStudy?: (studyId: string) => void;
  onUpdateStudy?: (studyId: string, updates: Partial<ChessStudy>) => void;
}

export interface ChessEditorState {
  currentStudy: ChessStudy | null;
  currentChapter: number;
  studies: ChessStudy[];
  annotations: Annotation;
  newComment: string;
  isLoading: boolean;
  error: string | null;
}

export interface UseChessReturn {
  chess: ChessInstance;
  position: string;
  moveHistory: ChessMove[];
  currentMoveIndex: number;
  gameState: GameState;
  makeMove: (move: string | { from: string; to: string; promotion?: string }) => ChessMove | null;
  goToMove: (moveIndex: number) => boolean;
  resetGame: () => void;
  loadPosition: (fen: string) => boolean;
  loadPgn: (pgn: string) => boolean; // Add PGN loading
  undoMove: () => ChessMove | null;
  redoMove: () => boolean;
  isLegalMove: (from: string, to: string) => boolean;
  getLegalMoves: (square?: string) => string[];
}

export interface CreateStudyData {
  name: string;
  description?: string;
  startingFen?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface ChessError {
  type: 'INVALID_MOVE' | 'INVALID_FEN' | 'GAME_OVER' | 'UNKNOWN';
  message: string;
  details?: any;
}

// Utility types
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export type Square = string; // e.g., 'e4', 'a1', etc.

export interface SquareStyles {
  [square: string]: {
    background?: string;
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
  };
}

export interface CustomPieceProps {
  squareWidth: number;
  isDragging?: boolean;
}