// scripts/seed-lessons.ts - Script to add real lesson content
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const realLessons = [
  // Code Kingdom Lessons
  {
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
      theory: `
        <h3>What are Variables?</h3>
        <p>Variables in Python are like containers that store data values. Think of them as labeled boxes where you can put different types of information.</p>
        
        <h4>Python Data Types:</h4>
        <ul>
          <li><strong>String</strong> - Text data, enclosed in quotes: <code>"Hello"</code></li>
          <li><strong>Integer</strong> - Whole numbers: <code>42</code></li>
          <li><strong>Float</strong> - Decimal numbers: <code>3.14</code></li>
          <li><strong>Boolean</strong> - True or False values: <code>True</code>, <code>False</code></li>
        </ul>

        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h4>Example:</h4>
          <pre style="background: white; padding: 12px; border-radius: 4px;">
student_name = "Alice"    # String
student_age = 20          # Integer
gpa = 3.85               # Float
is_enrolled = True        # Boolean</pre>
        </div>
      `,
      initialCode: `# Welcome to Python Variables!
# Let's create some variables and print them

# Create a variable called 'name' with your name
name = "Your Name Here"

# Create a variable called 'age' with your age
age = 25

# Create a variable called 'is_student' 
is_student = True

# Now print all variables
print("Name:", name)
print("Age:", age)
print("Is Student:", is_student)`,
      testCases: [
        {
          expectedOutput: 'Name: Alice\nAge: 20\nIs Student: True',
          description: 'Should print name, age, and student status'
        }
      ],
      hints: [
        "Remember to assign a string value to the 'name' variable using quotes",
        "Age should be a number (integer) without quotes",
        "is_student should be either True or False (boolean)",
        "Use print() function to display the variables"
      ],
      language: 'python'
    }
  },
  {
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
      theory: `
        <h3>What are Functions?</h3>
        <p>Functions are reusable blocks of code that perform specific tasks. They help organize your code and avoid repetition.</p>
        
        <h4>Function Syntax:</h4>
        <pre style="background: #f8f9fa; padding: 12px; border-radius: 4px;">
def function_name(parameter1, parameter2):
    # Function body
    result = parameter1 + parameter2
    return result</pre>

        <p><strong>Key concepts:</strong></p>
        <ul>
          <li><code>def</code> - Keyword to define a function</li>
          <li><code>parameters</code> - Input values the function accepts</li>
          <li><code>return</code> - Sends a value back to the caller</li>
        </ul>
      `,
      initialCode: `# Functions in Python
# Let's create some useful functions

def greet_user(name):
    # Complete this function to greet a user
    pass

def calculate_area(length, width):
    # Complete this function to calculate rectangle area
    pass

# Test your functions
greet_user("Alice")
area = calculate_area(5, 3)
print(f"Area: {area}")`,
      testCases: [
        {
          expectedOutput: 'Hello, Alice!\nArea: 15',
          description: 'Should greet user and calculate area correctly'
        }
      ],
      hints: [
        "Use 'return' keyword to return values from functions",
        "Function parameters are like variables you can use inside the function",
        "Don't forget to replace 'pass' with actual code",
        "Use f-strings or .format() for string formatting"
      ],
      language: 'python'
    }
  },
  // AI Citadel Lessons
  {
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
      theory: `
        <h3>What is Artificial Intelligence?</h3>
        <p>Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and act like humans.</p>
        
        <h4>Types of AI:</h4>
        <ul>
          <li><strong>Narrow AI</strong> - AI designed for specific tasks (like voice assistants)</li>
          <li><strong>General AI</strong> - AI with human-level intelligence across all domains</li>
          <li><strong>Super AI</strong> - AI that surpasses human intelligence</li>
        </ul>

        <h4>Machine Learning Types:</h4>
        <ul>
          <li><strong>Supervised Learning</strong> - Learning from labeled examples</li>
          <li><strong>Unsupervised Learning</strong> - Finding patterns in unlabeled data</li>
          <li><strong>Reinforcement Learning</strong> - Learning through trial and error</li>
        </ul>

        <h4>Real-world Applications:</h4>
        <ul>
          <li>Virtual assistants (Siri, Alexa)</li>
          <li>Recommendation systems (Netflix, Spotify)</li>
          <li>Image recognition</li>
          <li>Autonomous vehicles</li>
          <li>Medical diagnosis</li>
        </ul>
      `,
      initialCode: `# AI Concepts Quiz
# Answer these questions about AI

# What does AI stand for?
ai_meaning = ""

# Name three types of machine learning
ml_types = []

# Give an example of AI in everyday life
ai_example = ""

print(f"AI stands for: {ai_meaning}")
print(f"ML types: {ml_types}")
print(f"AI example: {ai_example}")`,
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
      ],
      language: 'python'
    }
  },
  // Chess Arena Lessons
  {
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
      theory: `
        <h3>Chess Board and Pieces</h3>
        <p>Chess is played on an 8x8 board with 64 squares, alternating between light and dark colors.</p>
        
        <h4>Piece Movement:</h4>
        <ul>
          <li><strong>Pawn</strong> - Moves forward one square, captures diagonally</li>
          <li><strong>Rook</strong> - Moves horizontally and vertically any number of squares</li>
          <li><strong>Bishop</strong> - Moves diagonally any number of squares</li>
          <li><strong>Knight</strong> - Moves in an L-shape: 2 squares in one direction, 1 in perpendicular</li>
          <li><strong>Queen</strong> - Combines rook and bishop movements</li>
          <li><strong>King</strong> - Moves one square in any direction</li>
        </ul>

        <h4>Basic Rules:</h4>
        <ul>
          <li>White always moves first</li>
          <li>Players alternate turns</li>
          <li>The goal is to checkmate the opponent's king</li>
          <li>If you can't move without putting your king in check, it's stalemate</li>
        </ul>
      `,
      // This lesson doesn't need coding, so no initialCode
      testCases: [],
      hints: []
    }
  }
]

async function seedRealLessons() {
  console.log('🌱 Seeding real lesson content...')
  
  try {
    for (const lessonData of realLessons) {
      await prisma.lesson.upsert({
        where: { id: lessonData.id },
        update: lessonData,
        create: lessonData
      })
      console.log(`✅ Seeded lesson: ${lessonData.title}`)
    }
    
    console.log('🎉 All lessons seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding lessons:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedRealLessons()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })