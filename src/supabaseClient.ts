/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types';

// Use environment variables for Vercel deployment, with a fallback to local development keys.
// Vercel will populate these variables from your project settings.
// Ensure you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel project's environment variables.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQw59OROxqZ2iRCeG5xEM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);