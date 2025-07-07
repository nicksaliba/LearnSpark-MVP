// prisma/seeds/phase1-seed.ts
import { PrismaClient, UserRole, GradeLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedAIModules } from './aiModules'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Phase 1 seed...')
  
  // Create default district
  const district = await prisma.schoolDistrict.upsert({
    where: { code: 'DIST001' },
    update: {},
    create: {
      name: 'Demo School District',
      code: 'DIST001',
      adminEmail: 'admin@district.edu',
      settings: {
        enabledModules: ['smart-tech', 'ai-basics', 'ml-applications', 'advanced-ai'],
        maxSchools: 10,
      }
    }
  })
  
  console.log('✅ Created district:', district.name)
  
  // Create default school
  const school = await prisma.school.upsert({
    where: { code: 'DEMO001' },
    update: {},
    create: {
      name: 'Demo Elementary School',
      code: 'DEMO001',
      districtId: district.id,
      adminEmail: 'admin@school.edu',
      settings: {
        enabledGradeLevels: ['K2', 'G35', 'G68'],
        maxStudentsPerClass: 30,
      }
    }
  })
  
  console.log('✅ Created school:', school.name)
  
  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10)
  
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.com' },
    update: {},
    create: {
      email: 'superadmin@platform.com',
      username: 'SuperAdmin',
      passwordHash: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      verified: true,
    }
  })
  
  // School Admin
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      email: 'admin@school.edu',
      username: 'SchoolAdmin',
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      schoolId: school.id,
      verified: true,
    }
  })
  
  // Teachers
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@school.edu' },
    update: {},
    create: {
      email: 'teacher1@school.edu',
      username: 'Ms. Johnson',
      passwordHash: hashedPassword,
      role: UserRole.TEACHER,
      schoolId: school.id,
      verified: true,
    }
  })
  
  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@school.edu' },
    update: {},
    create: {
      email: 'teacher2@school.edu',
      username: 'Mr. Smith',
      passwordHash: hashedPassword,
      role: UserRole.TEACHER,
      schoolId: school.id,
      verified: true,
    }
  })
  
  // Students of different grade levels
  const students = [
    { email: 'student1@school.edu', username: 'Alice', gradeLevel: GradeLevel.K2 },
    { email: 'student2@school.edu', username: 'Bob', gradeLevel: GradeLevel.K2 },
    { email: 'student3@school.edu', username: 'Charlie', gradeLevel: GradeLevel.G35 },
    { email: 'student4@school.edu', username: 'Diana', gradeLevel: GradeLevel.G35 },
    { email: 'student5@school.edu', username: 'Eve', gradeLevel: GradeLevel.G68 },
    { email: 'student6@school.edu', username: 'Frank', gradeLevel: GradeLevel.G68 },
  ]
  
  for (const studentData of students) {
    await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        ...studentData,
        passwordHash: hashedPassword,
        role: UserRole.STUDENT,
        schoolId: school.id,
        verified: true,
        xp: Math.floor(Math.random() * 1000),
        level: Math.floor(Math.random() * 5) + 1,
      }
    })
  }
  
  console.log('✅ Created demo users')
  
  // Seed AI modules and lessons
  await seedAIModules()
  
  // Create sample ethics modules
  await prisma.aIEthicsModule.createMany({
    data: [
      {
        title: 'Is it Fair? Understanding AI Bias',
        description: 'Learn how AI can sometimes be unfair and what we can do about it',
        gradeLevel: GradeLevel.G35,
        topic: 'BIAS_FAIRNESS',
        content: {
          introduction: 'AI systems learn from data, but sometimes that data can be unfair',
          scenarios: [
            {
              title: 'The Toy Recommender',
              description: 'An AI that only recommends dolls to girls and trucks to boys',
              discussion: 'Is this fair? What if a girl likes trucks?'
            }
          ],
          activities: [
            {
              type: 'discussion',
              prompt: 'Think of a time when someone made an unfair assumption about you'
            }
          ]
        },
        activities: {
          interactive: [
            {
              type: 'bias-detector',
              title: 'Find the Bias',
              description: 'Look at AI decisions and spot unfair patterns'
            }
          ]
        },
        orderIndex: 1,
        isActive: true
      },
      {
        title: 'Keeping Secrets Safe: AI and Privacy',
        description: 'Understanding how AI uses our information and how to stay safe',
        gradeLevel: GradeLevel.G35,
        topic: 'PRIVACY_SECURITY',
        content: {
          introduction: 'AI needs information to work, but we need to be careful about what we share',
          scenarios: [
            {
              title: 'The Smart Speaker',
              description: 'A device that listens to everything you say',
              discussion: 'What information is okay to share? What should stay private?'
            }
          ]
        },
        activities: {
          interactive: [
            {
              type: 'privacy-quiz',
              title: 'Private or Public?',
              description: 'Decide what information is safe to share online'
            }
          ]
        },
        orderIndex: 2,
        isActive: true
      }
    ]
  })
  
  console.log('✅ Created ethics modules')
  
  // Create sample teacher resources
  await prisma.teacherResource.createMany({
    data: [
      {
        title: 'Introduction to AI - Lesson Plan',
        description: 'Complete lesson plan for introducing AI concepts to K-2 students',
        resourceType: 'LESSON_PLAN',
        gradeLevel: GradeLevel.K2,
        content: '# Introduction to AI Lesson Plan\n\n## Objectives\n- Students will understand that computers can be "smart"\n- Students will identify smart technology in their daily lives\n\n## Materials\n- Picture cards of various devices\n- Simple programmable robot (optional)\n\n## Activities\n1. Circle time discussion\n2. Smart vs. Not Smart sorting game\n3. Robot commands activity',
        authorId: teacher1.id,
        tags: ['AI', 'Introduction', 'K-2'],
      },
      {
        title: 'AI Ethics Discussion Guide',
        description: 'Guide for leading discussions about AI fairness and bias with elementary students',
        resourceType: 'ACTIVITY',
        gradeLevel: GradeLevel.G35,
        content: '# AI Ethics Discussion Guide\n\n## Key Topics\n1. What makes something fair?\n2. How do computers learn?\n3. Why might a computer make unfair decisions?\n\n## Discussion Prompts\n- "Have you ever been treated unfairly?"\n- "How do we make sure everyone gets a fair chance?"\n- "What rules should computers follow?"',
        authorId: teacher2.id,
        tags: ['Ethics', 'AI', 'Discussion', 'Fairness'],
      }
    ]
  })
  
  console.log('✅ Created teacher resources')
  
  console.log('🎉 Phase 1 seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })