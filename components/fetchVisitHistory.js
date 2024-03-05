import { supabase } from '../utils/supabase';

/**
 * Fetches the visit history for a specific user or IP and batches the detailed data retrieval.
 * 
 * @param {string|null} userId The user ID of the current user, null if guest.
 * @param {string|null} ip The IP address of the current user, used if guest.
 * @param {number|null} limit (Optional) The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchVisitHistory(userId, limit = null, ip) {
  let historyQuery = supabase
    .from('visit_history')
    .select(`
      page_id,
      content:page_id (id, slug, page_type, name, thumbnail_200x200, featured_img_alt_text)
    `) // Assume there's a foreign-key relationship set up in Supabase
    .order('visited_at', { ascending: false });

  if (userId) {
    historyQuery = historyQuery.eq('user_id', userId);
  } else if (ip) {
    historyQuery = historyQuery.eq('ip', ip);
  }

  if (limit) {
    historyQuery = historyQuery.limit(limit);
  }

  const { data, error, count } = await historyQuery;

  if (error) {
    console.error('Error fetching visit history', error.message);
    return { data: [], count: 0 };
  }
	
  // The related content details are already included in the data.
  return { data, count: parseInt(count, 10) || 0 };
}

export default fetchVisitHistory;

