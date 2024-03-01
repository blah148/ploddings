import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Export the Supabase URL
export { supabaseUrl };

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

