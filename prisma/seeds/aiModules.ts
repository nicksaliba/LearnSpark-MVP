// prisma/seeds/aiModules.ts
import { PrismaClient, GradeLevel, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

export const aiModules = [
  {
    name: 'Introduction to Smart Technology',
    slug: 'smart-tech-intro',
    description: 'Learn how technology can be smart and help people',
    gradeLevel: GradeLevel.K2,
    orderIndex: 1,
    lessons: [
      {
        title: 'What Makes Technology Smart?',
        description: 'Discover the difference between regular objects and smart technology',
        gradeLevel: GradeLevel.K2,
        difficulty: Difficulty.BEGINNER,
        orderIndex: 1,
        xpReward: 50,
        estimatedTime: 20,
        isPublished: true,
        content: {
          objectives: [
            'Identify smart devices in everyday life',
            'Understand that technology can help people',
            'Recognize patterns in how we interact with technology'
          ],
          theory: 'Smart technology is all around us! From phones that recognize our voice to toys that respond to our movements.',
          activities: [
            {
              type: 'unplugged',
              title: 'Robot Simon Says',
              description: 'Students act as robots following precise commands'
            },
            {
              type: 'interactive',
              title: 'Smart or Not Smart?',
              description: 'Sort objects into smart and regular categories'
            }
          ],
          examples: [
            'Voice assistants like Alexa or Siri',
            'Smart toys that respond to touch',
            'Automatic doors at the store'
          ]
        }
      },
      {
        title: 'How Do Smart Devices Help Us?',
        description: 'Explore how smart technology makes our lives easier and safer',
        gradeLevel: GradeLevel.K2,
        difficulty: Difficulty.BEGINNER,
        orderIndex: 2,
        xpReward: 50,
        estimatedTime: 25,
        isPublished: true,
        content: {
          objectives: [
            'List ways smart technology helps people',
            'Understand basic safety with technology',
            'Create simple instructions for a pretend robot'
          ],
          theory: 'Smart devices can help us stay safe, learn new things, and have fun! They follow instructions we give them.',
          activities: [
            {
              type: 'discussion',
              title: 'Technology Helpers',
              description: 'Share how technology helps at home and school'
            }
          ]
        }
      }
    ]
  },
  {
    name: 'Understanding AI Basics',
    slug: 'ai-basics',
    description: 'Introduction to Artificial Intelligence, data, and predictions',
    gradeLevel: GradeLevel.G35,
    orderIndex: 2,
    lessons: [
      {
        title: 'What is Artificial Intelligence?',
        description: 'Learn what AI is and how it uses data to make decisions',
        gradeLevel: GradeLevel.G35,
        difficulty: Difficulty.BEGINNER,
        orderIndex: 1,
        xpReward: 75,
        estimatedTime: 30,
        isPublished: true,
        content: {
          objectives: [
            'Define Artificial Intelligence in simple terms',
            'Understand how AI uses data',
            'Identify AI in everyday applications'
          ],
          theory: 'Artificial Intelligence is when computers learn from information to make smart decisions, just like how you learn from experience!',
          activities: [
            {
              type: 'interactive',
              title: 'Train Your First AI',
              description: 'Use Teachable Machine to create a simple image classifier'
            },
            {
              type: 'game',
              title: 'AI or Human?',
              description: 'Guess whether actions were done by AI or humans'
            }
          ],
          vocabulary: [
            'Artificial Intelligence (AI): Computers that can learn and make decisions',
            'Data: Information that computers use to learn',
            'Training: Teaching a computer by showing it examples'
          ]
        }
      },
      {
        title: 'How AI Learns from Data',
        description: 'Discover how AI uses patterns in data to learn and improve',
        gradeLevel: GradeLevel.G35,
        difficulty: Difficulty.BEGINNER,
        orderIndex: 2,
        xpReward: 75,
        estimatedTime: 35,
        isPublished: true,
        content: {
          objectives: [
            'Explain how AI learns from examples',
            'Identify patterns in data',
            'Create a simple dataset for AI training'
          ],
          theory: 'AI learns by looking at many examples and finding patterns, similar to how you learned to recognize letters by seeing them many times.',
          activities: [
            {
              type: 'hands-on',
              title: 'Pattern Detective',
              description: 'Find patterns in different datasets'
            }
          ]
        }
      },
      {
        title: 'AI in Our Daily Lives',
        description: 'Explore the many ways AI helps us every day',
        gradeLevel: GradeLevel.G35,
        difficulty: Difficulty.INTERMEDIATE,
        orderIndex: 3,
        xpReward: 100,
        estimatedTime: 30,
        isPublished: true,
        content: {
          objectives: [
            'List 5 examples of AI in daily life',
            'Explain how AI makes recommendations',
            'Design a simple AI helper'
          ],
          theory: 'AI is everywhere! It helps recommend videos, recognize faces in photos, and even helps doctors find diseases.',
          activities: [
            {
              type: 'project',
              title: 'Design an AI Helper',
              description: 'Create your own AI assistant idea'
            }
          ]
        }
      }
    ]
  },
  {
    name: 'Machine Learning Applications',
    slug: 'ml-applications',
    description: 'Explore how computers learn from data and real-world ML applications',
    gradeLevel: GradeLevel.G68,
    orderIndex: 3,
    lessons: [
      {
        title: 'Introduction to Machine Learning',
        description: 'Understand the basics of how machines learn from data',
        gradeLevel: GradeLevel.G68,
        difficulty: Difficulty.INTERMEDIATE,
        orderIndex: 1,
        xpReward: 100,
        estimatedTime: 40,
        isPublished: true,
        content: {
          objectives: [
            'Differentiate between traditional programming and machine learning',
            'Identify supervised vs unsupervised learning',
            'Create a simple ML model'
          ],
          theory: 'Machine Learning is a type of AI where computers learn patterns from data instead of being explicitly programmed for every scenario.',
          activities: [
            {
              type: 'coding',
              title: 'Build a Classifier',
              description: 'Create a simple image classifier with Python'
            }
          ],
          codeExamples: [
            {
              title: 'Simple ML Example',
              language: 'python',
              code: `# Train a simple classifier
from sklearn import tree
features = [[140, 1], [130, 1], [150, 0], [170, 0]]
labels = ["apple", "apple", "orange", "orange"]
clf = tree.DecisionTreeClassifier()
clf = clf.fit(features, labels)`
            }
          ]
        }
      },
      {
        title: 'Neural Networks Basics',
        description: 'Learn how neural networks mimic the human brain',
        gradeLevel: GradeLevel.G68,
        difficulty: Difficulty.INTERMEDIATE,
        orderIndex: 2,
        xpReward: 125,
        estimatedTime: 45,
        isPublished: true,
        content: {
          objectives: [
            'Understand the structure of neural networks',
            'Explain how neurons process information',
            'Build a simple neural network visualization'
          ],
          theory: 'Neural networks are inspired by how our brains work, with interconnected nodes that process and pass information.',
          activities: [
            {
              type: 'interactive',
              title: 'Neural Network Playground',
              description: 'Experiment with neural network parameters'
            }
          ]
        }
      },
      {
        title: 'Computer Vision Projects',
        description: 'Build projects that help computers "see" and understand images',
        gradeLevel: GradeLevel.G68,
        difficulty: Difficulty.ADVANCED,
        orderIndex: 3,
        xpReward: 150,
        estimatedTime: 50,
        isPublished: true,
        content: {
          objectives: [
            'Build an image recognition model',
            'Understand how computers process images',
            'Create a practical computer vision application'
          ],
          theory: 'Computer vision allows computers to understand and process visual information from the world, just like our eyes and brain do.',
          activities: [
            {
              type: 'project',
              title: 'Object Detector',
              description: 'Build an app that identifies objects in photos'
            }
          ]
        }
      }
    ]
  },
  {
    name: 'Advanced AI Concepts',
    slug: 'advanced-ai',
    description: 'Deep dive into neural networks, deep learning, and cutting-edge AI',
    gradeLevel: GradeLevel.G912,
    orderIndex: 4,
    lessons: [
      {
        title: 'Deep Learning Fundamentals',
        description: 'Master the concepts behind deep neural networks',
        gradeLevel: GradeLevel.G912,
        difficulty: Difficulty.ADVANCED,
        orderIndex: 1,
        xpReward: 200,
        estimatedTime: 60,
        isPublished: true,
        content: {
          objectives: [
            'Implement a deep neural network from scratch',
            'Understand backpropagation and gradient descent',
            'Apply deep learning to real problems'
          ],
          theory: 'Deep learning uses multiple layers of neural networks to progressively extract higher-level features from raw input.',
          activities: [
            {
              type: 'coding',
              title: 'Build a Deep Neural Network',
              description: 'Implement a multi-layer neural network in Python'
            }
          ],
          prerequisites: ['Python programming', 'Basic calculus', 'Linear algebra basics']
        }
      },
      {
        title: 'Natural Language Processing',
        description: 'Teach computers to understand and generate human language',
        gradeLevel: GradeLevel.G912,
        difficulty: Difficulty.ADVANCED,
        orderIndex: 2,
        xpReward: 200,
        estimatedTime: 55,
        isPublished: true,
        content: {
          objectives: [
            'Build a text classification model',
            'Understand word embeddings',
            'Create a simple chatbot'
          ],
          theory: 'NLP enables computers to read, understand, and derive meaning from human language in a valuable way.',
          activities: [
            {
              type: 'project',
              title: 'Sentiment Analyzer',
              description: 'Build an AI that understands emotions in text'
            }
          ]
        }
      },
      {
        title: 'Generative AI and Ethics',
        description: 'Explore AI that creates content and its ethical implications',
        gradeLevel: GradeLevel.G912,
        difficulty: Difficulty.ADVANCED,
        orderIndex: 3,
        xpReward: 250,
        estimatedTime: 60,
        isPublished: false, // Coming soon
        content: {
          objectives: [
            'Understand how generative AI works',
            'Explore ethical considerations in AI',
            'Build a responsible AI application'
          ],
          theory: 'Generative AI can create new content, but with great power comes great responsibility.',
          activities: [
            {
              type: 'discussion',
              title: 'AI Ethics Debate',
              description: 'Discuss the implications of AI-generated content'
            },
            {
              type: 'project',
              title: 'Ethical AI Assistant',
              description: 'Build an AI with built-in ethical guidelines'
            }
          ]
        }
      }
    ]
  }
]

export async function seedAIModules() {
  console.log('🌱 Seeding AI modules...')
  
  for (const moduleData of aiModules) {
    const { lessons, ...module } = moduleData
    
    // Check if module already exists
    const existingModule = await prisma.aIModule.findUnique({
      where: { slug: module.slug }
    })
    
    if (existingModule) {
      console.log(`✓ Module already exists: ${module.name}`)
      continue
    }
    
    const createdModule = await prisma.aIModule.create({
      data: {
        ...module,
        lessons: {
          create: lessons
        }
      }
    })
    
    console.log(`✅ Created module: ${createdModule.name} with ${lessons.length} lessons`)
  }
  
  console.log('✅ AI modules seeding completed!')
}

// If running this file directly
if (require.main === module) {
  seedAIModules()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}