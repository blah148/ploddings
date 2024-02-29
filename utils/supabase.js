import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
