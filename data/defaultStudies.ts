// src/data/defaultStudies.ts
import { ChessStudy } from '../types/chess';

export const defaultStudies: ChessStudy[] = [
  {
    id: 'opening-principles-001',
    name: 'Basic Opening Principles',
    description: 'Learn the fundamental principles of chess openings: control the center, develop pieces, and castle early.',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    isPublic: true,
    tags: ['opening', 'beginner', 'fundamentals'],
    chapters: [
      {
        id: 'chapter-center-control',
        name: 'Chapter 1: Control the Center',
        description: 'Understanding central pawn moves and their importance',
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        annotations: {
          1: 'The move 1.e4 controls the central squares d5 and f5, and opens lines for the bishop and queen.',
          2: 'Black responds symmetrically with 1...e5, also fighting for central control.',
          3: 'Nf3 develops a piece while attacking the e5 pawn, following opening principles.',
          4: 'Nc6 defends the e5 pawn and develops a piece toward the center.'
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'chapter-piece-development',
        name: 'Chapter 2: Piece Development',
        description: 'How to develop your pieces efficiently in the opening',
        startingFen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        annotations: {
          1: 'After the opening moves, we should focus on developing our pieces quickly.',
          2: 'Knights before bishops is a good general rule to follow.',
          3: 'Develop pieces toward the center of the board where they have maximum influence.',
          4: 'Avoid moving the same piece twice in the opening unless absolutely necessary.'
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      },
      {
        id: 'chapter-king-safety',
        name: 'Chapter 3: King Safety',
        description: 'The importance of castling early and keeping your king safe',
        startingFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        annotations: {
          1: 'With pieces developed, it\'s time to think about king safety.',
          2: 'Castling moves the king to safety and connects the rooks.',
          3: 'Try to castle within the first 10 moves of the game.',
          4: 'Don\'t delay castling too long, as your king becomes vulnerable in the center.'
        },
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString()
      }
    ]
  },
  {
    id: 'tactical-patterns-001',
    name: 'Essential Tactical Patterns',
    description: 'Master the fundamental tactical motifs that every chess player should know.',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    isPublic: true,
    tags: ['tactics', 'intermediate', 'patterns'],
    chapters: [
      {
        id: 'chapter-pins',
        name: 'Chapter 1: Pin Tactics',
        description: 'Understanding and exploiting pins in chess positions',
        startingFen: 'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
        annotations: {
          1: 'The bishop on c4 is eyeing the f7 square, a weak point in Black\'s position.',
          2: 'This setup can lead to various tactical opportunities and pins.',
          3: 'Look for ways to exploit the pin on the f7 pawn.',
          4: 'Pins are powerful because the pinned piece cannot or should not move.'
        },
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'chapter-forks',
        name: 'Chapter 2: Fork Patterns',
        description: 'Knight forks, pawn forks, and other double attacks',
        startingFen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
        annotations: {
          1: 'Forks are powerful tactical weapons that attack two pieces simultaneously.',
          2: 'Knights are particularly good at creating forks due to their unique movement.',
          3: 'Always look for fork opportunities when your opponent\'s pieces are undefended.',
          4: 'The key to successful forks is proper piece coordination and timing.'
        },
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'chapter-discovered-attacks',
        name: 'Chapter 3: Discovered Attacks',
        description: 'Using piece movement to reveal attacks from other pieces',
        startingFen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
        annotations: {
          1: 'Discovered attacks occur when moving one piece reveals an attack from another.',
          2: 'These can be devastating because they create two threats at once.',
          3: 'The piece that moves can also create its own threat, making defense difficult.',
          4: 'Look for opportunities to line up your pieces for discovered attacks.'
        },
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      }
    ]
  },
  {
    id: 'endgame-fundamentals-001',
    name: 'Endgame Fundamentals',
    description: 'Master the basic endgames that every player must know to improve their chess.',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
    isPublic: true,
    tags: ['endgame', 'fundamentals', 'technique'],
    chapters: [
      {
        id: 'chapter-king-pawn-endgame',
        name: 'Chapter 1: King and Pawn vs King',
        description: 'The most fundamental endgame every chess player must master',
        startingFen: '8/8/8/8/8/8/4P3/4K2k w - - 0 1',
        annotations: {
          1: 'In king and pawn endgames, the key concepts are opposition and the square of the pawn.',
          2: 'The king must support the pawn\'s advance to ensure promotion.',
          3: 'Understanding these principles is crucial for all endgame play.',
          4: 'The defending king tries to block the pawn or capture it.'
        },
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString()
      },
      {
        id: 'chapter-queen-vs-pawn',
        name: 'Chapter 2: Queen vs Pawn',
        description: 'When a pawn becomes dangerous and how to handle it',
        startingFen: '8/8/8/8/8/8/1p6/1K1Q4 b - - 0 1',
        annotations: {
          1: 'A pawn on the 7th rank can be very dangerous, even against a queen.',
          2: 'The queen must be careful not to allow stalemate tricks.',
          3: 'Proper technique ensures the win in most positions.',
          4: 'The key is to approach with the king while controlling key squares.'
        },
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString()
      },
      {
        id: 'chapter-rook-endgames',
        name: 'Chapter 3: Basic Rook Endgames',
        description: 'Essential rook endgame principles and positions',
        startingFen: '8/8/8/8/8/8/r7/K6R w - - 0 1',
        annotations: {
          1: 'Rook endgames are the most common endgames in chess.',
          2: 'The Lucena position and Philidor position are essential to know.',
          3: 'Active rook play is usually more important than material.',
          4: 'Rooks belong behind passed pawns, both your own and your opponent\'s.'
        },
        createdAt: new Date('2024-02-01').toISOString(),
        updatedAt: new Date('2024-02-01').toISOString()
      }
    ]
  },
  {
    id: 'famous-games-001',
    name: 'Famous Chess Games',
    description: 'Study classical games from chess history to understand strategic concepts.',
    createdAt: new Date('2024-02-15').toISOString(),
    updatedAt: new Date('2024-02-15').toISOString(),
    isPublic: true,
    tags: ['classical', 'strategy', 'history'],
    chapters: [
      {
        id: 'chapter-immortal-game',
        name: 'The Immortal Game (1851)',
        description: 'Anderssen vs Kieseritzky - A brilliant sacrificial attack',
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        annotations: {
          1: 'This game showcases the romantic era of chess with brilliant sacrifices.',
          2: 'Anderssen sacrifices multiple pieces for a mating attack.',
          3: 'Notice how piece activity is valued over material.',
          4: 'This game demonstrates the power of the initiative in chess.'
        },
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString()
      },
      {
        id: 'chapter-evergreen-game',
        name: 'The Evergreen Game (1852)',
        description: 'Anderssen vs Dufresne - Another masterpiece of combination play',
        startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        annotations: {
          1: 'Another brilliant game by Anderssen showing tactical mastery.',
          2: 'The combination builds up gradually with increasing pressure.',
          3: 'Watch how every piece contributes to the final attack.',
          4: 'This game shows the importance of piece coordination.'
        },
        createdAt: new Date('2024-02-15').toISOString(),
        updatedAt: new Date('2024-02-15').toISOString()
      }
    ]
  },
  {
    id: 'puzzle-collection-001',
    name: 'Tactical Puzzle Collection',
    description: 'A collection of tactical puzzles to sharpen your calculation skills.',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString(),
    isPublic: true,
    tags: ['puzzles', 'tactics', 'training'],
    chapters: [
      {
        id: 'chapter-mate-in-1',
        name: 'Mate in 1 Puzzles',
        description: 'Simple checkmate puzzles to develop pattern recognition',
        startingFen: 'rnbqkb1r/pppp1Qpp/5n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4',
        annotations: {
          1: 'Look for forcing moves that deliver checkmate immediately.',
          2: 'Check all possible checks first.',
          3: 'Consider how the opponent king is trapped.',
          4: 'Practice these until pattern recognition becomes automatic.'
        },
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString()
      },
      {
        id: 'chapter-mate-in-2',
        name: 'Mate in 2 Puzzles',
        description: 'Two-move checkmate combinations',
        startingFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
        annotations: {
          1: 'These puzzles require calculating one move ahead.',
          2: 'Look for checks that limit the opponent\'s options.',
          3: 'Consider quiet moves that set up unstoppable threats.',
          4: 'Develop your ability to see combinations deeper.'
        },
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString()
      },
      {
        id: 'chapter-tactical-motifs',
        name: 'Mixed Tactical Motifs',
        description: 'Various tactical patterns combined',
        startingFen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 8',
        annotations: {
          1: 'Real games combine multiple tactical motifs.',
          2: 'Look for the strongest continuation in each position.',
          3: 'Consider both tactical and positional factors.',
          4: 'These puzzles prepare you for practical play.'
        },
        createdAt: new Date('2024-03-01').toISOString(),
        updatedAt: new Date('2024-03-01').toISOString()
      }
    ]
  }
];

// Helper function to get a study by ID
export const getStudyById = (id: string): ChessStudy | undefined => {
  return defaultStudies.find(study => study.id === id);
};

// Helper function to get studies by tag
export const getStudiesByTag = (tag: string): ChessStudy[] => {
  return defaultStudies.filter(study => study.tags?.includes(tag));
};

// Helper function to get beginner studies
export const getBeginnerStudies = (): ChessStudy[] => {
  return getStudiesByTag('beginner');
};

// Helper function to get tactical studies
export const getTacticalStudies = (): ChessStudy[] => {
  return getStudiesByTag('tactics');
};

// Helper function to get endgame studies
export const getEndgameStudies = (): ChessStudy[] => {
  return getStudiesByTag('endgame');
};