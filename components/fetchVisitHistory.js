import { supabase } from '../utils/supabase';

/**
 * Fetches the visit history for a specific user or IP and batches the detailed data retrieval.
 * 
 * @param {string|null} userId - The user ID to query for, null if a guest user.
 * @param {number|null} limit - (Optional) The maximum number of entries to retrieve.
 * @param {string|null} ip - The IP address of the current user, used if guest.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchVisitHistory(userId, ip = null, limit = null) {
    try {

        const { data, error, count } = await supabase
            .rpc('fetch_visit_history', {
                p_user_id: userId || null,
                p_ip_address: ip || null,
                fetch_limit: limit
            });

        if (error) {
            console.error('Error fetching visit history:', error.message, data);
            return { data: [], count: 0 };
        }

        // Log the contents of the retrieved object
        // console.log('Retrieved visit history data:', data);

        return { data, count: parseInt(count, 10) || 0 };
    } catch (error) {
        console.error('Error executing fetchVisitHistory function:', error.message);
        return { data: [], count: 0 };
    }
}

export default fetchVisitHistory;

