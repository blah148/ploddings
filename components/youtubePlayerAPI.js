import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useLoading } from '../context/LoadingContext';

const YouTubeVideo = ({ videoId }) => {
	const { isLoading, startLoading, stopLoading } = useLoading();

  // Check if the videoId contains "youtube.com"
  const isYouTubeLink = videoId.includes("youtube.com");
	
	var slicedLink = videoId.substring("https://www.youtube.com/watch?v=".length);
	var finishedLink = slicedLink.split('&')[0];

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

	useEffect(() => {
		if (isYouTubeLink) {
			startLoading(); // Set isLoading to true only if it's a YouTube video
		}
	}, [isYouTubeLink]);

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    stopLoading();
  };

  return (
    <div>
      {isYouTubeLink ? (
        <YouTube videoId={finishedLink} opts={opts} onReady={onReady} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: videoId }} />
      )}
    </div>
  );
};

export default YouTubeVideo;

