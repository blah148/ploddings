import { supabase } from '../pages/utils/supabase';
import React, { useState, useEffect, createContext, useContext } from 'react'

/**
 * Fetches the starred pages for a specific user.
 * 
 * @param {string} userId The user ID to query the visit history for.
 * @param {number} limit (Optional) The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */

async function fetchStarred(userId, limit = null) {
  if (!userId) {
    console.error('fetchStarred called without a userId');
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('favorites') // Table name
      .select('page_type, page_id, slug, name, created_at', { count: 'exact' }) // Include count in the same query to reduce calls
			.order('created_at', { ascending: false })
      .eq('user_id', userId); // Match rows where user_id column equals userId

    if (limit !== null) {
      query = query.limit(limit);
    }

    const { data, error, count } = await query; // Access count directly from the query response

    if (error) {
      throw error;
    }

    // No need for a separate count query since count is obtained from the first query
    return { data, count };
  } catch (error) {
    console.error('Error fetching starred', error.message);
    return { data: [], count: 0 }; // Return an empty array and count in case of error
  }
}
export default fetchStarred;

