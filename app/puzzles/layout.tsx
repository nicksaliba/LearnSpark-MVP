// app/puzzles/layout.tsx - Layout for Chess Puzzles Section
import type { Metadata } from 'next';
import './page.css';

export const metadata: Metadata = {
  title: 'Enhanced Chess Puzzles | Interactive Puzzle Training',
  description: 'Master chess tactics with interactive puzzles featuring horizontal variation trees, intelligent move analysis, and instructor-guided learning',
  keywords: [
    'chess puzzles',
    'chess tactics',
    'puzzle training',
    'variation trees',
    'chess instructor',
    'interactive chess',
    'chess education',
    'tactical training'
  ],
  openGraph: {
    title: 'Enhanced Chess Puzzles | LearnSpark',
    description: 'Interactive chess puzzle training with advanced variation analysis',
    images: ['/chess-puzzles-preview.jpg'],
  },
};

export default function PuzzlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="puzzles-layout">
      <div className="puzzles-container">
        {children}
      </div>
    </div>
  );
}

// Add some additional layout styles
const layoutStyles = `
.puzzles-layout {
  min-height: 100vh;
  position: relative;
}

.puzzles-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* Ensure proper spacing and scrolling */
.puzzles-layout .enhanced-puzzle-page {
  padding: 20px;
}

@media (max-width: 768px) {
  .puzzles-layout .enhanced-puzzle-page {
    padding: 10px;
  }
}

/* Smooth scrolling for navigation between sections */
html {
  scroll-behavior: smooth;
}

/* Focus management for accessibility */
.puzzles-layout :focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  border-radius: 4px;
}
`;