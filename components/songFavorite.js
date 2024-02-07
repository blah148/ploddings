import React, { useEffect, useState } from 'react';
import useStore from '../zustandStore';
import axios from 'axios';
import { supabase } from '../pages/utils/supabase';

const FavoriteButton = ({ userId, isAuthenticated, id, page_slug, page_name, page_type }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { refreshData } = useStore();

  // Use a single localStorage key for all favorites
  const localStorageKey = "favorites";

  // Function to check if the current page is favorited by the guest user
  const checkFavoriteLocal = () => {
    const favorites = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    return favorites.some(favorite => favorite.slug === page_slug);
  };

  // Update favorite status in localStorage for guest users
  const updateFavoriteLocal = () => {
    let favorites = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    if (isFavorite) {
      // Remove from favorites
      favorites = favorites.filter(favorite => favorite.slug !== page_slug);
    } else {
      // Add to favorites with timestamp
      favorites.push({ slug: page_slug, name: page_name, page_type: page_type, timestamp: new Date().toISOString() });
    }
    localStorage.setItem(localStorageKey, JSON.stringify(favorites));
  };

  useEffect(() => {
    if (userId === null) {
      setIsFavorite(checkFavoriteLocal());
    } else if (userId && isAuthenticated) {
      // Fetch the current favorite status from the database for authenticated users
      const fetchFavoriteStatus = async () => {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userId)
            .eq('page_type', page_type)
            .eq('page_id', id);

          if (error) {
            throw error;
          }

          setIsFavorite(data.length > 0);
        } catch (error) {
          console.error('Error fetching favorite status:', error);
        }
      };

      fetchFavoriteStatus();
    }
  }, [userId, id, isAuthenticated, page_type, page_slug]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (userId !== null && isAuthenticated) {
      // Handle favorite toggle for authenticated users in the database
      const action = isFavorite ? 'remove' : 'add';
      try {
        const response = await axios.post('/api/favorites', {
          userId,
          pageId: id,
          pageType: page_type,
          action,
        });

        setIsFavorite(!isFavorite);
        await refreshData(userId);
        console.log(response.data.message);
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    } else {
      // Toggle favorite status in localStorage for guests
      updateFavoriteLocal();
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <button onClick={toggleFavorite}>
      {isFavorite ? 'Unfavorite' : 'Favorite'}
    </button>
  );
};

export default FavoriteButton;

