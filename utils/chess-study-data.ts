// src/utils/debug-study-data.ts
import { CreateStudyData } from '../types/chess';

// Debug function to create a sample study data
export const createSampleStudyData = (): CreateStudyData => {
  return {
    name: 'Sample Study',
    description: 'A sample study for testing',
    startingFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    isPublic: false,
    tags: ['test', 'sample']
  };
};

// Validate study data structure
export const validateStudyData = (data: any): data is CreateStudyData => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.name === 'string' &&
    data.name.trim().length > 0 &&
    (data.description === undefined || typeof data.description === 'string') &&
    (data.startingFen === undefined || typeof data.startingFen === 'string') &&
    (data.isPublic === undefined || typeof data.isPublic === 'boolean') &&
    (data.tags === undefined || Array.isArray(data.tags))
  );
};

// Log study data for debugging
export const debugStudyData = (data: any, context: string = 'unknown') => {
  console.log(`[DEBUG] Study data in ${context}:`, data);
  console.log(`[DEBUG] Is valid CreateStudyData:`, validateStudyData(data));
  
  if (data) {
    console.log(`[DEBUG] Data properties:`, Object.keys(data));
    console.log(`[DEBUG] Name type:`, typeof data.name);
    console.log(`[DEBUG] Name value:`, data.name);
  }
};