import React from 'react';
import styles from '../styles/songs.module.css';

const LeftChevron = () => {
  return (
    <svg role="img" height="auto" width="auto" aria-hidden="true" viewBox="0 0 16 16" className={styles.svgIcon} style={{ marginBottom: 0 }}>
      <path fill="currentColor" d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"></path>
    </svg>
  );
};

export default LeftChevron;

