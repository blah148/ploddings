import React, { useState } from 'react';
import SlowDownerComponent from '../components/slowDownerComponent';

export default function YoutubeDl() {
  const [url, setUrl] = useState('');
  // Add a new state variable to store the converted MP3 link
  const [mp3Link, setMp3Link] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/youtube-dl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('testing the response to the front-end', data);
        // Update the state with the converted MP3 link
        setMp3Link(data.url);
        alert('Conversion successful! Check the console for details.');
      } else {
        alert('Failed to convert the video.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form.');
    }
  };

  return (
    <div>
      <h1>YouTube to MP3 Converter</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL here"
          required
        />
        <button type="submit">Convert</button>
      </form>
      {/* Conditionally render SlowDownerComponent only if mp3Link is not empty */}
      {mp3Link && <SlowDownerComponent dropbox_mp3_link={mp3Link} />}
    </div>
  );
}

