// src/pages/StudyManagerPage.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { ChessStudy, ChessChapter } from '../../types/chess';
import { PGNParser, validateAndParsePGN } from '../../utils/pgnParser';
import { createNewStudy, generateId } from '../../utils/chessUtils';

interface StudyManagerPageProps {
  studies: ChessStudy[];
  onStudiesUpdate: (studies: ChessStudy[]) => void;
  onNavigateToEditor: (study: ChessStudy) => void;
}

interface PGNImportResult {
  success: boolean;
  errors: string[];
  studyChapters: any[];
  gameCount: number;
}

const StudyManagerPage: React.FC<StudyManagerPageProps> = ({
  studies,
  onStudiesUpdate,
  onNavigateToEditor
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'import' | 'manage'>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Create Study State
  const [newStudy, setNewStudy] = useState({
    name: '',
    description: '',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    tags: [] as string[]
  });
  
  // PGN Import State
  const [pgnText, setPgnText] = useState('');
  const [pgnImportResult, setPgnImportResult] = useState<PGNImportResult | null>(null);
  const [importStudyName, setImportStudyName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleCreateStudy = useCallback(async () => {
    clearMessages();
    
    if (!newStudy.name.trim()) {
      setError('Study name is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const study = createNewStudy(
        newStudy.name.trim(),
        newStudy.description.trim(),
        newStudy.startingFen
      );
      
      study.tags = newStudy.tags;
      
      const updatedStudies = [...studies, study];
      onStudiesUpdate(updatedStudies);
      
      setSuccess(`Study "${study.name}" created successfully!`);
      setNewStudy({
        name: '',
        description: '',
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        tags: []
      });
    } catch (err) {
      setError(`Failed to create study: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [newStudy, studies, onStudiesUpdate, clearMessages]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPgnText(content);
      setImportStudyName(file.name.replace('.pgn', ''));
    };
    reader.readAsText(file);
  }, []);

  const handlePgnValidation = useCallback(() => {
    clearMessages();
    
    if (!pgnText.trim()) {
      setError('Please enter PGN text or upload a file');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = validateAndParsePGN(pgnText);
      
      if (result.success) {
        setPgnImportResult({
          success: true,
          errors: result.errors,
          studyChapters: result.studyChapters,
          gameCount: result.games.length
        });
        setSuccess(`Successfully parsed ${result.games.length} game(s) from PGN`);
      } else {
        setPgnImportResult({
          success: false,
          errors: result.errors,
          studyChapters: [],
          gameCount: 0
        });
        setError(`PGN validation failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError(`PGN parsing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPgnImportResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [pgnText, clearMessages]);

  const handleImportPgn = useCallback(async () => {
    if (!pgnImportResult?.success || !importStudyName.trim()) {
      setError('Please validate PGN and provide a study name');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const study: ChessStudy = {
        id: generateId(),
        name: importStudyName.trim(),
        description: `Imported from PGN file with ${pgnImportResult.gameCount} game(s)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false,
        tags: ['imported', 'pgn'],
        chapters: pgnImportResult.studyChapters.map((chapter, index) => ({
          ...chapter,
          id: `chapter-${index + 1}`,
          name: chapter.name || `Game ${index + 1}`
        }))
      };

      const updatedStudies = [...studies, study];
      onStudiesUpdate(updatedStudies);
      
      setSuccess(`Study "${study.name}" imported successfully with ${study.chapters.length} chapters!`);
      
      // Reset import state
      setPgnText('');
      setPgnImportResult(null);
      setImportStudyName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(`Failed to import study: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [pgnImportResult, importStudyName, studies, onStudiesUpdate, clearMessages]);

  const handleDeleteStudy = useCallback((studyId: string) => {
    const study = studies.find(s => s.id === studyId);
    if (!study) return;

    if (window.confirm(`Are you sure you want to delete "${study.name}"? This action cannot be undone.`)) {
      const updatedStudies = studies.filter(s => s.id !== studyId);
      onStudiesUpdate(updatedStudies);
      setSuccess(`Study "${study.name}" deleted successfully`);
    }
  }, [studies, onStudiesUpdate]);

  const handleDuplicateStudy = useCallback((studyId: string) => {
    const study = studies.find(s => s.id === studyId);
    if (!study) return;

    const duplicatedStudy: ChessStudy = {
      ...study,
      id: generateId(),
      name: `${study.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: study.chapters.map(chapter => ({
        ...chapter,
        id: generateId(),
        createdAt: new Date().toISOString()
      }))
    };

    const updatedStudies = [...studies, duplicatedStudy];
    onStudiesUpdate(updatedStudies);
    setSuccess(`Study duplicated as "${duplicatedStudy.name}"`);
  }, [studies, onStudiesUpdate]);

  return (
    <div className="study-manager-page">
      <div className="study-manager-header">
        <h1>📚 Study Manager</h1>
        <p>Create, import, and manage your chess studies and curriculum</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Study
        </button>
        <button
          className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          📂 Import PGN
        </button>
        <button
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          🗂️ Manage Studies
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error-message">
          <span>❌ {error}</span>
          <button onClick={clearMessages} className="message-close">×</button>
        </div>
      )}
      
      {success && (
        <div className="message success-message">
          <span>✅ {success}</span>
          <button onClick={clearMessages} className="message-close">×</button>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'create' && (
          <div className="create-study-section">
            <h2>Create New Study</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="study-name">Study Name *</label>
                <input
                  id="study-name"
                  type="text"
                  value={newStudy.name}
                  onChange={(e) => setNewStudy(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter study name..."
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="study-description">Description</label>
                <textarea
                  id="study-description"
                  value={newStudy.description}
                  onChange={(e) => setNewStudy(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your study..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="starting-fen">Starting Position (FEN)</label>
                <input
                  id="starting-fen"
                  type="text"
                  value={newStudy.startingFen}
                  onChange={(e) => setNewStudy(prev => ({ ...prev, startingFen: e.target.value }))}
                  placeholder="FEN notation..."
                  className="form-input fen-input"
                />
                <small>Leave default for standard starting position</small>
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    placeholder="Add tags (press Enter)..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value && !newStudy.tags.includes(value)) {
                          setNewStudy(prev => ({ ...prev, tags: [...prev.tags, value] }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="form-input"
                  />
                  <div className="tags-list">
                    {newStudy.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          onClick={() => setNewStudy(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                onClick={handleCreateStudy}
                disabled={isLoading || !newStudy.name.trim()}
                className="primary-btn"
              >
                {isLoading ? 'Creating...' : 'Create Study'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="import-pgn-section">
            <h2>Import PGN File</h2>
            
            <div className="import-steps">
              <div className="step-card">
                <h3>Step 1: Upload or Paste PGN</h3>
                <div className="pgn-input-methods">
                  <div className="file-upload">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pgn,.txt"
                      onChange={handleFileUpload}
                      className="file-input"
                      id="pgn-file"
                    />
                    <label htmlFor="pgn-file" className="file-label">
                      📁 Choose PGN File
                    </label>
                  </div>
                  
                  <div className="text-divider">OR</div>
                  
                  <div className="pgn-textarea-container">
                    <label htmlFor="pgn-text">Paste PGN Text:</label>
                    <textarea
                      id="pgn-text"
                      value={pgnText}
                      onChange={(e) => setPgnText(e.target.value)}
                      placeholder="Paste your PGN content here..."
                      className="pgn-textarea"
                      rows={10}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handlePgnValidation}
                  disabled={isLoading || !pgnText.trim()}
                  className="secondary-btn"
                >
                  {isLoading ? 'Validating...' : 'Validate PGN'}
                </button>
              </div>

              {pgnImportResult && (
                <div className="step-card">
                  <h3>Step 2: Review Import Results</h3>
                  
                  {pgnImportResult.success ? (
                    <div className="import-success">
                      <div className="success-info">
                        <p>✅ PGN validation successful!</p>
                        <ul>
                          <li>Games found: {pgnImportResult.gameCount}</li>
                          <li>Chapters to create: {pgnImportResult.studyChapters.length}</li>
                        </ul>
                      </div>
                      
                      <div className="study-name-input">
                        <label htmlFor="import-name">Study Name:</label>
                        <input
                          id="import-name"
                          type="text"
                          value={importStudyName}
                          onChange={(e) => setImportStudyName(e.target.value)}
                          placeholder="Enter name for imported study..."
                          className="form-input"
                        />
                      </div>
                      
                      <div className="chapters-preview">
                        <h4>Chapters Preview:</h4>
                        <div className="chapters-list">
                          {pgnImportResult.studyChapters.slice(0, 5).map((chapter, index) => (
                            <div key={index} className="chapter-preview">
                              <strong>{chapter.name}</strong>
                              <small>{chapter.description}</small>
                            </div>
                          ))}
                          {pgnImportResult.studyChapters.length > 5 && (
                            <div className="more-chapters">
                              ...and {pgnImportResult.studyChapters.length - 5} more chapters
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={handleImportPgn}
                        disabled={isLoading || !importStudyName.trim()}
                        className="primary-btn"
                      >
                        {isLoading ? 'Importing...' : 'Import Study'}
                      </button>
                    </div>
                  ) : (
                    <div className="import-errors">
                      <p>❌ PGN validation failed:</p>
                      <ul>
                        {pgnImportResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="manage-studies-section">
            <h2>Manage Studies ({studies.length})</h2>
            
            {studies.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>No Studies Yet</h3>
                <p>Create your first study or import from PGN to get started!</p>
                <div className="empty-actions">
                  <button
                    onClick={() => setActiveTab('create')}
                    className="primary-btn"
                  >
                    Create Study
                  </button>
                  <button
                    onClick={() => setActiveTab('import')}
                    className="secondary-btn"
                  >
                    Import PGN
                  </button>
                </div>
              </div>
            ) : (
              <div className="studies-grid">
                {studies.map((study) => (
                  <div key={study.id} className="study-card">
                    <div className="study-header">
                      <h3 className="study-title">{study.name}</h3>
                      <div className="study-meta">
                        <span className="chapter-count">
                          {study.chapters.length} chapter{study.chapters.length !== 1 ? 's' : ''}
                        </span>
                        <span className="study-date">
                          {new Date(study.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="study-description">
                      {study.description || 'No description'}
                    </div>
                    
                    {study.tags && study.tags.length > 0 && (
                      <div className="study-tags">
                        {study.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="study-actions">
                      <button
                        onClick={() => onNavigateToEditor(study)}
                        className="action-btn primary"
                      >
                        📝 Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateStudy(study.id)}
                        className="action-btn secondary"
                      >
                        📋 Duplicate
                      </button>
                      <button
                        onClick={() => handleDeleteStudy(study.id)}
                        className="action-btn danger"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyManagerPage;