import React, { useState, useCallback, useMemo } from 'react';
import { ChessMove } from '../../types/chess';

interface VariationNode {
  id: string;
  move: ChessMove;
  notation: string;
  fen: string;
  children: VariationNode[];
  parent?: string;
  depth: number;
  isMainLine: boolean;
  isRequired?: boolean;
  annotation?: string;
  evaluation?: string;
}

interface ChessVariationTreeProps {
  variations: VariationNode[];
  currentMoveId?: string;
  onMoveClick: (nodeId: string, fen: string) => void;
  onToggleRequired?: (nodeId: string, required: boolean) => void;
  isInstructor?: boolean;
  showOnlyRequired?: boolean;
  maxDepth?: number;
}

const ChessVariationTree: React.FC<ChessVariationTreeProps> = ({
  variations,
  currentMoveId,
  onMoveClick,
  onToggleRequired,
  isInstructor = false,
  showOnlyRequired = false,
  maxDepth = 10
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter variations based on requirements
  const filteredVariations = useMemo(() => {
    if (!showOnlyRequired) return variations;
    return variations.filter(node => node.isRequired || node.isMainLine);
  }, [variations, showOnlyRequired]);

  const toggleExpanded = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleToggleRequired = useCallback((nodeId: string, required: boolean) => {
    if (onToggleRequired) {
      onToggleRequired(nodeId, required);
    }
  }, [onToggleRequired]);

  const renderVariationNode = useCallback((node: VariationNode, index: number) => {
    const isExpanded = expandedNodes.has(node.id);
    const isCurrent = currentMoveId === node.id;
    const isHovered = hoveredNode === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className="variation-node-container">
        <div 
          className={`variation-node ${node.isMainLine ? 'main-line' : 'variation'} ${
            isCurrent ? 'current' : ''
          } ${isHovered ? 'hovered' : ''} ${node.isRequired ? 'required' : ''}`}
          style={{ marginLeft: `${node.depth * 24}px` }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* Expansion toggle */}
          {hasChildren && (
            <button
              className="expansion-toggle"
              onClick={() => toggleExpanded(node.id)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* Move notation */}
          <div 
            className="move-notation-wrapper"
            onClick={() => onMoveClick(node.id, node.fen)}
          >
            <span className="move-number">
              {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
            </span>
            <span className="move-notation">{node.notation}</span>
            
            {/* Evaluation */}
            {node.evaluation && (
              <span className={`move-evaluation ${node.evaluation.startsWith('+') ? 'positive' : 'negative'}`}>
                {node.evaluation}
              </span>
            )}
          </div>

          {/* Instructor controls */}
          {isInstructor && (
            <div className="instructor-controls">
              <button
                className={`required-toggle ${node.isRequired ? 'required' : 'optional'}`}
                onClick={() => handleToggleRequired(node.id, !node.isRequired)}
                title={node.isRequired ? 'Mark as optional' : 'Mark as required'}
              >
                {node.isRequired ? '★' : '☆'}
              </button>
              
              <div className="move-actions">
                <button 
                  className="annotate-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open annotation dialog
                  }}
                  title="Add annotation"
                >
                  💬
                </button>
              </div>
            </div>
          )}

          {/* Annotation display */}
          {node.annotation && (
            <div className="move-annotation">
              {node.annotation}
            </div>
          )}
        </div>

        {/* Children variations */}
        {hasChildren && isExpanded && (
          <div className="variation-children">
            {node.children.map((child, childIndex) => renderVariationNode(child, childIndex))}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, currentMoveId, hoveredNode, isInstructor, onMoveClick, toggleExpanded, handleToggleRequired]);

  if (filteredVariations.length === 0) {
    return (
      <div className="variation-tree-empty">
        <div className="empty-state">
          <div className="empty-icon">🌳</div>
          <h4>No Variations</h4>
          <p>Load a PGN with variations to see the move tree</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chess-variation-tree">
      <div className="variation-tree-header">
        <h4>
          <span>🌳</span>
          Variation Tree
        </h4>
        
        <div className="tree-controls">
          {isInstructor && (
            <>
              <button
                className="expand-all-btn"
                onClick={() => setExpandedNodes(new Set(variations.map(n => n.id)))}
                title="Expand all variations"
              >
                Expand All
              </button>
              <button
                className="collapse-all-btn"
                onClick={() => setExpandedNodes(new Set())}
                title="Collapse all variations"
              >
                Collapse All
              </button>
            </>
          )}
          
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot main-line"></div>
              <span>Main Line</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot variation"></div>
              <span>Variation</span>
            </div>
            {isInstructor && (
              <div className="legend-item">
                <div className="legend-dot required"></div>
                <span>Required</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="variation-tree-content">
        <div className="variations-list">
          {filteredVariations.map((node, index) => renderVariationNode(node, index))}
        </div>
      </div>

      {/* Statistics */}
      <div className="variation-tree-stats">
        <div className="stat-item">
          <strong>Total Moves:</strong> {variations.length}
        </div>
        <div className="stat-item">
          <strong>Main Line:</strong> {variations.filter(n => n.isMainLine).length}
        </div>
        <div className="stat-item">
          <strong>Variations:</strong> {variations.filter(n => !n.isMainLine).length}
        </div>
        {isInstructor && (
          <div className="stat-item">
            <strong>Required:</strong> {variations.filter(n => n.isRequired).length}
          </div>
        )}
      </div>

      <style jsx>{`
        .chess-variation-tree {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 2px solid #e9ecef;
          margin-top: 20px;
        }

        .variation-tree-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f3f4;
        }

        .variation-tree-header h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tree-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .expand-all-btn,
        .collapse-all-btn {
          padding: 6px 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .expand-all-btn:hover,
        .collapse-all-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .legend {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          color: #6c757d;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-dot.main-line {
          background: linear-gradient(135deg, #007bff, #0056b3);
        }

        .legend-dot.variation {
          background: linear-gradient(135deg, #6f42c1, #5a2d91);
        }

        .legend-dot.required {
          background: linear-gradient(135deg, #ffc107, #e0a800);
        }

        .variation-tree-content {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .variations-list {
          padding: 12px;
        }

        .variation-node-container {
          margin-bottom: 4px;
        }

        .variation-node {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: white;
          border: 1px solid #e9ecef;
        }

        .variation-node.main-line {
          border-left: 4px solid #007bff;
          background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
        }

        .variation-node.variation {
          border-left: 4px solid #6f42c1;
          background: linear-gradient(135deg, #faf8ff, #f4f0ff);
        }

        .variation-node.required {
          border: 2px solid #ffc107;
          background: linear-gradient(135deg, #fffbf0, #fff8e1);
        }

        .variation-node.current {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
          border-color: #2196f3 !important;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
        }

        .variation-node.hovered {
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .expansion-toggle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid #dee2e6;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .expansion-toggle:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .move-notation-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          cursor: pointer;
        }

        .move-number {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #6c757d;
          font-size: 0.9rem;
          min-width: 36px;
        }

        .move-notation {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 1rem;
          color: #2c3e50;
        }

        .move-evaluation {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .move-evaluation.positive {
          background: #d4edda;
          color: #155724;
        }

        .move-evaluation.negative {
          background: #f8d7da;
          color: #721c24;
        }

        .instructor-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .required-toggle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .required-toggle.required {
          background: linear-gradient(135deg, #ffc107, #e0a800);
          color: white;
        }

        .required-toggle.optional {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .required-toggle:hover {
          transform: scale(1.1);
        }

        .move-actions {
          display: flex;
          gap: 4px;
        }

        .annotate-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .annotate-btn:hover {
          background: #e9ecef;
        }

        .move-annotation {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 8px;
          font-size: 0.8rem;
          z-index: 10;
          margin-top: 4px;
        }

        .variation-children {
          border-left: 2px dashed #dee2e6;
          margin-left: 12px;
          padding-left: 12px;
        }

        .variation-tree-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .empty-state {
          text-align: center;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .empty-state h4 {
          margin: 0 0 8px 0;
          color: #495057;
        }

        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        .variation-tree-stats {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e9ecef;
        }

        .stat-item {
          text-align: center;
          font-size: 0.9rem;
          color: #495057;
        }

        .stat-item strong {
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .variation-tree-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .tree-controls {
            width: 100%;
            justify-content: space-between;
          }

          .legend {
            flex-wrap: wrap;
            gap: 8px;
          }

          .variation-node {
            padding: 6px 8px;
            margin-bottom: 2px;
          }

          .move-notation-wrapper {
            gap: 4px;
          }

          .variation-tree-stats {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ChessVariationTree;