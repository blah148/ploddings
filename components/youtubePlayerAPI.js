import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useLoading } from '../context/LoadingContext';

const YouTubeVideo = ({ videoId }) => {
	const { isLoading, setIsLoading } = useLoading();
	
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
    setIsLoading(true); // Set isLoading to true when the component mounts
  }, []);

  const onReady = (event) => {
    // Access to player in all event handlers via event.target
    setIsLoading(false);
  };

  return (
    <div>
      <YouTube videoId={finishedLink} opts={opts} onReady={onReady} />
    </div>
  );
};

export default YouTubeVideo;

