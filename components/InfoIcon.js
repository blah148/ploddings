// InfoIcon.js
import React, { useState } from 'react';
import styles from './InfoIcon.module.css';

const InfoIcon = ({ tooltipMessage }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={styles.tooltipContainer}>
      <svg
        id="icon"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
				className={styles.infoIcon}
      >
      <defs>
        <style>
          {`
            .cls-1 {
              fill: none;
            }
          `}
        </style>
      </defs>
      <polygon points="17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22"/>
      <path d="M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z"/>
      <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z"/>
      <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="32" height="32"/>
      </svg>
      {showTooltip && <div className={styles.tooltip}>{tooltipMessage}</div>}
    </div>
  );
};

export default InfoIcon;

