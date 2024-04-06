import { supabase } from '../utils/supabase';

/**
 * Fetches starred pages for a specific user or IP.
 * 
 * @param {string|null} userId The user ID of the current user, null if guest.
 * @param {number|null} limit (Optional) The maximum number of entries to retrieve.
 * @param {string|null} ip The IP address of the current user, used if guest.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchStarred(userId, limit = null, ip = null) {
  try {
    let params = {
      p_user_id: userId || null,
      fetch_limit: limit,
      p_ip_address: null // If userId is present, set ip to null
    };

    // If userId is null and ip is present, set ip
    if (!userId && ip) {
      params.p_ip_address = ip;
    }

    // Construct the query based on parameters
    let query = supabase.rpc('fetch_starred', params);

    // Execute the query
    const { data, error, count } = await query;

    // Handle errors
    if (error) {
      console.error('Error fetching starred pages:', error.message, data);
      return { data: [], count: 0 };
    }

    // Parse count
    const totalCount = parseInt(count, 10) || 0;

    return { data, count: totalCount };
  } catch (error) {
    console.error('Error executing fetchStarred function:', error.message);
    return { data: [], count: 0 };
  }
}

export default fetchStarred;

