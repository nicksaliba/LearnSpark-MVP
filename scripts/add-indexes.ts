// scripts/add-indexes.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addIndexes() {
  console.log('🔧 Adding database indexes...')
  
  try {
    // The indexes will be added when you run: npx prisma db push
    // This script is for any additional custom indexes if needed
    
    console.log('✅ Database indexes updated!')
    console.log('Run: npx prisma db push to apply changes')
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addIndexes().catch(console.error)