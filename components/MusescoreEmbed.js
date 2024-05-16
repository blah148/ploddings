import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { getFingerprint } from '../utils/fingerprint';

const MusescoreEmbed = ({ userId, ip, pageId, embed_link }) => {
  const [canAccess, setCanAccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        try {
          const response = await fetch(`/api/active_membership-verify?userId=${userId}`);
          if (response.status === 200) {
            setCanAccess(true);
            return;
          }
        } catch (error) {
          console.error('Error verifying active membership:', error);
        }
      }

      try {
        const fingerprint = await getFingerprint();
				console.log("fingerprint, ip, page_id", fingerprint, ip, pageId);
        const response = await fetch('/api/check_visitor_access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip, fingerprint, pageId }),
        });

        if (response.status === 200) {
          setCanAccess(true);
        } else {
          setCanAccess(false);
        }
      } catch (error) {
        console.error('Error checking visitor access:', error);
        setCanAccess(false);
      }
    };

    fetchData();
  }, [userId, ip]);

  return canAccess ? (
    <iframe
      id="musescoreIframe"
      width="100%"
      height="600px"
      src={embed_link}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; fullscreen"
    ></iframe>
  ) : <div>Access forbidden - testing</div>;
};

export default MusescoreEmbed;

