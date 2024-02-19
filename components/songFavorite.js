import React, { useEffect, useState } from 'react';
import useStore from '../zustandStore'; // Adjust import path as needed
import { supabase } from '../pages/utils/supabase'; // Adjust import path as needed
import { useLoading } from '../context/LoadingContext';
import styles from '../styles/songs.module.css';

const FavoriteButton = ({ userId = null, id, ip }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { refreshStarred } = useStore();
  const { isLoading, startLoading, stopLoading } = useLoading();

  const toggleFavorite = async () => {
    startLoading();
    try {
      if (isFavorite) {
        if (userId) {
          await supabase.from('favorites').delete().match({ user_id: userId, page_id: id });
        } else if (ip) {
          await supabase.from('favorites').delete().match({ ip, page_id: id });
        }
      } else {
        if (userId) {
          await supabase.from('favorites').insert([{ user_id: userId, page_id: id }]);
        } else if (ip) {
          await supabase.from('favorites').insert([{ ip, page_id: id }]);
        }
      }
      setIsFavorite(!isFavorite);
      refreshStarred(userId, ip);
      stopLoading();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      stopLoading();
    }
  };

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        let query = supabase.from('favorites').select('user_id, page_id, ip').eq('page_id', id);
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

  // Define the fill color based on the isFavorite state
  const fillColor = isFavorite ? 'yellow' : 'grey';

  return (
    <svg id="star-icon" viewBox="0 0 32 32" style={{ cursor: 'pointer' }} onClick={toggleFavorite}>
      <path fill={fillColor} d="M16,2l-4.55,9.22L1.28,12.69l7.36,7.18L6.9,30,16,25.22,25.1,30,23.36,19.87l7.36-7.17L20.55,11.22Z"/>
    </svg>
  );
};

export default FavoriteButton;
