import React, { useState } from 'react';
import { useLoading } from '../context/LoadingContext';

const UnlockButton = ({ userId, contentId }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [message, setMessage] = useState('');

  const unlockContent = async () => {
    if (!userId) {
      setMessage('User ID is missing. You must be logged in to unlock content.');
      return;
    }
    
    // Add confirmation step
    const isConfirmed = window.confirm('Are you sure you want to unlock this song?');
    if (!isConfirmed) {
      // If the user cancels, do nothing more
      return;
    }

    startLoading();

    const response = await fetch('/api/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, contentId }),
    });

    const data = await response.json();
    stopLoading();

    if (data.success) {
      console.log('Content unlocked successfully');
      setMessage('Content unlocked successfully!');
      // Additional actions on success (e.g., update UI)
    } else {
      console.error('Failed to unlock content:', data.message);
      setMessage(`Failed to unlock content: ${data.message}`);
      // Handle errors (e.g., show an error message)
    }
  };

  return (
    <div>
      <button onClick={unlockContent} disabled={isLoading}>
        {isLoading ? 'Unlocking...' : 'Unlock'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UnlockButton;

