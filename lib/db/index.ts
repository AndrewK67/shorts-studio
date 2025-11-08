/**
 * Database module
 * Central export for database operations
 */

export * from './schema';
export * from './client';
export { db } from './localStorage';

// Future: Add Supabase or PostgreSQL client
// export { db } from './supabase';
// export { db } from './postgres';
