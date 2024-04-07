// ExitIcon.js
import React from 'react';
import styles from './StabilizerText.module.css';

const ExitIcon = ({ onClick }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" className={styles.exitIcon} onClick={onClick}>
    <defs>
      <style>{`.cls-1 { fill: none; }`}</style>
    </defs>
    <polygon points="17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16"/>
    <g id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>">
      <rect className="cls-1" width="32" height="32"/>
    </g>
  </svg>
);

export default ExitIcon;

