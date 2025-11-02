import React, { useState, useEffect } from 'react';
import styles from './PDFDownloadButton.module.css';

const PDFDownloadButton = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectMobile = () =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(detectMobile());
  }, []);

  const handleScrollToPDF = () => {
    const element = document.getElementById('pdf');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <button
        className={isMobile ? styles.buttonMobile : styles.button}
        onClick={handleScrollToPDF}
      >
        <svg
          className={styles.svgIcon}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.479 4.225v7.073L8.15 9.954a.538.538 0 00-.756.766l2.214 2.213a.52.52 0 00.745 0l2.198-2.203a.526.526 0 10-.745-.745l-1.287 1.308V4.225a.52.52 0 00-1.041 0z"
            fill="#fff"
          />
          <path
            d="M16.25 11.516v5.209a.52.52 0 01-.521.52H4.27a.521.521 0 01-.521-.52v-5.209a.52.52 0 10-1.042 0v5.209a1.562 1.562 0 001.563 1.562h11.458a1.562 1.562 0 001.562-1.562v-5.209a.52.52 0 10-1.041 0z"
            fill="#fff"
          />
        </svg>
        {isMobile ? 'PDF' : 'Download'}
      </button>
    </div>
  );
};

export default PDFDownloadButton;

