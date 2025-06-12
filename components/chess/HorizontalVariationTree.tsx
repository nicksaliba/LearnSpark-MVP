'use client';
import React, { useState, useCallback, useMemo } from 'react';

// Sample data structure for chess variations
const sampleVariations = [
  {
    id: 'start',
    move: null,
    notation: 'Start',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    children: ['e4'],
    parent: null,
    depth: 0,
    isMainLine: true,
    isRequired: true,
    moveNumber: 0,
    color: 'w'
  },
  {
    id: 'e4',
    move: { from: 'e2', to: 'e4', san: 'e4' },
    notation: 'e4',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    children: ['e5', 'c5', 'e6', 'd5'],
    parent: 'start',
    depth: 1,
    isMainLine: true,
    isRequired: true,
    moveNumber: 1,
    color: 'w'
  },
  {
    id: 'e5',
    move: { from: 'e7', to: 'e5', san: 'e5' },
    notation: 'e5',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    children: ['nf3', 'd4-center', 'nc3-vienna'],
    parent: 'e4',
    depth: 2,
    isMainLine: true,
    isRequired: true,
    moveNumber: 1,
    color: 'b'
  },
  {
    id: 'c5',
    move: { from: 'c7', to: 'c5', san: 'c5' },
    notation: 'c5',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    children: ['nf3-sicilian'],
    parent: 'e4',
    depth: 2,
    isMainLine: false,
    isRequired: false,
    moveNumber: 1,
    color: 'b'
  },
  {
    id: 'e6',
    move: { from: 'e7', to: 'e6', san: 'e6' },
    notation: 'e6',
    fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    children: ['d4-french'],
    parent: 'e4',
    depth: 2,
    isMainLine: false,
    isRequired: false,
    moveNumber: 1,
    color: 'b'
  },
  {
    id: 'd5',
    move: { from: 'd7', to: 'd5', san: 'd5' },
    notation: 'd5',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2',
    children: ['exd5'],
    parent: 'e4',
    depth: 2,
    isMainLine: false,
    isRequired: false,
    moveNumber: 1,
    color: 'b'
  },
  {
    id: 'nf3',
    move: { from: 'g1', to: 'f3', san: 'Nf3' },
    notation: 'Nf3',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    children: ['nc6', 'd6-philidor', 'nf6-petrov'],
    parent: 'e5',
    depth: 3,
    isMainLine: true,
    isRequired: true,
    moveNumber: 2,
    color: 'w'
  },
  {
    id: 'd4-center',
    move: { from: 'd2', to: 'd4', san: 'd4' },
    notation: 'd4',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/3PP3/8/PPP2PPP/RNBQKBNR b KQkq d3 0 2',
    children: ['exd4'],
    parent: 'e5',
    depth: 3,
    isMainLine: false,
    isRequired: false,
    moveNumber: 2,
    color: 'w',
    annotation: 'Center Game - direct confrontation'
  },
  {
    id: 'nc3-vienna',
    move: { from: 'b1', to: 'c3', san: 'Nc3' },
    notation: 'Nc3',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 2',
    children: ['nc6-vienna'],
    parent: 'e5',
    depth: 3,
    isMainLine: false,
    isRequired: false,
    moveNumber: 2,
    color: 'w',
    annotation: 'Vienna Game - flexible development'
  },
  {
    id: 'nc6',
    move: { from: 'b8', to: 'c6', san: 'Nc6' },
    notation: 'Nc6',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    children: ['bc4-italian', 'd4-scotch', 'bb5-ruy'],
    parent: 'nf3',
    depth: 4,
    isMainLine: true,
    isRequired: true,
    moveNumber: 2,
    color: 'b'
  },
  {
    id: 'd6-philidor',
    move: { from: 'd7', to: 'd6', san: 'd6' },
    notation: 'd6',
    fen: 'rnbqkbnr/ppp2ppp/3p4/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 3',
    children: ['d4-philidor'],
    parent: 'nf3',
    depth: 4,
    isMainLine: false,
    isRequired: false,
    moveNumber: 2,
    color: 'b',
    annotation: 'Philidor Defense - solid but passive'
  },
  {
    id: 'nf6-petrov',
    move: { from: 'g8', to: 'f6', san: 'Nf6' },
    notation: 'Nf6',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    children: ['nxe5'],
    parent: 'nf3',
    depth: 4,
    isMainLine: false,
    isRequired: false,
    moveNumber: 2,
    color: 'b',
    annotation: "Petrov's Defense - counterattacking the center"
  },
  {
    id: 'bc4-italian',
    move: { from: 'f1', to: 'c4', san: 'Bc4' },
    notation: 'Bc4',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    children: ['bc5', 'be7', 'f5'],
    parent: 'nc6',
    depth: 5,
    isMainLine: true,
    isRequired: true,
    moveNumber: 3,
    color: 'w',
    annotation: 'Italian Game - classical development'
  },
  {
    id: 'd4-scotch',
    move: { from: 'd2', to: 'd4', san: 'd4' },
    notation: 'd4',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3',
    children: ['exd4-scotch'],
    parent: 'nc6',
    depth: 5,
    isMainLine: false,
    isRequired: true,
    moveNumber: 3,
    color: 'w',
    annotation: 'Scotch Game - opening the center'
  },
  {
    id: 'bb5-ruy',
    move: { from: 'f1', to: 'b5', san: 'Bb5' },
    notation: 'Bb5',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    children: ['a6', 'nf6-berlin', 'f5-schliemann'],
    parent: 'nc6',
    depth: 5,
    isMainLine: false,
    isRequired: true,
    moveNumber: 3,
    color: 'w',
    annotation: 'Ruy-Lopez - the Spanish Opening'
  }
];

