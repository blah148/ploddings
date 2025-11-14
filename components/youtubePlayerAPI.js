import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useLoading } from '../context/LoadingContext';

const YouTubeVideo = ({ videoId }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if the videoId is a full YouTube link
  const isYouTubeLink = videoId.includes('youtube.com');
  const slicedLink = videoId.replace('https://www.youtube.com/watch?v=', '');
  const finishedLink = slicedLink.split('&')[0];

  // ✅ Dynamic sizes
  const opts = {
    width: '100%', // force full width of container
    height: isMobile ? '220' : '390', // smaller height for mobile
    playerVars: {
      autoplay: 0,
    },
  };

  useEffect(() => {
    if (isYouTubeLink) {
      startLoading();
    }
  }, [isYouTubeLink]);

  const onReady = () => {
    stopLoading();
  };

  return (
    <div
      style={{
      }}
    >
      {isYouTubeLink ? (
        <YouTube
          videoId={finishedLink}
          opts={opts}
          onReady={onReady}
          style={{
            top: 0,
            left: 0,
          }}
          iframeClassName="youtube-iframe"
        />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: videoId }} />
      )}
    </div>
  );
};

export default YouTubeVideo;

