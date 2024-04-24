import React, { useState, useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import styles from './PDFDownloadButton.module.css';
import { useRouter } from 'next/router'; // Import useRouter hook

const UnlockButton = ({ userId, contentId }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [message, setMessage] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); // Declare isUnlocked state
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    setIsMobile(detectMobile());
  }, []);

  const unlockContent = async () => {
    if (!userId) {
      alert('User ID is missing. You must be logged in to unlock content.');
      router.push('/account#credits'); // Navigate to account page if user is not logged in
      return;
    }

    const isConfirmed = window.confirm('Are you sure you want to unlock this song?');
    if (!isConfirmed) {
      return;
    }

    startLoading();
    setIsUnlocking(true);

    const response = await fetch('/api/unlock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, contentId }),
    });

    const data = await response.json();
    stopLoading();
    setIsUnlocking(false);

    if (data.success) {
      console.log('Content unlocked successfully');
      alert('Content unlocked successfully!');
      setIsUnlocked(true); // Update isUnlocked based on success
    } else {
      console.error('Failed to unlock content:', data.message);
      alert(`Failed to unlock content: ${data.message}`);
      setIsUnlocked(false); // Keep or update isUnlocked based on failure
    }
  };

  return (
    <div>
      <button 
        className={isMobile ? styles.buttonMobile : styles.button}
        onClick={unlockContent} 
        disabled={isUnlocking || isUnlocked} // Optionally disable button if content is already unlocked
      >
        {isMobile ? (isUnlocking ? 'Get...' : '1 Credit') : (isUnlocking ? 'Loading...' : '1 Credit')}
      </button>
    </div>
  );
};

export default UnlockButton;

