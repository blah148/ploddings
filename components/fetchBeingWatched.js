import { supabase } from '../pages/utils/supabase';

/**
 * Fetches what's being watched by other users in a more efficient manner by batching the second query.
 * 
 * @param {string|null} userId The user ID to query for, null if a guest user.
 * @param {string|null} userIp The IP address to query for, used if a guest user.
 * @param {number|null} limit The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the total count.
 */
async function fetchBeingWatched(userId, userIp, limit = null) {
    let query = supabase
        .from('latest_visit_history')
        .select('page_id', { count: 'exact' })
        .order('visited_at', { ascending: false });

    if (userId) {
        query = query.or(`user_id.neq.${userId},user_id.is.null`);
    } else if (userIp) {
        query = query.or(`ip.neq.${userIp},ip.is.null`);
    } else {
        // If no user ID or IP is provided, return an empty response.
        return { data: [], count: 0 };
    }

    if (limit) {
        query = query.limit(limit);
    }

    const { data: historyData, error, count } = await query;

    if (error) {
        console.error('Error fetching being watched history:', error.message);
        return { data: [], count: 0 };
    }

    // Collect unique page IDs from the history data for a batch request.
    const pageIds = [...new Set(historyData.map(item => item.page_id))];

    // Perform a single batch request to fetch all page details.
    const { data: pageDetails, error: detailsError } = await supabase
        .from('content') // Assuming all page types are now in a unified 'content' table
        .select('id, slug, name, thumbnail_200x200')
        .in('id', pageIds);

    if (detailsError) {
        console.error('Error fetching page details:', detailsError.message);
        return { data: [], count: 0 };
    }

    // Merge the page details back into the history data.
    const detailedHistory = historyData.map(historyItem => {
        const detail = pageDetails.find(detail => detail.id === historyItem.page_id);
        return {
            ...historyItem,
            ...detail,
        };
    });

    return { data: detailedHistory, count: parseInt(count, 10) || 0 };
}

export default fetchBeingWatched;

