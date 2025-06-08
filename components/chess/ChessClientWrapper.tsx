// src/components/chess/ChessClientWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import with ssr: false in client component
const ChessEditor = dynamic(
  () => import('./ChessEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="chess-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading Chess Editor...</span>
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

export default function ChessClientWrapper() {
  return (
    <ChessErrorBoundary>
      <ChessEditor />
    </ChessErrorBoundary>
  );
}