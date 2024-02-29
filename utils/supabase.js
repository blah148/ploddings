import { createClient } from '@supabase/supabase-js';
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// const supabaseUrl2 = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 console.log(`this should be the supabaseUrl: ${supabaseUrl}`);
 console.log(`this should be the supabaseKey: ${supabaseKey}`);

export const supabase = createClient(supabaseUrl, supabaseKey);
