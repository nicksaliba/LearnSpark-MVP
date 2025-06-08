// src/app/chess/page.tsx
import { Metadata } from 'next';
import ChessClientWrapper from '../../components/chess/ChessClientWrapper';

export const metadata: Metadata = {
  title: 'Chess Editor | Interactive Chess Studies',
  description: 'Create and study chess positions with our interactive chess editor',
  keywords: ['chess', 'study', 'analysis', 'interactive', 'board'],
};

export default function ChessPage() {
  return (
    <main className="chess-page">
      <ChessClientWrapper />
    </main>
  );
}