// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta)
    // Send to external logging service
  },
  error: (message: string, error?: Error, meta?: any) => {
    console.error(`[ERROR] ${message}`, error, meta)
    // Send to error tracking service
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${message}`, meta)
  }
}