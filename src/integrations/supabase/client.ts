import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Create a single, shared Supabase client instance with proper typing
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Export the client as default for backward compatibility
export default supabase;

// Export generated types for convenience
export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './types';

// Import types for convenience aliases
import type { Tables, TablesInsert, TablesUpdate } from './types';

// Convenience type aliases for your main tables
export type Box = Tables<'boxes'>;
export type User = Tables<'users'>;
export type BoxInsert = TablesInsert<'boxes'>;
export type BoxUpdate = TablesUpdate<'boxes'>;
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
