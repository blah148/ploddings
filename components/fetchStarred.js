import { supabase } from '../pages/utils/supabase';
import React, { useState, useEffect, createContext, useContext } from 'react'

/**
 * Fetches the starred pages for a specific user.
 * 
 * @param {string} userId The user ID to query the visit history for.
 * @returns {Promise<Array>} A promise that resolves to an array of entries.
 */
async function fetchStarred(userId) {
  if (!userId) {
    console.error('fetchStarred called without a userId');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('favorites') // Table name
      .select('page_type, page_id, created_at') // Fields to retrieve
      .eq('user_id', userId); // Match rows where user_id column equals userId

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching starred', error.message);
    return []; // Return an empty array in case of error
  }
}

export default fetchStarred;


