// components/TuningEmbed.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed

const TuningEmbed = ({ tuningId }) => {
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
		//startLoading();
    const fetchTuningEmbed = async () => {
      if (!tuningId) return;

      try {
        const { data, error } = await supabase
          .from('tuning')
          .select('musescore_embed')
          .eq('id', tuningId)
					.single();

        if (error) {
					throw error;
				}

        if (data) {
          setEmbedUrl(data.musescore_embed);
        }
      } catch (error) {
        console.error('Error fetching tuning embed:', error.message);
      }
    };

    fetchTuningEmbed();
  }, [tuningId]);

  if (!embedUrl) return null;

  return (
		<>
		<iframe 
			width="100%" 
			height="300" 
			src={embedUrl} 
			frameBorder="0" 
			allowFullScreen 
			allow="autoplay; fullscreen">
		</iframe>
		</>
  );
};

export default TuningEmbed;

