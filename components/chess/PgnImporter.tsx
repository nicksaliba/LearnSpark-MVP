// src/components/chess/PgnImporter.tsx
'use client';

import React, { useState } from 'react';

interface PgnImporterProps {
  onLoadPgn: (pgn: string) => void;
}

const PgnImporter: React.FC<PgnImporterProps> = ({ onLoadPgn }) => {
  const [showImporter, setShowImporter] = useState(false);
  const [pgnText, setPgnText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    if (!pgnText.trim()) return;

    setIsLoading(true);
    try {
      await onLoadPgn(pgnText.trim());
      setPgnText('');
      setShowImporter(false);
    } catch (error) {
      console.error('Error importing PGN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPgnText(content);
    };
    reader.readAsText(file);
  };

  // Sample PGN for testing
  const samplePgn = `[Event "World Championship"]
[Site "London"]
[Date "1851.06.21"]
[Round "1"]
[White "Anderssen"]
[Black "Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g3 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`;

  return (
    <div className="pgn-importer">
      <button
        onClick={() => setShowImporter(!showImporter)}
        className="import-pgn-btn"
        type="button"
      >
        📥 Import PGN
      </button>

      {showImporter && (
        <div className="pgn-import-modal">
          <div className="pgn-import-content">
            <h4>Import PGN</h4>
            
            <div className="import-options">
              <div className="option-section">
                <h5>Paste PGN Text</h5>
                <textarea
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                  placeholder="Paste your PGN text here..."
                  rows={8}
                  className="pgn-textarea"
                />
              </div>

              <div className="option-section">
                <h5>Upload PGN File</h5>
                <input
                  type="file"
                  accept=".pgn,.txt"
                  onChange={handleFileUpload}
                  className="file-input"
                />
              </div>

              <div className="option-section">
                <h5>Try Sample Game</h5>
                <button
                  onClick={() => setPgnText(samplePgn)}
                  className="sample-btn"
                  type="button"
                >
                  Load "Immortal Game" (1851)
                </button>
              </div>
            </div>

            <div className="import-actions">
              <button
                onClick={handleImport}
                disabled={!pgnText.trim() || isLoading}
                className="import-btn primary"
                type="button"
              >
                {isLoading ? 'Loading...' : 'Import Game'}
              </button>
              <button
                onClick={() => {
                  setShowImporter(false);
                  setPgnText('');
                }}
                className="cancel-btn secondary"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PgnImporter;