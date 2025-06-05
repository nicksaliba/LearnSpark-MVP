
// app/learn/[module]/[lessonId]/page.tsx - Example Lesson Page
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CodeEditor } from '@/components/learn/code-editor'
import { LessonContent } from '@/components/learn/lesson-content'
import { Navbar } from '@/components/navigation/navbar'
import { Card } from '@/components/ui/card'

// Mock lesson data - in production, this would come from your database
const mockLesson = {
  title: "Python Variables and Data Types",
  description: "Learn how to create and use variables in Python, and understand different data types.",
  difficulty: 'beginner' as const,
  xpReward: 150,
  estimatedTime: 15,
  objectives: [
    "Understand what variables are and how to create them",
    "Learn about different data types in Python",
    "Practice assigning values to variables",
    "Create your first Python program with variables"
  ]
}

const initialCode = `# Welcome to Python Variables!
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
print("Is Student:", is_student)`

const testCases = [
  {
    expectedOutput: "Name: Alice\nAge: 20\nIs Student: True",
    description: "Should print name, age, and student status"
  }
]

const hints = [
  "Remember to assign a string value to the 'name' variable using quotes",
  "Age should be a number (integer) without quotes",
  "is_student should be either True or False (boolean)",
  "Use print() function to display the variables"
]

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lessonCompleted, setLessonCompleted] = useState(false)

  const handleCodeSuccess = (solution: string) => {
    console.log('Code solution:', solution)
    setLessonCompleted(true)
  }

  const handleXPEarned = (xp: number) => {
    console.log('XP earned:', xp)
    // Here you would update the user's XP in the database
  }

  const handleLessonComplete = () => {
    // Mark lesson as complete and navigate to next lesson
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <LessonContent 
          lesson={mockLesson}
          onComplete={lessonCompleted ? handleLessonComplete : undefined}
        >
          {/* Theory Section */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What are Variables?</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Variables in Python are like containers that store data values. Think of them as labeled boxes 
                where you can put different types of information.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Python Data Types:</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>String</strong> - Text data, enclosed in quotes: <code>"Hello"</code></li>
                <li><strong>Integer</strong> - Whole numbers: <code>42</code></li>
                <li><strong>Float</strong> - Decimal numbers: <code>3.14</code></li>
                <li><strong>Boolean</strong> - True or False values: <code>True</code>, <code>False</code></li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-900 mb-2">Example:</h4>
                <pre className="text-sm bg-white p-3 rounded border">
{`# Creating variables
student_name = "Alice"    # String
student_age = 20          # Integer
gpa = 3.85               # Float
is_enrolled = True        # Boolean`}
                </pre>
              </div>
            </div>
          </Card>

          {/* Interactive Code Editor */}
          <CodeEditor
            lessonId={params?.lessonId as string}
            initialCode={initialCode}
            language="python"
            testCases={testCases}
            hints={hints}
            onSuccess={handleCodeSuccess}
            onXPEarned={handleXPEarned}
          />
        </LessonContent>
      </main>
    </div>
  )
}