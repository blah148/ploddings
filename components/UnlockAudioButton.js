import React, { useRef, useState } from 'react';

const UnlockAudioButton = () => {
  const audioRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Function to play the audio
  const togglePlay = () => {
    setAudioEnabled(true);
    audioRef.current.play();
  };

  return (
    <>
      <audio
        ref={audioRef}
        controls
        style={{ display: 'none' }} // Use inline style to hide the audio element
        src="https://bmvuqgfxczoytjwjpvcn.supabase.co/storage/v1/object/sign/audio-hardcoded/initialize-audio.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdWRpby1oYXJkY29kZWQvaW5pdGlhbGl6ZS1hdWRpby5tcDMiLCJpYXQiOjE3MTA5MDM4NDcsImV4cCI6MjAyNjI2Mzg0N30.qYRxsYx4EiAQ62HkzI-CvQqOYR9MOHJfW4EbMcaTkKw&t=2024-03-20T03%3A05%3A23.897Z"
      >
        Your browser does not support the audio element.
      </audio>
      <button onClick={!audioEnabled ? togglePlay : undefined} style={{ opacity: audioEnabled ? 0.5 : 1 }} disabled={audioEnabled}>
        {audioEnabled ? 'Enabled' : 'Enable audio'}
      </button>
    </>
  );
};

export default UnlockAudioButton;

