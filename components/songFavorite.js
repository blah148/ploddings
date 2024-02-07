import React, { useEffect, useState } from 'react';
import useStore from '../zustandStore';
import axios from 'axios'; // Ensure axios is installed or use fetch API
import { supabase } from '../pages/utils/supabase'; // Adjust the import path as needed

const FavoriteButton = ({ songId, userId, isAuthenticated }) => {
  const [isFavorite, setIsFavorite] = useState(false);
	const { refreshData } = useStore();

  // Fetch the current favorite status
  useEffect(() => {
    if (isAuthenticated && userId && songId) {
      const fetchFavoriteStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .eq('page_id', songId)

          if (error) {
            throw error;
          }

          setIsFavorite(!!data); // Set true if data is found, false otherwise
        } catch (error) {
          console.error('Error fetching favorite status:', error);
        }
      };

      fetchFavoriteStatus();
    }
  }, [userId, songId, isAuthenticated]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    const action = isFavorite ? 'remove' : 'add';
    try {
      const response = await axios.post('/api/favorites', {
        userId,
        pageId: songId,
				pageType: 'songs',
        action,
      });

      setIsFavorite(!isFavorite); // Toggle the local favorite state
			await refreshData(userId);
      console.log(response.data.message); // Handle response
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!isAuthenticated) return null; // Don't display button if user is not authenticated

  return (
    <button onClick={toggleFavorite}>
      {isFavorite ? 'Unfavorite' : 'Favorite'}
    </button>
  );
};

export default FavoriteButton;

