import { supabase } from '../utils/supabase';

async function fetchStarred(userId, limit = null, ip) {
  if (!userId && !ip) {
    return { data: [], count: 0 };
  }

  try {
    // Construct the query with deep fetching using the foreign key relationship
    // Note: This syntax is hypothetical and assumes that you've set up a view or
    // a stored procedure in Supabase that can handle this complex query.
    // Adjust 'content->' to match your actual database schema.
    let query = supabase
      .from('favorites')
      .select(`
        page_id,
        content:page_id (id, slug, page_type, name, thumbnail_200x200)
      `, { count: 'exact' })
			.order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (ip) {
      query = query.eq('ip', ip);
    }

    if (limit !== null) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching starred pages:', error.message);
      return { data: [], count: 0 };
    }

    // Assuming the structure of the returned data includes the content details nested
    // under each favorite, you can directly return this data.
    return { data, count: parseInt(count, 10) || 0 };
  } catch (error) {
    console.error('Error in fetchStarred:', error.message);
    return { data: [], count: 0 };
  }
}

export default fetchStarred;

