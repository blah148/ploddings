import React, { useState, useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import styles from './PDFDownloadButton.module.css';
import { useRouter } from 'next/router';

const PDFDownloadButton_SignupFirst = ({ pdfUrl, songName }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    setIsMobile(detectMobile());
  }, []);

  const buttonClick = async () => {
    const email = prompt(`Please enter your email address to receive the PDF tablature for ${songName}:`);
    if (email) {
      startLoading();

      try {
        // Call your API to send the email with the PDF
        const response = await fetch('/api/send-pdf_create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, pdfUrl, songName }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('PDF sent successfully. Check your email (and spam folder)!');
        } else {
          alert('Failed to send PDF.');
        }
      } catch (error) {
        alert('An error occurred.');
      } finally {
        stopLoading();
      }
    } else {
     // alert('Email is required to receive the PDF.');
    }

  };

  return (
    <div>
      <button 
        className={isMobile ? styles.buttonMobile : styles.button}
        onClick={buttonClick}
        disabled={isLoading}
      >
        {isMobile ? 'PDF' : 'Download'}
      </button>
    </div>
  );
};

export default PDFDownloadButton_SignupFirst;

