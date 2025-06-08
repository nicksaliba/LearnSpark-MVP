// src/utils/chess-debug.ts
import { Chess } from 'chess.js';

export const debugChessJs = () => {
  console.log('=== Chess.js Debug Information ===');
  
  try {
    const chess = new Chess();
    console.log('✅ Chess instance created successfully');
    console.log('Chess.js version/methods available:');
    
    // Log all available methods
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(chess));
    console.log('Available methods:', methods.sort());
    
    // Test basic methods
    console.log('--- Testing Basic Methods ---');
    
    try {
      const fen = chess.fen();
      console.log('✅ fen():', fen);
    } catch (e) {
      console.log('❌ fen() failed:', e);
    }
    
    try {
      const turn = chess.turn();
      console.log('✅ turn():', turn);
    } catch (e) {
      console.log('❌ turn() failed:', e);
    }
    
    // Test game state methods
    console.log('--- Testing Game State Methods ---');
    const gameStateMethods = [
      'isGameOver', 'gameOver', 'game_over',
      'inCheck', 'in_check',
      'isCheckmate', 'isCheckmate', 'in_checkmate',
      'isStalemate', 'in_stalemate',
      'isDraw', 'in_draw',
      'isInsufficientMaterial', 'insufficient_material',
      'isThreefoldRepetition', 'in_threefold_repetition'
    ];
    
    gameStateMethods.forEach(method => {
      try {
        const result = (chess as any)[method];
        if (typeof result === 'function') {
          const value = result.call(chess);
          console.log(`✅ ${method}():`, value);
        } else {
          console.log(`❌ ${method} is not a function`);
        }
      } catch (e) {
        console.log(`❌ ${method} failed:`, e);
      }
    });
    
    // Test FEN loading
    console.log('--- Testing FEN Loading ---');
    const testFens = [
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3'
    ];
    
    testFens.forEach((fen, index) => {
      try {
        chess.reset();
        const result = chess.load(fen);
        console.log(`✅ Test FEN ${index + 1} load result:`, result);
      } catch (e) {
        console.log(`❌ Test FEN ${index + 1} failed:`, e);
      }
    });
    
    // Test moves
    console.log('--- Testing Moves ---');
    try {
      chess.reset();
      const moves = chess.moves();
      console.log('✅ moves() count:', moves.length);
      console.log('Sample moves:', moves.slice(0, 5));
    } catch (e) {
      console.log('❌ moves() failed:', e);
    }
    
    try {
      chess.reset();
      const move = chess.move('e4');
      console.log('✅ move("e4"):', move);
    } catch (e) {
      console.log('❌ move("e4") failed:', e);
    }
    
  } catch (error) {
    console.log('❌ Failed to create Chess instance:', error);
  }
  
  console.log('=== End Chess.js Debug ===');
};

// Call this function in development to debug
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugChessJs = debugChessJs;
}