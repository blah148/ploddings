import { supabase } from '../utils/supabase';

/**
 * Fetches what's being watched by other users, including unlock status and active membership.
 * 
 * @param {string|null} userId - The user ID to query for, null if a guest user.
 * @param {string|null} userIp - The IP address to query for, used if a guest user.
 * @param {number|null} limit - The maximum number of entries to retrieve.
 * @returns {Promise<{data: Array, count: number}>} A promise that resolves to an object containing an array of entries and the total count.
 */
async function fetchBeingWatched(userId, userIp, limit = null) {
    try {
        const { data, error, count } = await supabase
            .rpc('fetch_being_watched', {
                p_user_id: userId || null,
                p_ip_address: userIp || null,
                fetch_limit: limit
            });

        if (error) {
            console.error('Error fetching being watched history:', error.message, data);
            return { data: [], count: 0 };
        }

        return { data, count: parseInt(count, 10) || 0 };
    } catch (error) {
        console.error('Error executing fetchBeingWatched function:', error.message);
        return { data: [], count: 0 };
    }
}

export default fetchBeingWatched;

