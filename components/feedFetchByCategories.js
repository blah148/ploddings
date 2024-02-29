import { supabase } from '../utils/supabase';

/**
 * Fetches content organized by categories.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array where each element represents a category and its associated content.
 */
async function FetchContentByCategory() {
  try {
    // Perform a query that joins 'categories' and 'content' tables on the 'id' and 'category_id' fields, respectively.
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, content!inner(category_id, id, title, description)')
      .order('name', { foreignTable: 'content', ascending: true });

    if (error) throw error;

    // The result will be an array of categories, each with a 'content' array containing the content items belonging to that category.
    return data;
  } catch (error) {
    console.error('Error fetching content by category:', error.message);
    return [];
  }
}

export default FetchContentByCategory;

