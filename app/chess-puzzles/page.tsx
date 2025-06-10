// app/chess-puzzles/page.tsx
import { Metadata } from 'next';
import ChessPuzzleClientWrapper from '../../components/chess/ChessClientWrapper';

export const metadata: Metadata = {
  title: 'Chess Puzzles | Interactive Chess Puzzle Trainer',
  description: 'Learn chess tactics with interactive puzzles featuring variation trees and instructor-guided learning',
  keywords: ['chess', 'puzzles', 'tactics', 'training', 'variations', 'interactive'],
};

export default function ChessPuzzlesPage() {
  return (
    <main className="chess-puzzles-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🧩 Chess Puzzle Trainer</h1>
          <p>Master chess tactics with interactive puzzles and variation trees</p>
        </div>
      </div>
      
      <ChessPuzzleClientWrapper />
    </main>
  );
}