// app/puzzles/page.tsx - Simple Fallback Version
'use client';

import React, { useState } from 'react';

// Simple fallback puzzle page in case the enhanced system has issues
export default function ChessPuzzlesPageFallback() {
  const [selectedMode, setSelectedMode] = useState<'instructor' | 'student'>('student');

  return (
    <div className="chess-puzzles-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>🧩 Chess Puzzles</h1>
          <p>Interactive chess puzzle training system</p>
        </div>
        
        <div className="mode-selector">
          <button
            className={`mode-btn ${selectedMode === 'instructor' ? 'active' : ''}`}
            onClick={() => setSelectedMode('instructor')}
          >
            👨‍🏫 Instructor Mode
          </button>
          <button
            className={`mode-btn ${selectedMode === 'student' ? 'active' : ''}`}
            onClick={() => setSelectedMode('student')}
          >
            👨‍🎓 Student Mode
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-card">
          <h2>Chess Puzzle Features</h2>
          
          {selectedMode === 'instructor' ? (
            <div className="instructor-features">
              <h3>Instructor Features:</h3>
              <ul>
                <li>🌳 Interactive horizontal variation trees</li>
                <li>⭐ Mark essential variations for students</li>
                <li>🎯 Multiple puzzle navigation and management</li>
                <li>📊 Automatic difficulty and theme detection</li>
                <li>💾 Save puzzle configurations for student use</li>
                <li>📤 Export customized puzzle sets</li>
                <li>📝 Add annotations and hints</li>
                <li>🔧 Configure puzzle requirements</li>
              </ul>
            </div>
          ) : (
            <div className="student-features">
              <h3>Student Features:</h3>
              <ul>
                <li>🎯 Focus on instructor-selected key variations</li>
                <li>⭐ Clear marking of essential moves to study</li>
                <li>📈 Progressive difficulty and themed learning</li>
                <li>🧩 Interactive puzzle solving with hints</li>
                <li>📊 Track your progress and performance</li>
                <li>💡 Get hints when you're stuck</li>
                <li>🔄 Reset and retry puzzles</li>
                <li>🏆 Earn achievements for completing puzzles</li>
              </ul>
            </div>
          )}

          <div className="import-section">
            <h3>📁 Import Chess Puzzles</h3>
            <p>Load PGN files containing tactical puzzles with variations</p>
            
            <div className="import-options">
              <button className="import-btn">
                📁 Upload PGN File
              </button>
              <button className="import-btn">
                🎯 Try Sample Puzzles
              </button>
            </div>
          </div>

          <div className="coming-soon">
            <h3>🚀 Coming Soon</h3>
            <p>The enhanced chess puzzle system is being prepared. Features include:</p>
            <ul>
              <li>Real-time puzzle solving</li>
              <li>Advanced variation tree visualization</li>
              <li>Progress tracking and analytics</li>
              <li>Collaborative puzzle creation</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chess-puzzles-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .page-header {
          max-width: 1200px;
          margin: 0 auto 24px auto;
          background: rgba(255, 255, 255, 0.95);
          padding: 24px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-content p {
          margin: 0;
          color: #6c757d;
          font-size: 1.1rem;
        }

        .mode-selector {
          display: flex;
          gap: 8px;
        }

        .mode-btn {
          padding: 12px 20px;
          border: 2px solid #dee2e6;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .mode-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mode-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .content-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .content-card h2 {
          margin: 0 0 24px 0;
          color: #2c3e50;
          font-size: 1.8rem;
          font-weight: 700;
          text-align: center;
        }

        .instructor-features,
        .student-features {
          margin-bottom: 32px;
        }

        .instructor-features h3,
        .student-features h3 {
          margin: 0 0 16px 0;
          color: #495057;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .instructor-features ul,
        .student-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructor-features li,
        .student-features li {
          padding: 8px 0;
          color: #6c757d;
          font-size: 1rem;
          line-height: 1.5;
        }

        .import-section {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          text-align: center;
        }

        .import-section h3 {
          margin: 0 0 12px 0;
          color: #2c3e50;
          font-size: 1.3rem;
        }

        .import-section p {
          margin: 0 0 20px 0;
          color: #6c757d;
        }

        .import-options {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .import-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .import-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .coming-soon {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          padding: 24px;
          border-radius: 12px;
          border: 2px solid #2196f3;
        }

        .coming-soon h3 {
          margin: 0 0 12px 0;
          color: #1565c0;
          font-size: 1.3rem;
        }

        .coming-soon p {
          margin: 0 0 16px 0;
          color: #1976d2;
        }

        .coming-soon ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .coming-soon li {
          padding: 4px 0;
          color: #1976d2;
          position: relative;
          padding-left: 20px;
        }

        .coming-soon li::before {
          content: '⭐';
          position: absolute;
          left: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .chess-puzzles-page {
            padding: 10px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 16px;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .mode-selector {
            width: 100%;
            justify-content: center;
          }

          .mode-btn {
            flex: 1;
            text-align: center;
          }

          .content-card {
            padding: 20px;
          }

          .import-options {
            flex-direction: column;
          }

          .import-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .header-content h1 {
            font-size: 1.6rem;
          }

          .content-card h2 {
            font-size: 1.5rem;
          }

          .instructor-features h3,
          .student-features h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}