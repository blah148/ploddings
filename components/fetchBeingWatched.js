import { supabase } from '../utils/supabase';

/**
 * Fetches what's being watched by other users in a more efficient manner by leveraging relationships.
 * 
 * @param {string|null} userId The user ID to query for, null if a guest user.
 * @param {string|null} userIp The IP address to query for, used if a guest user.
 * @param {number|null} limit The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the total count.
 */
async function fetchBeingWatched(userId, userIp, limit = null) {
    // Construct the base query with a join to the 'content' table.
    let query = supabase
        .from('visit_history')
        .select(`
            page_id,
            content:page_id (id, slug, name, thumbnail_200x200)`, { count: 'exact' }) // Assumes a foreign-key relationship named 'content' on 'page_id'
        .order('visited_at', { ascending: false });

    if (userId) {
        query = query.or(`user_id.neq.${userId},user_id.is.null`);
    } else if (userIp) {
        query = query.or(`ip.neq.${userIp},ip.is.null`);
    } else {
        return { data: [], count: 0 }; // Early return if no user ID or IP is provided.
    }

    if (limit !== null) {
        query = query.limit(limit);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching being watched history:', error.message);
        return { data: [], count: 0 };
    }

    // Since the content details are included in the response, there's no need for additional processing.
    // The data array already contains the merged visit history and content details.
    return { data, count: parseInt(count, 10) || 0 };
}

export default fetchBeingWatched;

