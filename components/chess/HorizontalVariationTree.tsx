// components/chess/HorizontalVariationTree.tsx
'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ChessMove } from '../../types/chess';
import '../../styles/HorizontalVariationTree.css';

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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const treeRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current node
  useEffect(() => {
    if (autoScroll && currentMoveId && currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentMoveId, autoScroll]);

  // Build variation tree structure
  const variationTree = useMemo(() => {
    if (variations.length === 0) return [];

    const roots = variations.filter(node => !node.parent);
    return roots.length === 0 && variations.length > 0 ? [variations[0]] : roots;
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

  const handleNodeClick = useCallback((nodeId: string, fen: string) => {
    setSelectedNode(nodeId);
    onMoveClick(nodeId, fen);
  }, [onMoveClick]);

  const renderMoveNode = useCallback((node: VariationNode, depth: number = 0) => {
    const isExpanded = expandedBranches.has(node.id);
    const isCurrent = currentMoveId === node.id;
    const isHovered = hoveredNode === node.id;
    const isSelected = selectedNode === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isMainLine = node.isMainLine;
    const isRequired = node.isRequired;
    const isHintable = hintableNodes.has(node.id);

    const ref = isCurrent ? currentNodeRef : undefined;

    return (
      <div
        key={node.id}
        ref={ref}
        className={`variation-node-container ${depth === 0 ? 'root-node' : ''}`}
        style={{ 
          marginLeft: depth * 24,
          opacity: depth > maxDepth ? 0.6 : 1
        }}
      >
        <div
          className={`variation-node ${isMainLine ? 'main-line' : 'side-line'} ${
            isCurrent ? 'current' : ''
          } ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''} ${
            isRequired ? 'required' : ''
          } ${isHintable ? 'hintable' : ''} ${hasChildren ? 'has-children' : ''}`}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick(node.id, node.fen)}
        >
          {/* Move Number */}
          <div className="move-number">
            {node.color === 'w' ? `${node.moveNumber}.` : `${node.moveNumber}...`}
          </div>

          {/* Move Content */}
          <div className="move-content">
            <div className="move-notation">{node.notation}</div>
            
            {/* Evaluation */}
            {node.evaluation && (
              <div className={`evaluation ${node.evaluation.startsWith('+') ? 'positive' : 'negative'}`}>
                {node.evaluation}
              </div>
            )}
          </div>

          {/* Status Indicators */}
          <div className="status-indicators">
            {isRequired && (
              <div className="status-badge required-badge" title="Required move">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            )}
            
            {isHintable && (
              <div className="status-badge hint-badge" title="Hintable move">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Instructor Controls */}
          {isInstructor && (
            <div className="instructor-controls">
              <button
                className={`control-btn required-toggle ${isRequired ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleRequired(node.id, !isRequired);
                }}
                title={isRequired ? 'Mark as optional' : 'Mark as required'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
              
              {onToggleHintable && (
                <button
                  className={`control-btn hint-toggle ${isHintable ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleHintable(node.id);
                  }}
                  title={isHintable ? 'Remove from hints' : 'Add to hints'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Branch Expansion Button */}
          {hasChildren && (
            <button
              className={`branch-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleBranch(node.id);
              }}
              title={isExpanded ? 'Collapse variations' : 'Show variations'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
          )}

          {/* Progress Indicator */}
          {isCurrent && (
            <div className="current-indicator">
              <div className="pulse-ring"></div>
            </div>
          )}
        </div>

        {/* Annotation */}
        {node.annotation && (
          <div className="move-annotation">
            <div className="annotation-content">
              <span className="annotation-icon">💭</span>
              <span className="annotation-text">{node.annotation}</span>
            </div>
          </div>
        )}

        {/* Children Branches */}
        {hasChildren && isExpanded && node.children.length > 0 && (
          <div className="variation-children">
            {node.children.map((child, index) => (
              <div key={child.id} className="child-branch">
                <div className="branch-connector">
                  <div className="connector-line"></div>
                  <div className="connector-dot"></div>
                </div>
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
    selectedNode,
    isInstructor,
    handleNodeClick,
    toggleBranch,
    handleToggleRequired,
    onToggleHintable,
    hintableNodes,
    maxDepth
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
    <div className="horizontal-tree-container" ref={treeRef}>
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
          <div className="control-group">
            <button
              className={`control-btn ${autoScroll ? 'active' : ''}`}
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Auto-scroll
            </button>
          </div>

          {isInstructor && (
            <div className="control-group">
              <button
                className="control-btn"
                onClick={() => setExpandedBranches(new Set(variations.map(n => n.id)))}
                title="Expand all branches"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Expand All
              </button>
              <button
                className="control-btn"
                onClick={() => setExpandedBranches(new Set())}
                title="Collapse all branches"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
                Collapse All
              </button>
            </div>
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
                <span>Hintable (✓)</span>
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

        {/* Instructions */}
        {isInstructor && (
          <div className="instructor-hint">
            💡 Click the star (☆/★) to mark variations as required, and the checkmark (🔒/✓) to make moves hintable
          </div>
        )}

        {!isInstructor && variationStats.required > 0 && (
          <div className="student-hint">
            🎯 The tree reveals as you play! Starred (★) variations are essential to solve the puzzle
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(HorizontalVariationTree);