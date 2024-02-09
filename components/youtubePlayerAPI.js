import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const YouTubeVideo = ({ videoId }) => {
  const [loading, setLoading] = useState(true);

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    setLoading(false);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      <YouTube videoId={videoId} opts={opts} onReady={onReady} />
    </div>
  );
};

export default YouTubeVideo;