const HorizontalVariationTree = () => {
  const [isInstructorMode, setIsInstructorMode] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['start', 'e4', 'e5', 'nf3', 'nc6']));
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPath, setCurrentPath] = useState(['start']); // Track the current path from root
  const [playedMoves, setPlayedMoves] = useState([]); // Track moves played on the board
  const [requiredNodes, setRequiredNodes] = useState(new Set(['start', 'e4', 'e5', 'nf3', 'nc6', 'bc4-italian', 'd4-scotch', 'bb5-ruy']));
  const [hintableNodes, setHintableNodes] = useState(new Set(['bc4-italian', 'bb5-ruy']));

  // Build tree structure from flat data
  const treeStructure = useMemo(() => {
    const nodeMap = {};
    const roots = [];

    // Create node map
    sampleVariations.forEach(variation => {
      nodeMap[variation.id] = {
        ...variation,
        children: []
      };
    });

    // Build parent-child relationships
    sampleVariations.forEach(variation => {
      if (variation.parent) {
        if (nodeMap[variation.parent]) {
          nodeMap[variation.parent].children.push(nodeMap[variation.id]);
        }
      } else {
        roots.push(nodeMap[variation.id]);
      }
    });

    return { nodeMap, roots };
  }, []);

  // Get the path from root to any node
  const getPathToNode = useCallback((nodeId) => {
    const path = [];
    let current = treeStructure.nodeMap[nodeId];
    
    while (current) {
      path.unshift(current.id);
      current = current.parent ? treeStructure.nodeMap[current.parent] : null;
    }
    
    return path;
  }, [treeStructure]);

  // Get all moves from root to a specific node
  const getMovesToNode = useCallback((nodeId) => {
    const path = getPathToNode(nodeId);
    const moves = [];
    
    for (let i = 1; i < path.length; i++) { // Skip 'start' node
      const node = treeStructure.nodeMap[path[i]];
      if (node && node.move) {
        moves.push({
          id: node.id,
          notation: node.notation,
          move: node.move,
          fen: node.fen
        });
      }
    }
    
    return moves;
  }, [treeStructure, getPathToNode]);

  const toggleExpanded = useCallback((nodeId) => {
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

  const toggleRequired = useCallback((nodeId) => {
    if (!isInstructorMode) return;
    
    setRequiredNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, [isInstructorMode]);

  const toggleHintable = useCallback((nodeId) => {
    if (!isInstructorMode) return;
    
    setHintableNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, [isInstructorMode]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node.id);
    
    if (node.id === 'start') {
      // Reset to starting position
      setCurrentPath(['start']);
      setPlayedMoves([]);
      console.log('Reset to starting position');
      // Here you would call: onLoadPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
      return;
    }

    const targetPath = getPathToNode(node.id);
    const currentPathLength = currentPath.length;
    
    // Find the common ancestor between current path and target path
    let commonAncestorIndex = 0;
    for (let i = 0; i < Math.min(currentPath.length, targetPath.length); i++) {
      if (currentPath[i] === targetPath[i]) {
        commonAncestorIndex = i;
      } else {
        break;
      }
    }

    // If clicking on a node that's already in our current path
    if (currentPath.includes(node.id)) {
      const nodeIndex = currentPath.indexOf(node.id);
      const newPath = currentPath.slice(0, nodeIndex + 1);
      const newPlayedMoves = getMovesToNode(node.id);
      
      setCurrentPath(newPath);
      setPlayedMoves(newPlayedMoves);
      
      console.log('Navigated back to:', node.notation);
      console.log('Position FEN:', node.fen);
      console.log('Moves played:', newPlayedMoves);
      // Here you would call: onLoadPosition(node.fen)
      return;
    }

    // If clicking on a new branch, we need to navigate step by step
    const nextNodeInPath = targetPath[currentPathLength];
    
    if (nextNodeInPath) {
      const nextNode = treeStructure.nodeMap[nextNodeInPath];
      if (nextNode) {
        const newPath = [...currentPath, nextNode.id];
        const newPlayedMoves = getMovesToNode(nextNode.id);
        
        setCurrentPath(newPath);
        setPlayedMoves(newPlayedMoves);
        
        console.log('Made move:', nextNode.notation);
        console.log('Position FEN:', nextNode.fen);
        console.log('Current path:', newPath);
        console.log('Moves played:', newPlayedMoves);
        
        // Here you would call: onLoadPosition(nextNode.fen)
        // And update the chess board to show this position
      }
    }
  }, [currentPath, getPathToNode, getMovesToNode, treeStructure]);

  const renderNode = useCallback((node, isLast = false) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;
    const isInCurrentPath = currentPath.includes(node.id);
    const isNextMove = currentPath.length < getPathToNode(node.id).length && 
                       getPathToNode(node.id)[currentPath.length] === node.id &&
                       getPathToNode(node.id).slice(0, currentPath.length).every((id, i) => id === currentPath[i]);
    const isRequired = requiredNodes.has(node.id);
    const isHintable = hintableNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const shouldShowInStudentMode = !isInstructorMode ? (isRequired || node.isMainLine) : true;

    if (!shouldShowInStudentMode) return null;

    return (
      <div key={node.id} className="variation-node-container">
        <div className="node-line">
          {/* Connector line */}
          {node.parent && (
            <div className="connector">
              <div className="horizontal-line"></div>
              {!isLast && <div className="vertical-line"></div>}
            </div>
          )}
          
          {/* Node content */}
          <div 
            className={`variation-node ${node.isMainLine ? 'main-line' : 'side-line'} ${
              isSelected ? 'selected' : ''
            } ${isInCurrentPath ? 'in-path' : ''} ${
              isNextMove ? 'next-move' : ''
            } ${isRequired ? 'required' : ''} ${isHintable ? 'hintable' : ''}`}
            onClick={() => handleNodeClick(node)}
          >
            {/* Move notation */}
            <div className="move-content">
              {node.moveNumber > 0 && (
                <span className="move-number">
                  {node.color === 'w' ? `${node.moveNumber}.` : `${node.moveNumber}...`}
                </span>
              )}
              <span className="move-notation">{node.notation}</span>
            </div>

            {/* Navigation indicators */}
            <div className="nav-indicators">
              {isInCurrentPath && (
                <div className="nav-badge current-path" title="In current path">
                  ✓
                </div>
              )}
              {isNextMove && (
                <div className="nav-badge next-move-indicator" title="Click to continue">
                  →
                </div>
              )}
            </div>

            {/* Status indicators */}
            <div className="status-indicators">
              {isRequired && (
                <div className="status-badge required-badge" title="Required for students">
                  ★
                </div>
              )}
              {isHintable && (
                <div className="status-badge hint-badge" title="Hintable move">
                  💡
                </div>
              )}
            </div>

            {/* Instructor controls */}
            {isInstructorMode && node.id !== 'start' && (
              <div className="instructor-controls">
                <button
                  className={`control-btn required-toggle ${isRequired ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRequired(node.id);
                  }}
                  title="Mark as required for students"
                >
                  ☆
                </button>
                <button
                  className={`control-btn hint-toggle ${isHintable ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHintable(node.id);
                  }}
                  title="Mark as hintable"
                >
                  💡
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
        {node.annotation && (
          <div className="annotation">
            <span className="annotation-icon">💭</span>
            <span className="annotation-text">{node.annotation}</span>
          </div>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="children-container">
            {node.children.map((child, index) => (
              <div key={child.id} className="child-wrapper">
                {renderNode(child, index === node.children.length - 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [expandedNodes, selectedNode, currentPath, requiredNodes, hintableNodes, isInstructorMode, handleNodeClick, toggleExpanded, toggleRequired, toggleHintable, getPathToNode]);

  const exportConfiguration = useCallback(() => {
    const config = {
      requiredNodes: Array.from(requiredNodes),
      hintableNodes: Array.from(hintableNodes),
      timestamp: new Date().toISOString()
    };
    console.log('Exported configuration:', config);
    // Here you would save to backend or download as JSON
  }, [requiredNodes, hintableNodes]);

  const stats = useMemo(() => {
    const total = sampleVariations.length;
    const required = requiredNodes.size;
    const hintable = hintableNodes.size;
    const mainLine = sampleVariations.filter(v => v.isMainLine).length;
    
    return { total, required, hintable, mainLine };
  }, [requiredNodes, hintableNodes]);

  return (
    <div className="horizontal-variation-tree">
      {/* Header */}
      <div className="tree-header">
        <div className="header-content">
          <h2>🌳 Chess Opening Tree</h2>
          <p>Interactive variation explorer with instructor controls</p>
        </div>
        
        <div className="header-controls">
          <button
            className={`mode-toggle ${isInstructorMode ? 'instructor' : 'student'}`}
            onClick={() => setIsInstructorMode(!isInstructorMode)}
          >
            {isInstructorMode ? '👨‍🏫 Instructor' : '👨‍🎓 Student'} Mode
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="tree-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Moves</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.required}</span>
          <span className="stat-label">Required</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.hintable}</span>
          <span className="stat-label">Hintable</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.mainLine}</span>
          <span className="stat-label">Main Line</span>
        </div>
      </div>

      {/* Controls */}
      {isInstructorMode && (
        <div className="instructor-panel">
          <div className="panel-header">
            <h3>👨‍🏫 Instructor Controls</h3>
          </div>
          <div className="control-buttons">
            <button
              className="control-btn expand-all"
              onClick={() => setExpandedNodes(new Set(sampleVariations.map(v => v.id)))}
            >
              🔓 Expand All
            </button>
            <button
              className="control-btn collapse-all"
              onClick={() => setExpandedNodes(new Set(['start']))}
            >
              🔒 Collapse All
            </button>
            <button
              className="control-btn export"
              onClick={exportConfiguration}
            >
              💾 Export Config
            </button>
          </div>
          <div className="instructor-instructions">
            <p><strong>★</strong> Mark moves as required for student focus</p>
            <p><strong>💡</strong> Mark moves as hintable during study</p>
          </div>
        </div>
      )}

      {/* Navigation Panel */}
      <div className="navigation-panel">
        <div className="panel-header">
          <h3>🎯 Current Position</h3>
        </div>
        <div className="navigation-info">
          <div className="current-path-display">
            <strong>Path:</strong> 
            {currentPath.slice(1).map((nodeId, index) => {
              const node = treeStructure.nodeMap[nodeId];
              return node ? (
                <span key={nodeId} className="path-move">
                  {index > 0 && ' → '}{node.notation}
                </span>
              ) : null;
            })}
            {currentPath.length === 1 && <span className="path-move">Starting Position</span>}
          </div>
          <div className="move-count">
            <strong>Moves played:</strong> {playedMoves.length}
          </div>
          {playedMoves.length > 0 && (
            <div className="current-fen">
              <strong>Position:</strong> 
              <code className="fen-display">{treeStructure.nodeMap[currentPath[currentPath.length - 1]]?.fen || 'N/A'}</code>
            </div>
          )}
        </div>
        
        {/* Navigation hints for students */}
        {!isInstructorMode && (
          <div className="navigation-hints">
            <div className="hint-item">
              <span className="hint-icon">✓</span>
              <span>Green checkmark = moves you've played</span>
            </div>
            <div className="hint-item">
              <span className="hint-icon">→</span>
              <span>Arrow = next possible move to continue</span>
            </div>
            <div className="hint-item">
              <span className="hint-icon">💡</span>
              <span>Click any move to jump to that position</span>
            </div>
          </div>
        )}
        
        {/* Reset button */}
        <div className="navigation-controls">
          <button
            className="reset-btn"
            onClick={() => handleNodeClick(treeStructure.nodeMap['start'])}
          >
            🔄 Reset to Start
          </button>
        </div>
      </div>

      {/* Variation Tree */}
      <div className="tree-container">
        <div className="tree-content">
          {treeStructure.roots.map(root => renderNode(root))}
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
            <span>Alternative</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon in-path"></div>
            <span>Played (✓)</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon next-move"></div>
            <span>Next Move (→)</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon required"></div>
            <span>Required (★)</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon hintable"></div>
            <span>Hintable (💡)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalVariationTree;