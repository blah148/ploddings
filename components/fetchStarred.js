import { supabase } from '../pages/utils/supabase';

/**
 * Fetches the starred (favorited) pages for a specific user or IP.
 * 
 * @param {string|null} userId The user ID to query the starred pages for, null if guest.
 * @param {string|null} ip The IP address to query the starred pages for, used if guest.
 * @param {number} limit (Optional) The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchStarred(userId, limit = null, ip) {
  // Early return if neither userId nor ip is provided
  if (!userId && !ip) {
    return { data: [], count: 0 };
  }

  try {
    let favoritesQuery = supabase
      .from('favorites')
      .select('page_type, page_id', { count: 'exact' }); // Include count in the same query

    // Apply filtering based on userId or ip, if provided
    if (userId) {
      favoritesQuery = favoritesQuery.eq('user_id', userId);
    } else if (ip) {
      favoritesQuery = favoritesQuery.eq('ip', ip);
    }

    // Apply ordering and limit, if specified
    favoritesQuery = favoritesQuery.order('created_at', { ascending: false });
    if (limit !== null) {
      favoritesQuery = favoritesQuery.limit(limit);
    }

    const { data: favoritesData, error: favoritesError, count } = await favoritesQuery;

    if (favoritesError) {
      throw favoritesError;
    }

    // Dynamically fetch detailed data for each favorite
    const pageDetailsPromises = favoritesData.map(async (favorite) => {
      const { data, error } = await supabase
        .from(favorite.page_type)
        .select('id, slug, name, thumbnail_200x200')
        .eq('id', favorite.page_id)
        .single(); // Assuming page_id is unique within each table

      if (error) {
        console.error(`Error fetching details for ${favorite.page_type}`, error.message);
        return null;
      }

      return {
        ...favorite,
        ...data, // Merge favorite item with its corresponding detailed data
      };
    });

    const detailedData = await Promise.all(pageDetailsPromises).then(results => results.filter(item => item !== null));

    // Ensure count is parsed as an integer, default to 0 if parsing fails
    const totalCount = parseInt(count, 10) || 0;

    return { data: detailedData, count: totalCount };
  } catch (error) {
    console.error('Error fetching starred pages', error.message);
    return { data: [], count: 0 };
  }
}

export default fetchStarred;

