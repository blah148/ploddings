import { supabase } from '../utils/supabase';

/**
 * Fetches the visit history for a specific user or IP and batches the detailed data retrieval.
 * 
 * @param {string|null} userId The user ID of the current user, null if guest.
 * @param {number|null} limit (Optional) The maximum number of entries to retrieve.
 * @param {string|null} ip The IP address of the current user, used if guest.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchVisitHistory(userId, limit = null, ip = null) {
  try {
    // Construct the query based on parameters
    let query = supabase.rpc('fetch_visit_history', {
      p_user_id: userId || null,
      fetch_limit: limit,
      p_ip_address: ip || null
    });

    // Execute the query
    const { data, error, count } = await query;

    // Handle errors
    if (error) {
      console.error('Error fetching visit history:', error.message, data);
      return { data: [], count: 0 };
    }

    // Parse count
    const totalCount = parseInt(count, 10) || 0;

    return { data, count: totalCount };
  } catch (error) {
    console.error('Error executing fetchVisitHistory function:', error.message);
    return { data: [], count: 0 };
  }
}

export default fetchVisitHistory;

