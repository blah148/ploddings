import { supabase } from '../utils/supabase';

/**
 * Fetches unlocked songs for a specific user.
 * 
 * @param {string} userId The user ID to query for.
 * @param {number|null} limit The maximum number of entries to retrieve.
 * @returns {Promise<Array>} A promise that resolves to an array of unlocked songs.
 */
async function fetchUnlockedSongs(userId, limit = null) {
    // Ensure a valid userId is provided
    if (!userId) {
        console.error('fetchUnlockedSongs: userId is required');
        return [];
    }

    // Construct the base query with a join to the 'content' table where page_type is 'songs'.
    let query = supabase
        .from('users_content')
        .select(`
            content_id,
            content:content_id (id, slug, page_type, name, thumbnail_200x200, featured_img_alt_text)`) // Assumes a foreign-key relationship named 'content' on 'content_id'
        .eq('user_id', userId)
        .eq('content.page_type', 'songs')
        .order('unlocked_at', { ascending: false });

    if (limit !== null) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching unlocked songs:', error.message);
        return [];
    }

    // Return the data array containing the merged user_content entries and song details.
    return data;
}

export default fetchUnlockedSongs;

