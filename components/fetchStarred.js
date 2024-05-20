import { supabase } from '../utils/supabase';

/**
 * Fetches the starred items for a specific user or IP and includes the active membership status.
 * 
 * @param {string|null} userId - The user ID to query for, null if a guest user.
 * @param {number|null} limit - (Optional) The maximum number of entries to retrieve.
 * @param {string|null} ip - The IP address of the current user, used if guest.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchStarred(userId, limit = null, ip = null) {
    try {

        const { data, error, count } = await supabase
            .rpc('fetch_starred', {
                p_user_id: userId || null,
                p_ip_address: ip || null,
                fetch_limit: limit
            });

        if (error) {
            console.error('Error fetching starred items:', error.message, data);
            return { data: [], count: 0 };
        }

        // Log the contents of the retrieved object
        // console.log('Retrieved starred items data:', data);

        return { data, count: parseInt(count, 10) || 0 };
    } catch (error) {
        console.error('Error executing fetchStarred function:', error.message);
        return { data: [], count: 0 };
    }
}

export default fetchStarred;

