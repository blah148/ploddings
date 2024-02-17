// components/fetchVisitHistory.js

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

  let historyQuery;

  // Query for fetching visit history by userId or IP
  if (userId) {
    historyQuery = supabase
      .from('latest_visit_history')
      .select('page_type, page_id', {count: 'exact'})
      .order('visited_at', { ascending: false })
      .eq('user_id', userId);
  } else if (ip) {
    historyQuery = supabase
      .from('latest_visit_history')
      .select('page_type, page_id', {count: 'exact'})
      .order('visited_at', { ascending: false })
      .eq('ip', ip);
  } else {
    // If neither userId nor ip is provided, return empty result
    return { data: [], count: 0 };
  }

  // Apply limit if provided
  if (limit !== null) {
    historyQuery = historyQuery.limit(limit);
  }

	const { data: historyData, error, count } = await historyQuery;

  if (error) {
    console.error('Error fetching visit history', error.message);
    return { data: [], count: 0 };
  }

  const pageDetailsPromises = historyData.map(async (item) => {
    const { data, error } = await supabase
      .from(item.page_type) // Use page_type to dynamically select the table
      .select('id, slug, name, thumbnail_200x200')
      .eq('id', item.page_id)
      .single(); // Assuming page_id is unique within each table

    if (error) {
      console.error(`Error fetching details for ${item.page_type}`, error.message);
      return null;
    }
		
    return {
      ...item,
      ...data, // Merge visit history item with its corresponding page details
    };
  });

	const detailedHistory = await Promise.all(pageDetailsPromises);

  const totalCount = parseInt(count, 10) || 0; // Ensure count is parsed as an integer, default to 0 if parsing fails


  // Return the detailed visit history along with the total count
  return { data: detailedHistory, count: totalCount };

}

export default fetchVisitHistory;

