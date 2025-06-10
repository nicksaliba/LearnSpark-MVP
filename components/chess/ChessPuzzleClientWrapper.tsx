import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with ssr: false for client-only components
const ChessPuzzleTrainer = dynamic(
  () => import('./ChessPuzzleTrainer'),
  { 
    ssr: false,
    loading: () => (
      <div className="puzzle-loading">
        <div className="loading-container">
          <div className="spinner-puzzle">
            <div className="puzzle-piece">🧩</div>
          </div>
          <h3>Loading Chess Puzzle Trainer...</h3>
          <p>Preparing interactive puzzle system</p>
        </div>
      </div>
    )
  }
);

const ChessErrorBoundary = dynamic(
  () => import('./ChessErrorBoundary'),
  { 
    ssr: false,
    loading: () => <div>Loading error handler...</div>
  }
);

export default function ChessPuzzleClientWrapper() {
  return (
    <div className="chess-puzzle-wrapper">
      <ChessErrorBoundary>
        <ChessPuzzleTrainer />
      </ChessErrorBoundary>
      
      <style jsx>{`
        .chess-puzzle-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .puzzle-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .loading-container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
        }

        .spinner-puzzle {
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .puzzle-piece {
          font-size: 4rem;
          animation: puzzleBounce 1.5s ease-in-out infinite;
        }

        @keyframes puzzleBounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          40% {
            transform: translateY(-20px) rotate(5deg);
          }
          60% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        .loading-container h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 1.5rem;
        }

        .loading-container p {
          margin: 0;
          color: #6c757d;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}