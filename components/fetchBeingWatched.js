import { supabase } from '../pages/utils/supabase';
import React, { useState, useEffect, createContext, useContext } from 'react';

/**
 * Fetches what's being watched by other users.
 * 
 * @param {string|null} userId The user ID of the current user, null if guest.
 * @param {string|null} userIp The IP address of the current user, used if guest.
 * @param {number} limit (Optional) The maximum number of entries to retrieve.
 * @returns {Promise<{ data: Array, count: number }>} A promise that resolves to an object containing an array of entries and the count of objects.
 */
async function fetchBeingWatched(userId, userIp, limit = null) {
		try {
			let query = supabase
				.from('latest_visit_history') // Table name
				.select('page_type, page_id, name, slug, visited_at', { count: 'exact' })
				.order('visited_at', { ascending: false }); // Most recent visits first

			if (userId) {	
				query = query.or(`user_id.neq.${userId},user_id.is.null`);
			} else {
				query = query.or(`ip.neq.${userIp},ip.is.null`);
			}

    if (limit !== null) {
      query = query.limit(limit);
    }
		
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data, count };
  } catch (error) {
    console.error('Error fetching being watched history', error.message);
    return { data: [], count: 0 };
  }
}

export default fetchBeingWatched;

