import React from 'react';
import styles from './SlowDowner.module.css';

const PlayIcon = () => (
  <svg
    id="icon"
    width="32"
    height="32"
    viewBox="0 0 32 32"
		className={styles.svgIcon}
  >
    <defs>
      <style>{`.cls-1 { fill: none; }`}</style>
    </defs>
    <path d="M7,28a1,1,0,0,1-1-1V5a1,1,0,0,1,1.4819-.8763l20,11a1,1,0,0,1,0,1.7525l-20,11A1.0005,1.0005,0,0,1,7,28Z" />
    <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="32" height="32" />
  </svg>
);

export default PlayIcon;

