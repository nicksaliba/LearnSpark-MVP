// components/chess/StudyManager.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { StudyManagerProps, CreateStudyData, ChessStudy } from '../../types/chess';
import { formatDate, formatRelativeTime, generateId } from '../../utils/chessUtils';

const StudyManager: React.FC<StudyManagerProps> = ({ 
  studies, 
  currentStudy, 
  onStudySelect, 
  onCreateStudy,
  onDeleteStudy,
  onUpdateStudy
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateStudyData>({
    name: '',
    description: '',
    startingFen: '',
    isPublic: false,
    tags: []
  });
  
  const [formErrors, setFormErrors] = useState<Partial<CreateStudyData>>({});

  // Sort studies by last updated
  const sortedStudies = useMemo(() => {
    return [...studies].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [studies]);

  const validateForm = useCallback((): boolean => {
    const errors: Partial<CreateStudyData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Study name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Study name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Study name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    if (formData.startingFen && formData.startingFen.trim()) {
      // Basic FEN validation
      const fenParts = formData.startingFen.trim().split(' ');
      if (fenParts.length !== 6) {
        errors.startingFen = 'Invalid FEN format - must have 6 parts';
      } else {
        const boardPart = fenParts[0];
        const ranks = boardPart.split('/');
        if (ranks.length !== 8) {
          errors.startingFen = 'Invalid FEN - board must have 8 ranks';
        }
      }
    }

    if (formData.tags && formData.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const handleCreateStudy = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const studyData: CreateStudyData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        startingFen: formData.startingFen?.trim() || undefined,
        isPublic: formData.isPublic || false,
        tags: formData.tags?.filter(tag => tag.trim().length > 0) || []
      };

      await onCreateStudy(studyData);

      // Reset form on success
      setFormData({
        name: '',
        description: '',
        startingFen: '',
        isPublic: false,
        tags: []
      });
      setFormErrors({});
      setShowCreateForm(false);
      setSuccess('Study created successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create study');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onCreateStudy, clearMessages]);

  const handleDeleteStudy = useCallback((studyId: string, studyName: string) => {
    clearMessages();
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the study "${studyName}"? This action cannot be undone.`
    );
    
    if (confirmed && onDeleteStudy) {
      try {
        onDeleteStudy(studyId);
        setSuccess('Study deleted successfully');
      } catch (error) {
        setError('Failed to delete study');
      }
    }
  }, [onDeleteStudy, clearMessages]);

  const handleDuplicateStudy = useCallback((study: ChessStudy) => {
    clearMessages();
    
    try {
      const duplicatedStudy: CreateStudyData = {
        name: `${study.name} (Copy)`,
        description: study.description,
        startingFen: study.chapters[0]?.startingFen,
        isPublic: false, // Duplicates are private by default
        tags: study.tags || []
      };
      
      onCreateStudy(duplicatedStudy);
      setSuccess(`Study duplicated successfully`);
    } catch (error) {
      setError('Failed to duplicate study');
    }
  }, [onCreateStudy, clearMessages]);

  const handleInputChange = useCallback((
    field: keyof CreateStudyData,
    value: string | boolean | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleTagsChange = useCallback((tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
    handleInputChange('tags', tags);
  }, [handleInputChange]);

  const getStudyStats = useCallback((study: ChessStudy) => {
    const chapterCount = study.chapters.length;
    const totalAnnotations = study.chapters.reduce(
      (total, chapter) => total + Object.keys(chapter.annotations || {}).length,
      0
    );
    
    return {
      chapters: chapterCount,
      annotations: totalAnnotations,
      isPublic: study.isPublic,
      tags: study.tags?.length || 0
    };
  }, []);

  return (
    <div className="study-manager">
      {/* Header */}
      <div className="study-manager-header">
        <h3>📚 Study Manager</h3>
        <div className="header-actions">
          <button
            className="create-study-btn primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
            type="button"
            disabled={isLoading}
          >
            {showCreateForm ? 'Cancel' : '+ New Study'}
          </button>
        </div>
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

      {/* Create Study Form */}
      {showCreateForm && (
        <div className="create-study-form">
          <h4>Create New Study</h4>
          <form onSubmit={handleCreateStudy}>
            <div className="form-group">
              <label htmlFor="study-name">
                Study Name <span className="required">*</span>
              </label>
              <input
                id="study-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter study name..."
                className={formErrors.name ? 'error' : ''}
                required
                disabled={isLoading}
              />
              {formErrors.name && (
                <span className="error-text">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="study-description">Description</label>
              <textarea
                id="study-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this study covers..."
                rows={3}
                disabled={isLoading}
              />
              {formErrors.description && (
                <span className="error-text">{formErrors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="starting-fen">Starting Position (FEN)</label>
              <input
                id="starting-fen"
                type="text"
                value={formData.startingFen}
                onChange={(e) => handleInputChange('startingFen', e.target.value)}
                placeholder="Leave empty for starting position..."
                className={formErrors.startingFen ? 'error' : ''}
                disabled={isLoading}
              />
              {formErrors.startingFen && (
                <span className="error-text">{formErrors.startingFen}</span>
              )}
              <small className="help-text">
                Optional: Custom starting position in FEN notation
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="study-tags">Tags</label>
              <input
                id="study-tags"
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="opening, tactics, endgame..."
                disabled={isLoading}
              />
              {formErrors.tags && (
                <span className="error-text">{formErrors.tags}</span>
              )}
              <small className="help-text">
                Separate tags with commas (max 10)
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Make this study public
              </label>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Study'}
              </button>
              <button 
                type="button" 
                className="cancel-btn secondary"
                onClick={() => setShowCreateForm(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Studies List */}
      <div className="study-list">
        <div className="list-header">
          <h4>Your Studies ({studies.length})</h4>
          {studies.length > 0 && (
            <div className="list-stats">
              <span>{studies.filter(s => s.isPublic).length} public</span>
              <span>{studies.filter(s => !s.isPublic).length} private</span>
            </div>
          )}
        </div>
        
        {sortedStudies.length === 0 ? (
          <div className="no-studies">
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Studies Yet</h3>
              <p>Create your first study to organize your chess analysis and games.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="create-first-study-btn"
              >
                Create Your First Study
              </button>
            </div>
          </div>
        ) : (
          <div className="studies">
            {sortedStudies.map((study) => {
              const stats = getStudyStats(study);
              const isCurrentStudy = currentStudy && currentStudy.id === study.id;
              
              return (
                <div
                  key={study.id}
                  className={`study-item ${isCurrentStudy ? 'active' : ''}`}
                >
                  <div 
                    className="study-content"
                    onClick={() => onStudySelect(study)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onStudySelect(study);
                      }
                    }}
                  >
                    <div className="study-header">
                      <h5 className="study-name">{study.name}</h5>
                      <div className="study-meta">
                        <span className="study-chapters">
                          {stats.chapters} chapter{stats.chapters !== 1 ? 's' : ''}
                        </span>
                        {study.isPublic && (
                          <span className="public-badge">Public</span>
                        )}
                        {isCurrentStudy && (
                          <span className="current-badge">Current</span>
                        )}
                      </div>
                    </div>
                    
                    {study.description && (
                      <p className="study-description">{study.description}</p>
                    )}
                    
                    {study.tags && study.tags.length > 0 && (
                      <div className="study-tags">
                        {study.tags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                        {study.tags.length > 5 && (
                          <span className="tag more-tags">
                            +{study.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="study-stats">
                      <div className="stat">
                        <span className="stat-value">{stats.chapters}</span>
                        <span className="stat-label">Chapters</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{stats.annotations}</span>
                        <span className="stat-label">Annotations</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{stats.tags}</span>
                        <span className="stat-label">Tags</span>
                      </div>
                    </div>
                    
                    <div className="study-footer">
                      <small className="study-date">
                        Created {formatRelativeTime(study.createdAt)}
                      </small>
                      {study.updatedAt && study.updatedAt !== study.createdAt && (
                        <small className="study-updated">
                          • Updated {formatRelativeTime(study.updatedAt)}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="study-actions-menu">
                    <button
                      className="action-btn duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateStudy(study);
                      }}
                      title="Duplicate study"
                      type="button"
                    >
                      📋
                    </button>
                    
                    {onDeleteStudy && (
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudy(study.id, study.name);
                        }}
                        title="Delete study"
                        type="button"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Study Info */}
      {currentStudy && (
        <div className="current-study-info">
          <h4>📖 Current Study</h4>
          <div className="study-details">
            <div className="detail-row">
              <strong>Name:</strong> {currentStudy.name}
            </div>
            {currentStudy.description && (
              <div className="detail-row">
                <strong>Description:</strong> {currentStudy.description}
              </div>
            )}
            <div className="detail-row">
              <strong>Chapters:</strong> {currentStudy.chapters.length}
            </div>
            <div className="detail-row">
              <strong>Created:</strong> {formatDate(currentStudy.createdAt)}
            </div>
            {currentStudy.updatedAt && currentStudy.updatedAt !== currentStudy.createdAt && (
              <div className="detail-row">
                <strong>Last Updated:</strong> {formatDate(currentStudy.updatedAt)}
              </div>
            )}
            {currentStudy.tags && currentStudy.tags.length > 0 && (
              <div className="detail-row">
                <strong>Tags:</strong> {currentStudy.tags.join(', ')}
              </div>
            )}
            <div className="detail-row">
              <strong>Visibility:</strong> {currentStudy.isPublic ? 'Public' : 'Private'}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .study-manager {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
        }

        .study-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f3f4;
        }

        .study-manager-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .create-study-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .create-study-btn.primary {
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
        }

        .create-study-btn.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #0056b3, #004494);
          transform: translateY(-1px);
        }

        .create-study-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .message {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-weight: 500;
        }

        .message.error-message {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .message.success-message {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message-close {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0 4px;
        }

        .create-study-form {
          background: #f8f9fa;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #dee2e6;
        }

        .create-study-form h4 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #495057;
        }

        .required {
          color: #dc3545;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #dc3545;
        }

        .error-text {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 4px;
          display: block;
        }

        .help-text {
          color: #6c757d;
          font-size: 0.85rem;
          margin-top: 4px;
          display: block;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          margin-bottom: 0;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin: 0;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .submit-btn,
        .cancel-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .submit-btn.primary {
          background: linear-gradient(135deg, #28a745, #1e7e34);
          color: white;
        }

        .submit-btn.primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1e7e34, #155724);
        }

        .cancel-btn.secondary {
          background: #6c757d;
          color: white;
        }

        .cancel-btn.secondary:hover {
          background: #545b62;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .list-header h4 {
          margin: 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .list-stats {
          display: flex;
          gap: 12px;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .no-studies {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #495057;
        }

        .empty-state p {
          margin: 0 0 24px 0;
          color: #6c757d;
          line-height: 1.5;
        }

        .create-first-study-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .create-first-study-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .studies {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .study-item {
          display: flex;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .study-item:hover {
          border-color: #007bff;
          box-shadow: 0 4px 16px rgba(0, 123, 255, 0.1);
          transform: translateY(-1px);
        }

        .study-item.active {
          border-color: #007bff;
          background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
        }

        .study-content {
          flex: 1;
          padding: 20px;
          cursor: pointer;
        }

        .study-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .study-name {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .study-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }

        .study-chapters {
          font-size: 0.85rem;
          color: #6c757d;
          background: #e9ecef;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 500;
        }

        .public-badge {
          font-size: 0.75rem;
          background: #28a745;
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .current-badge {
          font-size: 0.75rem;
          background: #007bff;
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .study-description {
          color: #6c757d;
          margin: 12px 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .study-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin: 12px 0;
        }

        .tag {
          background: #007bff;
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .tag.more-tags {
          background: #6c757d;
        }

        .study-stats {
          display: flex;
          gap: 20px;
          margin: 16px 0;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #007bff;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
        }

        .study-footer {
          display: flex;
          align-items: center;
          margin-top: 16px;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .study-actions-menu {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          border-left: 1px solid #e9ecef;
          background: #f8f9fa;
          gap: 8px;
        }

        .action-btn {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          padding: 8px;
          font-size: 1.1rem;
          transition: all 0.2s ease;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .action-btn.duplicate:hover {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .action-btn.delete:hover {
          background: #f8d7da;
          border-color: #dc3545;
        }

        .current-study-info {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          padding: 20px;
          border-radius: 12px;
          margin-top: 24px;
          border: 1px solid #2196f3;
        }

        .current-study-info h4 {
          margin: 0 0 16px 0;
          color: #1565c0;
          font-size: 1.1rem;
        }

        .study-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-row {
          display: flex;
          gap: 8px;
          font-size: 0.95rem;
        }

        .detail-row strong {
          min-width: 120px;
          color: #1976d2;
          font-weight: 600;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .study-manager {
            padding: 16px;
          }

          .study-manager-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
          }

          .create-study-btn {
            width: 100%;
          }

          .create-study-form {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
          }

          .submit-btn,
          .cancel-btn {
            width: 100%;
          }

          .study-item {
            flex-direction: column;
          }

          .study-actions-menu {
            flex-direction: row;
            justify-content: center;
            border-left: none;
            border-top: 1px solid #e9ecef;
            padding: 12px 20px;
          }

          .study-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .study-meta {
            align-self: flex-start;
          }

          .study-stats {
            gap: 16px;
          }

          .list-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .list-stats {
            align-self: flex-start;
          }

          .detail-row {
            flex-direction: column;
            gap: 4px;
          }

          .detail-row strong {
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .study-manager {
            padding: 12px;
          }

          .study-manager-header h3 {
            font-size: 1.2rem;
          }

          .study-content {
            padding: 16px;
          }

          .study-name {
            font-size: 1.1rem;
          }

          .study-stats {
            gap: 12px;
          }

          .stat-value {
            font-size: 1rem;
          }

          .empty-state {
            padding: 20px;
          }

          .empty-icon {
            font-size: 3rem;
          }

          .form-group input,
          .form-group textarea {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(StudyManager);