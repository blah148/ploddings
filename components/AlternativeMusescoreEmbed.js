import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AlternativeMusescoreEmbed = ({ ip, fingerprint, songId }) => {
  const [contentData, setContentData] = useState(null);

  useEffect(() => {
    const checkAccessAndFetchLink = async () => {
      try {
        // Check if the visitor exists in the 'visitors' table
        let { data: visitor, error } = await supabase
          .from('visitors')
          .select('free_visit_page_id')
          .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
          .order('timestamp_column', { ascending: false })
          .limit(1)
          .single();

        if (error || !visitor) {
          console.error('Error fetching visitor data:', error);
          return;
        }

        const { free_visit_page_id } = visitor;
        console.log('Free visit page ID:', free_visit_page_id);

        // Fetch the link and name from the 'content' table
        let { data: content, error: contentError } = await supabase
          .from('content')
          .select('link_3, name')
          .eq('id', free_visit_page_id)
          .single();

        if (contentError || !content) {
          console.error('Error fetching content data:', contentError);
          return;
        }

        setContentData(content);
      } catch (err) {
        console.error('Error during access check:', err);
      }
    };

    checkAccessAndFetchLink();
  }, [ip, fingerprint, songId]);

  if (!contentData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Access denied. Here is a related link you can check out:</p>
      <a href={contentData.link_3} target="_blank" rel="noopener noreferrer">
        {contentData.name}
      </a>
    </div>
  );
};

export default AlternativeMusescoreEmbed;

