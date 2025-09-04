import { createClient } from '@supabase/supabase-js';

// Create a single, shared Supabase client instance
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Export the client as default for backward compatibility
export default supabase;
