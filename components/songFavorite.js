import React, { useEffect, useState } from 'react';
import useStore from '../zustandStore'; // Adjust the import path as needed
import { supabase } from '../pages/utils/supabase';

const FavoriteButton = ({ userId, isAuthenticated, id, page_slug, page_name, page_type, ip }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { refreshData } = useStore();

  useEffect(() => {
    // Check favorite status for both authenticated users and guests
    const fetchFavoriteStatus = async () => {
      try {
        let query = supabase
          .from('favorites')
          .select('*')
          .eq('page_type', page_type)
          .eq('page_id', id);

        if (userId && isAuthenticated) {
          query = query.eq('user_id', userId);
        } else {
          query = query.eq('ip', ip);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setIsFavorite(data.length > 0);
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [userId, id, isAuthenticated, page_type, ip]);

  // Toggle favorite status for both authenticated users and guests
  const toggleFavorite = async () => {
    if (userId !== null && isAuthenticated) {
      // Handle favorite toggle for authenticated users in the database
      // Your existing logic for authenticated users remains unchanged
    } else {
      // Handle favorite toggle for guests based on IP
      try {
        if (isFavorite) {
          // Remove favorite for guests based on IP
          const { error } = await supabase
            .from('favorites')
            .delete()
            .match({ ip: ip, page_type: page_type, page_id: id });

          if (error) throw error;
        } else {
          // Add favorite for guests based on IP
          const { error } = await supabase
            .from('favorites')
            .insert([{ ip: ip, page_type: page_type, page_id: id, user_id: null }]);

          if (error) throw error;
        }

        setIsFavorite(!isFavorite);
        // Optionally, refresh data if needed
      } catch (error) {
        console.error('Error toggling favorite for guest:', error);
      }
    }
  };

  return (
    <button onClick={toggleFavorite}>
      {isFavorite ? 'Unfavorite' : 'Favorite'}
    </button>
  );
};

export default FavoriteButton;

