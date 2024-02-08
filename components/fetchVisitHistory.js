import { supabase } from '../pages/utils/supabase';
import React, { useState, useEffect, createContext, useContext } from 'react'

/**
 * Fetches the visit history for a specific user.
 * 
 * @param {string} userId The user ID to query the visit history for.
 * @param {number} limit (Optional) The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */

async function fetchVisitHistory(userId, limit = null, ip) {
  let query;

  // Determine the query based on whether userId is provided
  if (userId) {
    // Query for fetching visit history by userId
    query = supabase
      .from('latest_visit_history')
      .select('page_type, page_id, name, slug, visited_at', { count: 'exact' })
      .order('visited_at', { ascending: false })
      .eq('user_id', userId);
  } else if (ip) {
    // Query for fetching visit history by ip
    query = supabase
      .from('latest_visit_history')
      .select('page_type, page_id, name, slug, visited_at', { count: 'exact' })
      .order('visited_at', { ascending: false })
      .eq('ip', ip); // Use the IP field to match rows
  } else {
    // If neither userId nor ip is provided, return empty result
    return { data: [], count: 0 };
  }

  // Apply limit if provided
  if (limit !== null) {
    query = query.limit(limit);
  }

  try {
    const { data, error, count } = await query; // Execute the query

    if (error) {
      throw error;
    }

    return { data, count };
  } catch (error) {
    console.error('Error fetching visit history', error.message);
    return { data: [], count: 0 };
  }
}
export default fetchVisitHistory;

