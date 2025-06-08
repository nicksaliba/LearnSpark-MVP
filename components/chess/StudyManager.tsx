// src/components/chess/StudyManager.tsx
import React, { useState, useCallback } from 'react';
import { StudyManagerProps, CreateStudyData, ChessStudy } from '../../types/chess';
import { formatDate, formatRelativeTime } from '../../utils/chessUtils';
import { debugStudyData } from '../../utils/chess-study-data';

const StudyManager: React.FC<StudyManagerProps> = ({ 
  studies, 
  currentStudy, 
  onStudySelect, 
  onCreateStudy,
  onDeleteStudy,
  onUpdateStudy
}) => {
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreateStudyData>({
    name: '',
    description: '',
    startingFen: '',
    isPublic: false,
    tags: []
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateStudyData>>({});

  const validateForm = useCallback((): boolean => {
    const errors: Partial<CreateStudyData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Study name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Study name must be at least 3 characters';
    }

    if (formData.startingFen && formData.startingFen.trim()) {
      // Basic FEN validation
      const fenParts = formData.startingFen.trim().split(' ');
      if (fenParts.length !== 6) {
        errors.startingFen = 'Invalid FEN format';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleCreateStudy = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const studyData: CreateStudyData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        startingFen: formData.startingFen?.trim() || undefined,
        isPublic: formData.isPublic || false,
        tags: formData.tags?.filter(tag => tag.trim().length > 0) || []
      };

      // Debug the study data
      console.log('Creating study with data:', studyData);
      debugStudyData(studyData, 'StudyManager.handleCreateStudy');

      onCreateStudy(studyData);

      // Reset form
      setFormData({
        name: '',
        description: '',
        startingFen: '',
        isPublic: false,
        tags: []
      });
      setFormErrors({});
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error in handleCreateStudy:', error);
    }
  }, [formData, validateForm, onCreateStudy]);

  const handleDeleteStudy = useCallback((studyId: string, studyName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the study "${studyName}"? This action cannot be undone.`
    );
    
    if (confirmed && onDeleteStudy) {
      onDeleteStudy(studyId);
    }
  }, [onDeleteStudy]);

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
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleInputChange('tags', tags);
  }, [handleInputChange]);

  return (
    <div className="study-manager">
      <div className="study-actions">
        <button
          className="create-study-btn primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          type="button"
        >
          {showCreateForm ? 'Cancel' : '+ New Study'}
        </button>
      </div>

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
              />
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
              />
              <small className="help-text">
                Separate tags with commas
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                />
                <span className="checkmark"></span>
                Make this study public
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn primary">
                Create Study
              </button>
              <button 
                type="button" 
                className="cancel-btn secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="study-list">
        <h4>Available Studies ({studies.length})</h4>
        
        {studies.length === 0 ? (
          <div className="no-studies">
            <p>No studies available.</p>
            <p>Create your first study to get started!</p>
          </div>
        ) : (
          <div className="studies">
            {studies.map((study) => (
              <div
                key={study.id}
                className={`study-item ${
                  currentStudy && currentStudy.id === study.id ? 'active' : ''
                }`}
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
                        {study.chapters.length} chapter{study.chapters.length !== 1 ? 's' : ''}
                      </span>
                      {study.isPublic && (
                        <span className="public-badge">Public</span>
                      )}
                    </div>
                  </div>
                  
                  {study.description && (
                    <p className="study-description">{study.description}</p>
                  )}
                  
                  {study.tags && study.tags.length > 0 && (
                    <div className="study-tags">
                      {study.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="study-footer">
                    <small className="study-date">
                      Created {formatRelativeTime(study.createdAt)}
                    </small>
                    {study.updatedAt && study.updatedAt !== study.createdAt && (
                      <small className="study-updated">
                        Updated {formatRelativeTime(study.updatedAt)}
                      </small>
                    )}
                  </div>
                </div>

                {onDeleteStudy && (
                  <div className="study-actions-menu">
                    <button
                      className="delete-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStudy(study.id, study.name);
                      }}
                      title="Delete study"
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {currentStudy && (
        <div className="current-study-info">
          <h4>Current Study</h4>
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
    </div>
  );
};

export default React.memo(StudyManager);