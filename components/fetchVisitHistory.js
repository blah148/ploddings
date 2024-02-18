import { supabase } from '../pages/utils/supabase';

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
    .from('latest_visit_history')
    .select('page_id', { count: 'exact' })
    .order('visited_at', { ascending: false });

  // Apply user or IP filter
  if (userId) {
    historyQuery = historyQuery.eq('user_id', userId);
  } else if (ip) {
    historyQuery = historyQuery.eq('ip', ip);
  }

  // Apply limit if specified
  if (limit) {
    historyQuery = historyQuery.limit(limit);
  }

  const { data: historyData, error, count } = await historyQuery;
  if (error || !historyData.length) {
    console.error('Error fetching visit history', error?.message);
    return { data: [], count: 0 };
  }

  // Use a Set to ensure unique page IDs for batch query
  const pageIds = [...new Set(historyData.map(item => item.page_id))];
  const { data: pagesData, error: pagesError } = await supabase
    .from('content')
    .select('id, slug, page_type, name, thumbnail_200x200')
    .in('id', pageIds);

  if (pagesError) {
    console.error('Error fetching page details', pagesError.message);
    return { data: [], count: 0 };
  }

  // Merge details into visit history data
  const detailedVisitHistory = historyData.map(visit => ({
    ...visit,
    ...pagesData.find(page => page.id === visit.page_id),
  }));

  return { data: detailedVisitHistory, count: parseInt(count, 10) || 0 };
}

export default fetchVisitHistory;

