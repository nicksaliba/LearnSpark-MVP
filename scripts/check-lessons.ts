// scripts/check-lessons.ts - Quick script to verify lessons in database
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkLessons() {
  try {
    console.log('🔍 Checking lessons in database...\n')
    
    // Get all lessons
    const lessons = await prisma.lesson.findMany({
      orderBy: [
        { module: 'asc' },
        { orderIndex: 'asc' }
      ],
      select: {
        id: true,
        title: true,
        module: true,
        orderIndex: true,
        content: true
      }
    })
    
    console.log(`📚 Found ${lessons.length} lessons total\n`)
    
    // Group by module
    const moduleGroups = lessons.reduce((groups, lesson) => {
      if (!groups[lesson.module]) {
        groups[lesson.module] = []
      }
      groups[lesson.module].push(lesson)
      return groups
    }, {} as Record<string, typeof lessons>)
    
    // Display lessons by module
    Object.entries(moduleGroups).forEach(([module, moduleLessons]) => {
      console.log(`📖 ${module.toUpperCase().replace('-', ' ')} (${moduleLessons.length} lessons):`)
      moduleLessons.forEach(lesson => {
        const content = lesson.content as any
        console.log(`  ${lesson.orderIndex}. ${lesson.title}`)
        console.log(`     ID: ${lesson.id}`)
        console.log(`     Difficulty: ${content?.difficulty || 'N/A'}`)
        console.log(`     Time: ${content?.estimatedTime || 'N/A'} min`)
        console.log(`     URL: /learn/${module}/${lesson.id}`)
        console.log('')
      })
    })
    
    // Check for any potential issues
    console.log('🔧 Checking for issues...\n')
    
    // Check for duplicate order indices within modules
    Object.entries(moduleGroups).forEach(([module, moduleLessons]) => {
      const orderIndices = moduleLessons.map(l => l.orderIndex)
      const duplicates = orderIndices.filter((item, index) => orderIndices.indexOf(item) !== index)
      
      if (duplicates.length > 0) {
        console.log(`⚠️  ${module}: Duplicate order indices found: ${duplicates.join(', ')}`)
      }
    })
    
    // Check for missing essential lessons
    const hasCodeKingdomPython = lessons.some(l => 
      l.module === 'code-kingdom' && l.id.includes('python')
    )
    
    const hasAIIntro = lessons.some(l => 
      l.module === 'ai-citadel' && l.id.includes('intro')
    )
    
    if (!hasCodeKingdomPython) {
      console.log('⚠️  Missing Python lessons in Code Kingdom')
    }
    
    if (!hasAIIntro) {
      console.log('⚠️  Missing intro lesson in AI Citadel')
    }
    
    console.log('✅ Lesson check complete!\n')
    
    // Suggest test URLs
    console.log('🧪 Test these URLs in your browser:')
    console.log('   - http://localhost:3000/learn/code-kingdom')
    if (lessons.length > 0) {
      const firstLesson = lessons[0]
      console.log(`   - http://localhost:3000/learn/${firstLesson.module}/${firstLesson.id}`)
    }
    console.log('')
    
  } catch (error) {
    console.error('❌ Error checking lessons:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkLessons()
  .catch(console.error)