// pages/video.js
import React, { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';

const VideoPage = ({ videoSrc }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const videoContainer = document.getElementById('video-container');
    
    if (videoContainer) {
      const videoElement = document.createElement('video');
      videoElement.src = videoSrc;
      videoElement.controls = true;

      const handleVideoLoadStart = () => {
        startLoading();
      };

      const handleVideoLoadEnd = () => {
        stopLoading();
      };

      videoElement.addEventListener('loadstart', handleVideoLoadStart);
      videoElement.addEventListener('loadedmetadata', handleVideoLoadEnd);
      videoElement.addEventListener('error', handleVideoLoadEnd);

      videoContainer.appendChild(videoElement);

      return () => {
        videoElement.removeEventListener('loadstart', handleVideoLoadStart);
        videoElement.removeEventListener('loadedmetadata', handleVideoLoadEnd);
        videoElement.removeEventListener('error', handleVideoLoadEnd);
      };
    }
  }, [videoSrc, startLoading, stopLoading]);

  if (isLoading) {
    return null; // Return nothing while loading
  }

  return (
    <div id="video-container">
      <video width="100%" height="auto" controls>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPage;

