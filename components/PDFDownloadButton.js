import React, { useState } from 'react';

const PDFDownloadButton = ({ userId, pdfUrl, songName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendPDF = async () => {
    if (!userId || !pdfUrl) {
      setMessage('User ID or PDF URL is missing.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Call your API to send the email with the PDF
      const response = await fetch('/api/send-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pdfUrl, songName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('PDF sent successfully. Check your email (and spam folder)!');
      } else {
        setMessage(data.error || 'Failed to send PDF.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSendPDF} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'PDF download'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PDFDownloadButton;

