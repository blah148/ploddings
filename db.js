// db.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  query: async (text, params) => {
    const { data, error } = await supabase.from('your_table_name').query(text, params);
    if (error) {
      throw error;
    }
    return data;
  },
};

