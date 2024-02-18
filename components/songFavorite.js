import React, { useEffect, useState } from 'react';
import useStore from '../zustandStore'; // Adjust import path as needed
import { supabase } from '../pages/utils/supabase'; // Adjust import path as needed
import { useLoading } from '../context/LoadingContext'; // Adjust import path as needed

const FavoriteButton = ({ userId = null, id, ip }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const { refreshStarred } = useStore();

  const toggleFavorite = async () => {
    startLoading();
    try {
      if (isFavorite) {
        // Case for authenticated users
        if (userId) {
          await supabase.from('favorites').delete().match({ user_id: userId, page_id: id });
        }
        // Case for guests
        else if (ip) {
          await supabase.from('favorites').delete().match({ ip, page_id: id });
        }
      } else {
        if (userId) {
          // Add favorite for authenticated users
          await supabase.from('favorites').insert([{ user_id: userId, page_id: id }]);
        } else if (ip) {
          // Add favorite for guests based on IP
          await supabase.from('favorites').insert([{ ip, page_id: id }]);
        }
      }
      setIsFavorite(!isFavorite);
      refreshStarred(userId, ip);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      stopLoading();
    }
  };

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        let query = supabase.from('favorites').select('*').eq('page_id', id);
        // Adjust condition to check for userId existence
        if (userId) {
          query = query.eq('user_id', userId);
        } else {
          query = query.eq('ip', ip);
        }
        const { data, error } = await query;
        if (error) throw error;
        setIsFavorite(data.length > 0);
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [userId, id, ip]);

  return (
    <button style={{ cursor: 'pointer' }} onClick={toggleFavorite}>
      {isFavorite ? 'Unfavorite' : 'Favorite'}
    </button>
  );
};

export default FavoriteButton;

