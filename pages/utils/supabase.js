import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// console.log(`this should be the var2: ${supabaseUrl2}`);
// console.log(`this should be the var2: ${supabaseKey2}`);

export const supabase = createClient(supabaseUrl2, supabaseKey2);
