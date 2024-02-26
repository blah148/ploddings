// pages/index.js or any other component file
import React, { useState } from 'react';

export default function YoutubeDl() {

  const [url, setUrl] = useState('');

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
        // Handle response data, possibly the link to download the MP3
        const data = await response.json();
        console.log(data);
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
    </div>
  );
}

