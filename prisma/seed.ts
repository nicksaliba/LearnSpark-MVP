// prisma/seed.ts - Database Seed Script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create sample achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { id: 'first-steps' },
      update: {},
      create: {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: 'star',
        xpReward: 50,
        criteria: {
          type: 'lesson_completed',
          count: 1
        }
      }
    }),
    prisma.achievement.upsert({
      where: { id: 'code-warrior' },
      update: {},
      create: {
        id: 'code-warrior',
        name: 'Code Warrior',
        description: 'Write your first function',
        icon: 'zap',
        xpReward: 100,
        criteria: {
          type: 'function_written',
          count: 1
        }
      }
    }),
    prisma.achievement.upsert({
      where: { id: 'streak-master' },
      update: {},
      create: {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: 'target',
        xpReward: 200,
        criteria: {
          type: 'streak',
          count: 7
        }
      }
    }),
    prisma.achievement.upsert({
      where: { id: 'function-master' },
      update: {},
      create: {
        id: 'function-master',
        name: 'Function Master',
        description: 'Complete 10 function exercises',
        icon: 'award',
        xpReward: 300,
        criteria: {
          type: 'function_exercises',
          count: 10
        }
      }
    }),
    prisma.achievement.upsert({
      where: { id: 'ai-explorer' },
      update: {},
      create: {
        id: 'ai-explorer',
        name: 'AI Explorer',
        description: 'Complete your first AI lesson',
        icon: 'crown',
        xpReward: 150,
        criteria: {
          type: 'ai_lesson_completed',
          count: 1
        }
      }
    })
  ])

  console.log(`Created ${achievements.length} achievements`)

  // Create sample lessons for Code Kingdom
  const codeKingdomLessons = await Promise.all([
    prisma.lesson.upsert({
      where: { id: 'python-variables' },
      update: {},
      create: {
        id: 'python-variables',
        title: 'Python Variables and Data Types',
        description: 'Learn how to create and use variables in Python, and understand different data types.',
        module: 'code-kingdom',
        orderIndex: 1,
        xpReward: 150,
        content: {
          difficulty: 'beginner',
          estimatedTime: 15,
          objectives: [
            'Understand what variables are and how to create them',
            'Learn about different data types in Python',
            'Practice assigning values to variables',
            'Create your first Python program with variables'
          ],
          initialCode: `# Welcome to Python Variables!\n# Let's create some variables and print them\n\n# Create a variable called 'name' with your name\nname = "Your Name Here"\n\n# Create a variable called 'age' with your age\nage = 25\n\n# Create a variable called 'is_student' \nis_student = True\n\n# Now print all variables\nprint("Name:", name)\nprint("Age:", age)\nprint("Is Student:", is_student)`,
          testCases: [
            {
              expectedOutput: 'Name: Alice\\nAge: 20\\nIs Student: True',
              description: 'Should print name, age, and student status'
            }
          ],
          hints: [
            "Remember to assign a string value to the 'name' variable using quotes",
            "Age should be a number (integer) without quotes",
            "is_student should be either True or False (boolean)",
            "Use print() function to display the variables"
          ]
        }
      }
    }),
    prisma.lesson.upsert({
      where: { id: 'python-functions' },
      update: {},
      create: {
        id: 'python-functions',
        title: 'Python Functions and Scope',
        description: 'Learn how to create and use functions in Python.',
        module: 'code-kingdom',
        orderIndex: 2,
        xpReward: 200,
        content: {
          difficulty: 'beginner',
          estimatedTime: 20,
          objectives: [
            'Understand what functions are and why they are useful',
            'Learn how to define and call functions',
            'Practice creating functions with parameters',
            'Understand function return values'
          ],
          initialCode: `# Functions in Python\n# Let's create some useful functions\n\ndef greet_user(name):\n    # Complete this function to greet a user\n    pass\n\ndef calculate_area(length, width):\n    # Complete this function to calculate rectangle area\n    pass\n\n# Test your functions\ngreet_user("Alice")\narea = calculate_area(5, 3)\nprint(f"Area: {area}")`,
          testCases: [
            {
              expectedOutput: 'Hello, Alice!\\nArea: 15',
              description: 'Should greet user and calculate area correctly'
            }
          ],
          hints: [
            "Use 'return' keyword to return values from functions",
            "Function parameters are like variables you can use inside the function",
            "Don't forget to replace 'pass' with actual code",
            "Use f-strings or .format() for string formatting"
          ]
        }
      }
    }),
    prisma.lesson.upsert({
      where: { id: 'python-loops' },
      update: {},
      create: {
        id: 'python-loops',
        title: 'Python Loops and Control Flow',
        description: 'Master loops and conditional statements in Python.',
        module: 'code-kingdom',
        orderIndex: 3,
        xpReward: 180,
        content: {
          difficulty: 'intermediate',
          estimatedTime: 25,
          objectives: [
            'Learn about for loops and while loops',
            'Understand conditional statements (if/else)',
            'Practice combining loops and conditions',
            'Create programs with control flow'
          ],
          initialCode: `# Loops and Control Flow\n# Let's practice with loops and conditions\n\n# Create a list of numbers\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\n\n# Use a for loop to print even numbers only\nfor num in numbers:\n    # Add your code here\n    pass\n\n# Create a while loop that counts down from 5\ncount = 5\nwhile count > 0:\n    # Add your code here\n    pass`,
          testCases: [
            {
              expectedOutput: '2\\n4\\n6\\n8\\n10\\n5\\n4\\n3\\n2\\n1',
              description: 'Should print even numbers and countdown'
            }
          ],
          hints: [
            "Use the modulo operator (%) to check if a number is even",
            "if num % 2 == 0: means the number is even",
            "Don't forget to decrement the count variable in the while loop",
            "Use print() to output each result"
          ]
        }
      }
    })
  ])

  console.log(`Created ${codeKingdomLessons.length} Code Kingdom lessons`)

  // Create sample lessons for AI Citadel
  const aiCitadelLessons = await Promise.all([
    prisma.lesson.upsert({
      where: { id: 'ai-intro' },
      update: {},
      create: {
        id: 'ai-intro',
        title: 'Introduction to Artificial Intelligence',
        description: 'Discover the fundamentals of AI and its applications.',
        module: 'ai-citadel',
        orderIndex: 1,
        xpReward: 160,
        content: {
          difficulty: 'beginner',
          estimatedTime: 18,
          objectives: [
            'Understand what artificial intelligence is',
            'Learn about different types of AI',
            'Explore real-world AI applications',
            'Understand AI ethics and responsibilities'
          ],
          initialCode: `# AI Concepts Quiz\n# Answer these questions about AI\n\n# What does AI stand for?\nai_meaning = ""\n\n# Name three types of machine learning\nml_types = []\n\n# Give an example of AI in everyday life\nai_example = ""\n\nprint(f"AI stands for: {ai_meaning}")\nprint(f"ML types: {ml_types}")\nprint(f"AI example: {ai_example}")`,
          testCases: [
            {
              expectedOutput: 'AI stands for: Artificial Intelligence',
              description: 'Should demonstrate understanding of AI concepts'
            }
          ],
          hints: [
            "AI stands for Artificial Intelligence",
            "Three types of ML are: supervised, unsupervised, reinforcement",
            "Examples: virtual assistants, recommendation systems, image recognition",
            "Fill in the variables with appropriate values"
          ]
        }
      }
    }),
    prisma.lesson.upsert({
      where: { id: 'neural-networks' },
      update: {},
      create: {
        id: 'neural-networks',
        title: 'Neural Networks Basics',
        description: 'Understanding the building blocks of modern AI.',
        module: 'ai-citadel',
        orderIndex: 2,
        xpReward: 220,
        content: {
          difficulty: 'intermediate',
          estimatedTime: 30,
          objectives: [
            'Understand what neural networks are',
            'Learn about neurons and layers',
            'Explore different types of neural networks',
            'Implement a simple neural network concept'
          ],
          initialCode: `# Simple Neural Network Concept\n# Let's create a basic neuron simulation\n\ndef simple_neuron(inputs, weights, bias):\n    # Calculate weighted sum\n    weighted_sum = 0\n    for i in range(len(inputs)):\n        # Add input * weight to weighted_sum\n        pass\n    \n    # Add bias\n    weighted_sum += bias\n    \n    # Apply activation function (simple threshold)\n    if weighted_sum > 0:\n        return 1\n    else:\n        return 0\n\n# Test the neuron\ninputs = [0.5, 0.3, 0.2]\nweights = [0.4, 0.7, 0.2]\nbias = 0.1\n\nresult = simple_neuron(inputs, weights, bias)\nprint(f"Neuron output: {result}")`,
          testCases: [
            {
              expectedOutput: 'Neuron output: 1',
              description: 'Should correctly calculate neuron output'
            }
          ],
          hints: [
            "Multiply each input by its corresponding weight",
            "Add all the weighted inputs together",
            "The weighted sum should be: (0.5*0.4) + (0.3*0.7) + (0.2*0.2) = 0.45",
            "With bias 0.1, total is 0.55, which is > 0, so output is 1"
          ]
        }
      }
    })
  ])

  console.log(`Created ${aiCitadelLessons.length} AI Citadel lessons`)

  // Create sample lessons for Chess Arena
  const chessArenaLessons = await Promise.all([
    prisma.lesson.upsert({
      where: { id: 'chess-basics' },
      update: {},
      create: {
        id: 'chess-basics',
        title: 'Chess Basics and Piece Movement',
        description: 'Learn the fundamental rules and piece movements in chess.',
        module: 'chess-arena',
        orderIndex: 1,
        xpReward: 140,
        content: {
          difficulty: 'beginner',
          estimatedTime: 20,
          objectives: [
            'Learn how each chess piece moves',
            'Understand the chess board layout',
            'Practice identifying legal moves',
            'Master basic chess terminology'
          ],
          initialCode: `# Chess Piece Movement Quiz\n# Complete the functions to show piece movements\n\ndef rook_moves(position):\n    # Rook moves horizontally and vertically\n    # Return list of possible moves from position\n    moves = []\n    # Add your logic here\n    return moves\n\ndef bishop_moves(position):\n    # Bishop moves diagonally\n    moves = []\n    # Add your logic here\n    return moves\n\n# Test your functions\nprint("Rook from e4:", rook_moves("e4"))\nprint("Bishop from d4:", bishop_moves("d4"))`,
          testCases: [
            {
              expectedOutput: 'Basic piece movement patterns',
              description: 'Should demonstrate understanding of piece movements'
            }
          ],
          hints: [
            "Rook moves in straight lines (ranks and files)",
            "Bishop moves in diagonal lines",
            "Consider the 8x8 board boundaries",
            "Use chess notation (a1-h8) for positions"
          ]
        }
      }
    }),
    prisma.lesson.upsert({
      where: { id: 'chess-strategy' },
      update: {},
      create: {
        id: 'chess-strategy',
        title: 'Chess Strategy and Tactics',
        description: 'Develop strategic thinking and tactical awareness.',
        module: 'chess-arena',
        orderIndex: 2,
        xpReward: 190,
        content: {
          difficulty: 'intermediate',
          estimatedTime: 25,
          objectives: [
            'Learn basic opening principles',
            'Understand tactical patterns',
            'Practice strategic thinking',
            'Apply endgame principles'
          ],
          initialCode: `# Chess Strategy Analyzer\n# Evaluate chess positions and strategies\n\ndef evaluate_opening_move(move):\n    # Evaluate if a move follows opening principles\n    good_principles = [\n        "control_center",\n        "develop_pieces", \n        "king_safety"\n    ]\n    \n    # Analyze the move\n    score = 0\n    # Add your evaluation logic\n    \n    return score\n\ndef find_tactical_pattern(position):\n    # Identify common tactical patterns\n    patterns = []\n    # Add pattern recognition logic\n    \n    return patterns\n\n# Test strategic thinking\nmove = "e4"  # King's pawn opening\nscore = evaluate_opening_move(move)\nprint(f"Move evaluation: {score}")`,
          testCases: [
            {
              expectedOutput: 'Strategic evaluation results',
              description: 'Should demonstrate strategic understanding'
            }
          ],
          hints: [
            "Good opening moves control the center",
            "Develop knights before bishops",
            "Castle early for king safety",
            "Look for pins, forks, and skewers in tactics"
          ]
        }
      }
    })
  ])

  console.log(`Created ${chessArenaLessons.length} Chess Arena lessons`)

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })