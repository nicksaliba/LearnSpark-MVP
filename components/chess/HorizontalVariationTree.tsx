import React, { useState, useMemo } from 'react';
import { VariationNode, TreeNode } from '../../types/types';

interface HorizontalVariationTreeProps {
  variations: VariationNode[];
  currentMoveId: string | null;
  onMoveClick: (nodeId: string, fen: string) => void;
  onToggleRequired: (nodeId: string, required: boolean) => void;
  isInstructor: boolean;
  requiredNodes: Set<string>;
  revealedNodes: Set<string>;
}

const HorizontalVariationTree: React.FC<HorizontalVariationTreeProps> = ({
  variations,
  currentMoveId,
  onMoveClick,
  onToggleRequired,
  isInstructor,
  requiredNodes,
  revealedNodes
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['move-1', 'move-2', 'move-3']));

  // Build tree structure from flat variation data
  const nodeMap = useMemo(() => {
    const map: Record<string, TreeNode> = {};
    
    // First pass: create all nodes
    variations.forEach(variation => {
      map[variation.id] = {
        id: variation.id,
        move: variation.move,
        notation: variation.notation,
        fen: variation.fen,
        children: [], // Initialize empty TreeNode array
        parent: variation.parent,
        depth: variation.depth,
        isMainLine: variation.isMainLine,
        isRequired: variation.isRequired,
        moveNumber: variation.moveNumber,
        color: variation.color,
        annotation: variation.annotation,
        evaluation: variation.evaluation
      };
    });
    
    // Second pass: build parent-child relationships
    variations.forEach(variation => {
      if (variation.parent && map[variation.parent]) {
        map[variation.parent].children.push(map[variation.id]);
      }
    });
    
    return map;
  }, [variations]);

  const rootNodes = useMemo(() => {
    return variations.filter(v => !v.parent).map(v => nodeMap[v.id]);
  }, [variations, nodeMap]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getStudentVisibleNodes = (): Set<string> => {
    if (isInstructor) return new Set(variations.map(v => v.id));
    
    // In student mode, show revealed nodes + placeholders for required unrevealed nodes
    const visible = new Set(revealedNodes);
    
    // Add placeholders for required nodes that haven't been revealed
    requiredNodes.forEach(nodeId => {
      if (!revealedNodes.has(nodeId)) {
        visible.add(`placeholder-${nodeId}`);
      }
    });
    
    return visible;
  };

  const visibleNodes = getStudentVisibleNodes();

  const renderNode = (node: TreeNode, level: number = 0, isLast: boolean = false): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = currentMoveId === node.id;
    const isRequired = requiredNodes.has(node.id);
    const isRevealed = revealedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    
    // In student mode, check if this node should be visible
    if (!isInstructor && !visibleNodes.has(node.id)) {
      return null;
    }

    // Render placeholder in student mode for unrevealed required nodes
    if (!isInstructor && !isRevealed && isRequired) {
      return (
        <div key={`placeholder-${node.id}`} className="variation-node-container" style={{ marginLeft: `${level * 40}px` }}>
          <div className="node-line">
            <div className="variation-node placeholder required">
              <div className="move-content">
                <span className="move-notation">???</span>
                <div className="status-indicators">
                  <div className="status-badge required-badge" title="Required move - play to reveal">
                    ★
                  </div>
                  <div className="status-badge hint-badge" title="Hidden move">
                    🔒
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Don't render if not revealed in student mode
    if (!isInstructor && !isRevealed) {
      return null;
    }

    return (
      <div key={node.id} className="variation-node-container" style={{ marginLeft: `${level * 40}px` }}>
        <div className="node-line">
          {/* Connector lines */}
          {level > 0 && (
            <div className="connector">
              <div className="horizontal-line"></div>
              {!isLast && <div className="vertical-line"></div>}
            </div>
          )}
          
          {/* Node content */}
          <div 
            className={`variation-node ${node.isMainLine ? 'main-line' : 'side-line'} ${
              isSelected ? 'selected' : ''
            } ${isRequired ? 'required' : ''} ${!isInstructor && !isRevealed ? 'hidden' : ''}`}
            onClick={() => onMoveClick(node.id, node.fen)}
          >
            <div className="move-content">
              {node.moveNumber > 0 && (
                <span className="move-number">
                  {node.color === 'w' ? `${node.moveNumber}.` : `${node.moveNumber}...`}
                </span>
              )}
              <span className="move-notation">{node.notation}</span>
            </div>

            {/* Status indicators */}
            <div className="status-indicators">
              {isRequired && (
                <div className="status-badge required-badge" title="Required for students">
                  ★
                </div>
              )}
              {node.annotation && (
                <div className="status-badge annotation-badge" title={node.annotation}>
                  💭
                </div>
              )}
            </div>

            {/* Instructor controls */}
            {isInstructor && (
              <div className="instructor-controls">
                <button
                  className={`control-btn required-toggle ${isRequired ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRequired(node.id, !isRequired);
                  }}
                  title="Mark as required for students"
                >
                  ⭐
                </button>
              </div>
            )}

            {/* Expand/collapse button */}
            {hasChildren && (
              <button
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}
          </div>
        </div>

        {/* Annotation */}
        {node.annotation && isExpanded && (
          <div className="annotation" style={{ marginLeft: `${(level + 1) * 40}px` }}>
            <span className="annotation-icon">💭</span>
            <span className="annotation-text">{node.annotation}</span>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="children-container">
            {node.children.map((child, index) => 
              renderNode(child, level + 1, index === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const requiredCount = variations.filter(v => requiredNodes.has(v.id)).length;
  const revealedCount = revealedNodes.size;

  return (
    <div className="horizontal-variation-tree">
      <div className="tree-header">
        <h3>🌳 Variation Tree</h3>
        {!isInstructor && (
          <div className="student-progress">
            <span>Progress: {revealedCount}/{requiredCount} required moves revealed</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${requiredCount > 0 ? (revealedCount / requiredCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="tree-content">
        {rootNodes.map((node, index) => 
          renderNode(node, 0, index === rootNodes.length - 1)
        )}
      </div>

      {!isInstructor && (
        <div className="tree-legend">
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-icon required"></div>
              <span>Required moves (★)</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon placeholder"></div>
              <span>Hidden moves (🔒)</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon annotation"></div>
              <span>Has annotation (💭)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalVariationTree;