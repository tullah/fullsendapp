import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: unknown) {
  if (error instanceof Error) {
    console.error('Supabase error:', error.message);
    throw new Error(`Database error: ${error.message}`);
  }
  console.error('Unknown error:', error);
  throw new Error('An unknown database error occurred');
}

// Type guard for checking if a value is a valid player stat
export function isValidPlayerStat(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    value >= 1 &&
    value <= 99
  );
}

// Type guard for checking if a value is a valid spirit score
export function isValidSpiritScore(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    !isNaN(value) &&
    value >= 0 &&
    value <= 4
  );
} 