// components/fetchBeingWatched.js

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
    console.log('FetchBeingWatched initiated', userId, userIp);
  
    let query = supabase
        .from('latest_visit_history') // Table name
        .select('page_type, page_id, name, slug, visited_at', { count: 'exact' })
        .order('visited_at', { ascending: false }); // Most recent visits first

    if (userId) {
        console.log('Querying for non-matching userIds and null user_ids');
        query = query.or(`user_id.neq.${userId},user_id.is.null`);
    } else if (userIp) {
        console.log('Querying for non-matching IPs and null IPs');
        query = query.or(`ip.neq.${userIp},ip.is.null`);
    } else {
        console.log('Neither userId nor userIp provided, returning empty result');
        return { data: [], count: 0 };
    }

    // Apply limit if provided
    if (limit !== null) {
        query = query.limit(limit);
    }

    let { data: historyData, error, count } = await query;

    if (error) {
        console.error('Error fetching being watched history:', error.message);
        return { data: [], count: 0 };
    }

    console.log('Fetched data:', historyData);

    const pageDetailsPromises = historyData.map(async (item) => {
        const { data, error } = await supabase
            .from(item.page_type) // Use page_type to dynamically select the table
            .select('id, slug, name, thumbnail_200x200')
            .eq('id', item.page_id)
            .single(); // Assuming page_id is unique within each table

        if (error) {
            console.error(`Error fetching details for ${item.page_type}:`, error.message);
            return null;
        }

        return {
            ...item,
            ...data, // Merge visit history item with its corresponding page details
        };
    });

    const detailedHistory = await Promise.all(pageDetailsPromises);
    const totalCount = parseInt(count, 10) || 0; // Ensure count is parsed as an integer, default to 0 if parsing fails

    console.log('Total count of being watched entries:', totalCount);
    // Return the detailed visit history along with the total count
    return { data: detailedHistory, count: totalCount };
}

export default fetchBeingWatched;

