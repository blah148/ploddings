import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const MusescoreEmbed = ({ userId, ip, pageId, embed_link, canAccess }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check(); // run on mount
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ✅ Different heights for mobile vs desktop
  const iframeHeight = isMobile ? '520px' : '800px';

  return canAccess ? (
    <iframe
      id="musescoreIframe"
      width="100%"
      height={iframeHeight}
      src={embed_link}
      frameBorder="0"
      allowFullScreen
      allow="autoplay; fullscreen"
      style={{
        borderRadius: '8px',
        transition: 'height 0.3s ease',
      }}
    ></iframe>
  ) : (
    <div>Access forbidden</div>
  );
};

export default MusescoreEmbed;

