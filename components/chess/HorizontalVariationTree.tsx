// components/chess/HorizontalVariationTree.tsx
'use client';

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
  moveNumber: number;
  color: 'w' | 'b';
}

interface HorizontalVariationTreeProps {
  variations: VariationNode[];
  currentMoveId?: string;
  onMoveClick: (nodeId: string, fen: string) => void;
  onToggleRequired?: (nodeId: string, required: boolean) => void;
  onToggleHintable?: (nodeId: string) => void;
  hintableNodes?: Set<string>;
  isInstructor?: boolean;
  showOnlyRequired?: boolean;
  maxDepth?: number;
  title?: string;
}

const HorizontalVariationTree: React.FC<HorizontalVariationTreeProps> = ({
  variations,
  currentMoveId,
  onMoveClick,
  onToggleRequired,
  onToggleHintable,
  hintableNodes = new Set(),
  isInstructor = false,
  showOnlyRequired = false,
  maxDepth = 10,
  title = "Puzzle Variations"
}) => {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Build variation tree structure
  const variationTree = useMemo(() => {
    if (variations.length === 0) return [];

    // Find root nodes (nodes without parents)
    const roots = variations.filter(node => !node.parent);

    // If no clear roots, use the first node as root
    if (roots.length === 0 && variations.length > 0) {
      return [variations[0]];
    }

    return roots;
  }, [variations]);

  // Filter variations based on requirements
  const filteredVariations = useMemo(() => {
    if (!showOnlyRequired) return variationTree;
    
    const filterNodes = (nodes: VariationNode[]): VariationNode[] => {
      return nodes
        .filter(node => node.isRequired || node.isMainLine)
        .map(node => ({
          ...node,
          children: filterNodes(node.children || [])
        }));
    };

    return filterNodes(variationTree);
  }, [variationTree, showOnlyRequired]);

  const toggleBranch = useCallback((nodeId: string) => {
    setExpandedBranches(prev => {
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

  const renderMoveNode = useCallback((node: VariationNode, depth: number = 0) => {
    const isExpanded = expandedBranches.has(node.id);
    const isCurrent = currentMoveId === node.id;
    const isHovered = hoveredNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isMainLine = node.isMainLine;
    const isRequired = node.isRequired;
    const isHintable = hintableNodes.has(node.id);

    return (
      <div
        key={node.id}
        className={`variation-node-container ${depth === 0 ? 'root-node' : ''}`}
        style={{ marginLeft: depth * 20 }}
      >
        <div
          className={`variation-node ${isMainLine ? 'main-line' : 'side-line'} ${
            isCurrent ? 'current' : ''
          } ${isHovered ? 'hovered' : ''} ${isRequired ? 'required' : ''} ${isHintable ? 'hintable' : ''}`}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* Move Number and Notation */}
          <div 
            className="move-content"
            onClick={() => onMoveClick(node.id, node.fen)}
          >
            <div className="move-number">
              {node.color === 'w' ? `${node.moveNumber}.` : `${node.moveNumber}...`}
            </div>
            <div className="move-notation">{node.notation}</div>
            
            {/* Evaluation */}
            {node.evaluation && (
              <div className={`evaluation ${node.evaluation.startsWith('+') ? 'positive' : 'negative'}`}>
                {node.evaluation}
              </div>
            )}
          </div>

          {/* Instructor Controls */}
          {isInstructor && (
            <div className="instructor-controls">
              <button
                className={`required-toggle ${isRequired ? 'required' : 'optional'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleRequired(node.id, !isRequired);
                }}
                title={isRequired ? 'Mark as optional' : 'Mark as required for students'}
              >
                {isRequired ? '★' : '☆'}
              </button>
              
              {onToggleHintable && (
                <button
                  className={`hint-toggle ${isHintable ? 'hintable' : 'not-hintable'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHintable(node.id);
                  }}
                  title={isHintable ? 'Remove from hints' : 'Add to hints'}
                >
                  {isHintable ? '💡' : '🔒'}
                </button>
              )}
            </div>
          )}

          {/* Branch Expansion Button */}
          {hasChildren && (
            <button
              className="branch-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleBranch(node.id);
              }}
              title={isExpanded ? 'Collapse variations' : 'Show variations'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* Required Badge for Students */}
          {!isInstructor && isRequired && (
            <div className="required-badge">
              ★
            </div>
          )}
          
          {/* Hintable Badge for Students */}
          {!isInstructor && isHintable && (
            <div className="hint-badge" title="This move can be revealed as a hint">
              💡
            </div>
          )}
        </div>

        {/* Annotation */}
        {node.annotation && (
          <div className="move-annotation">
            {node.annotation}
          </div>
        )}

        {/* Children Branches */}
        {hasChildren && isExpanded && node.children.length > 0 && (
          <div className="variation-children">
            {node.children.map((child, index) => (
              <div key={child.id} className="child-branch">
                <div className="branch-connector"></div>
                {renderMoveNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    expandedBranches,
    currentMoveId,
    hoveredNode,
    isInstructor,
    onMoveClick,
    toggleBranch,
    handleToggleRequired,
    onToggleHintable,
    hintableNodes
  ]);

  const variationStats = useMemo(() => {
    const totalNodes = variations.length;
    const requiredNodes = variations.filter(n => n.isRequired).length;
    const mainLineNodes = variations.filter(n => n.isMainLine).length;
    const maxDepthReached = Math.max(...variations.map(n => n.depth), 0);

    return {
      total: totalNodes,
      required: requiredNodes,
      mainLine: mainLineNodes,
      maxDepth: maxDepthReached
    };
  }, [variations]);

  if (filteredVariations.length === 0) {
    return (
      <div className="horizontal-tree-container">
        <div className="tree-header">
          <h4>{title}</h4>
        </div>
        <div className="tree-empty">
          <div className="empty-state">
            <div className="empty-icon">🌳</div>
            <p>No variations available</p>
            {showOnlyRequired && (
              <p className="empty-hint">
                No variations marked as required. 
                {isInstructor && " Use the star button to mark important variations."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="horizontal-tree-container">
      {/* Header */}
      <div className="tree-header">
        <div className="tree-title">
          <h4>{title}</h4>
          <div className="tree-stats">
            <span className="stat">
              <strong>{variationStats.total}</strong> moves
            </span>
            {isInstructor && (
              <>
                <span className="stat">
                  <strong>{variationStats.required}</strong> required
                </span>
                <span className="stat">
                  <strong>{variationStats.mainLine}</strong> main line
                </span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="tree-controls">
          {isInstructor && (
            <>
              <button
                className="control-btn"
                onClick={() => setExpandedBranches(new Set(variations.map(n => n.id)))}
                title="Expand all branches"
              >
                Expand All
              </button>
              <button
                className="control-btn"
                onClick={() => setExpandedBranches(new Set())}
                title="Collapse all branches"
              >
                Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Variation Tree */}
      <div className="tree-content">
        <div className="variations-container">
          {filteredVariations.map((rootNode, index) => (
            <div key={rootNode.id} className="variation-root">
              {renderMoveNode(rootNode, 0)}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="tree-legend">
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-icon main-line"></div>
            <span>Main Line</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon side-line"></div>
            <span>Variation</span>
          </div>
          {isInstructor && (
            <>
              <div className="legend-item">
                <div className="legend-icon required"></div>
                <span>Required (★)</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon hintable"></div>
                <span>Hintable (💡)</span>
              </div>
            </>
          )}
          {!isInstructor && (
            <>
              <div className="legend-item">
                <div className="legend-icon required"></div>
                <span>Study This (★)</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon revealed"></div>
                <span>Your Moves</span>
              </div>
            </>
          )}
        </div>

        {/* Instructor Instructions */}
        {isInstructor && (
          <div className="instructor-hint">
            💡 Click the star (☆/★) to mark variations as required, and the lightbulb (🔒/💡) to make moves hintable
          </div>
        )}

        {/* Student Instructions */}
        {!isInstructor && variationStats.required > 0 && (
          <div className="student-hint">
            🎯 The tree reveals as you play! Starred (★) variations are essential to solve the puzzle
          </div>
        )}
      </div>

      <style jsx>{`
        .horizontal-tree-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 2px solid #e9ecef;
          margin-top: 20px;
        }

        .tree-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f1f3f4;
        }

        .tree-title h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.3rem;
          font-weight: 700;
        }

        .tree-stats {
          display: flex;
          gap: 16px;
          margin-top: 4px;
        }

        .stat {
          font-size: 0.9rem;
          color: #6c757d;
        }

        .stat strong {
          color: #495057;
          font-weight: 600;
        }

        .tree-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          padding: 6px 12px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .control-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .tree-content {
          margin-bottom: 16px;
        }

        .variations-container {
          overflow-x: auto;
          padding: 8px;
        }

        .variation-root {
          margin-bottom: 16px;
        }

        .variation-node-container {
          position: relative;
          margin-bottom: 8px;
        }

        .variation-node {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: white;
          border: 2px solid #e9ecef;
          position: relative;
          min-height: 44px;
        }

        .variation-node.main-line {
          border-left: 4px solid #007bff;
          background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
        }

        .variation-node.side-line {
          border-left: 4px solid #6f42c1;
          background: linear-gradient(135deg, #faf8ff, #f4f0ff);
        }

        .variation-node.required {
          border: 2px solid #ffc107;
          background: linear-gradient(135deg, #fffbf0, #fff8e1);
          box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
        }

        .variation-node.hintable {
          border: 2px solid #17a2b8;
          background: linear-gradient(135deg, #f0ffff, #e6f7ff);
        }

        .variation-node.current {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb) !important;
          border-color: #2196f3 !important;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }

        .variation-node.hovered {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .move-content {
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
          min-width: 40px;
        }

        .move-notation {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          font-size: 1.1rem;
          color: #2c3e50;
          min-width: 50px;
        }

        .evaluation {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .evaluation.positive {
          background: #d4edda;
          color: #155724;
        }

        .evaluation.negative {
          background: #f8d7da;
          color: #721c24;
        }

        .instructor-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .required-toggle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .required-toggle.required {
          background: linear-gradient(135deg, #ffc107, #e0a800);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
        }

        .required-toggle.optional {
          background: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        .required-toggle:hover {
          transform: scale(1.1);
        }

        .hint-toggle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
        }

        .hint-toggle.hintable {
          background: linear-gradient(135deg, #17a2b8, #138496);
          box-shadow: 0 2px 8px rgba(23, 162, 184, 0.3);
        }

        .hint-toggle.not-hintable {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
        }

        .hint-toggle:hover {
          transform: scale(1.1);
        }

        .hint-badge {
          background: linear-gradient(135deg, #17a2b8, #138496);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          margin-left: 4px;
        }

        .branch-toggle {
          width: 24px;
          height: 24px;
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

        .branch-toggle:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .required-badge {
          background: linear-gradient(135deg, #ffc107, #e0a800);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .move-annotation {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          padding: 8px;
          font-size: 0.85rem;
          z-index: 10;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .variation-children {
          margin-top: 12px;
          padding-left: 20px;
          border-left: 2px dashed #dee2e6;
        }

        .child-branch {
          position: relative;
          margin-bottom: 8px;
        }

        .branch-connector {
          position: absolute;
          top: -4px;
          left: -22px;
          width: 20px;
          height: 24px;
          border-left: 2px dashed #dee2e6;
          border-bottom: 2px dashed #dee2e6;
          border-bottom-left-radius: 8px;
        }

        .tree-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 120px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .empty-state {
          text-align: center;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 8px;
          opacity: 0.5;
        }

        .empty-state p {
          margin: 4px 0;
          font-size: 0.9rem;
        }

        .empty-hint {
          font-style: italic;
          color: #8e8e8e;
        }

        .tree-legend {
          border-top: 1px solid #e9ecef;
          padding-top: 12px;
        }

        .legend-items {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #6c757d;
        }

        .legend-icon {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .legend-icon.main-line {
          background: linear-gradient(135deg, #007bff, #0056b3);
        }

        .legend-icon.side-line {
          background: linear-gradient(135deg, #6f42c1, #5a2d91);
        }

        .legend-icon.required {
          background: linear-gradient(135deg, #ffc107, #e0a800);
          position: relative;
        }

        .legend-icon.required::after {
          content: '★';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 8px;
        }

        .legend-icon.hintable {
          background: linear-gradient(135deg, #17a2b8, #138496);
          position: relative;
        }

        .legend-icon.hintable::after {
          content: '💡';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 8px;
        }

        .legend-icon.revealed {
          background: linear-gradient(135deg, #28a745, #20c997);
          border: 2px solid #155724;
        }

        .instructor-hint {
          background: #e3f2fd;
          color: #1976d2;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-top: 8px;
        }

        .student-hint {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-top: 8px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .horizontal-tree-container {
            padding: 16px;
          }

          .tree-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .tree-stats {
            flex-direction: column;
            gap: 4px;
          }

          .tree-controls {
            width: 100%;
            justify-content: space-between;
          }

          .variation-node {
            padding: 8px 10px;
            min-height: 40px;
          }

          .move-notation {
            font-size: 1rem;
          }

          .legend-items {
            flex-direction: column;
            gap: 8px;
          }

          .variation-children {
            padding-left: 16px;
          }

          .branch-connector {
            left: -18px;
            width: 16px;
          }
        }

        @media (max-width: 480px) {
          .tree-title h4 {
            font-size: 1.1rem;
          }

          .variation-node {
            padding: 6px 8px;
            min-height: 36px;
          }

          .move-content {
            gap: 6px;
          }

          .move-number {
            min-width: 32px;
            font-size: 0.8rem;
          }

          .move-notation {
            font-size: 0.9rem;
            min-width: 40px;
          }

          .required-toggle,
          .branch-toggle {
            width: 24px;
            height: 24px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(HorizontalVariationTree);