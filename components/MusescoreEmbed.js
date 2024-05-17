import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { getFingerprint } from '../utils/fingerprint';

const MusescoreEmbed = ({ userId, ip, pageId, embed_link, canAccess }) => {

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

