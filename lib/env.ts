// lib/env.ts - Extended environment validation
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    // Existing variables
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    
    // New AI Platform variables
    ADMIN_EMAIL: z.string().email().optional(),
    SUPER_ADMIN_EMAILS: z.string().optional(),
    
    // AI Service Keys
    OPENAI_API_KEY: z.string().optional(),
    TEACHABLE_MACHINE_KEY: z.string().optional(),
    
    // School/District Settings
    DEFAULT_SCHOOL_CODE: z.string().default("DEMO001"),
    DEFAULT_DISTRICT_CODE: z.string().default("DIST001"),
    
    // Feature Flags
    ENABLE_AI_SANDBOX: z.string().transform(v => v === 'true').default('true'),
    ENABLE_TEACHER_AI_ASSISTANT: z.string().transform(v => v === 'true').default('true'),
    ENABLE_ADVANCED_ANALYTICS: z.string().transform(v => v === 'true').default('false'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_AI_FEATURES: z.string().transform(v => v === 'true').default('true'),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    TEACHABLE_MACHINE_KEY: process.env.TEACHABLE_MACHINE_KEY,
    DEFAULT_SCHOOL_CODE: process.env.DEFAULT_SCHOOL_CODE,
    DEFAULT_DISTRICT_CODE: process.env.DEFAULT_DISTRICT_CODE,
    ENABLE_AI_SANDBOX: process.env.ENABLE_AI_SANDBOX,
    ENABLE_TEACHER_AI_ASSISTANT: process.env.ENABLE_TEACHER_AI_ASSISTANT,
    ENABLE_ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})