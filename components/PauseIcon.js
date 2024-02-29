import React from 'react';
import styles from './SlowDowner.module.css';

const PauseIcon = () => (
  <svg
    id="icon"
    width="32"
    height="32"
    viewBox="0 0 32 32"
		className={styles.svgIcon}
  >
    <defs>
      <style>{`.cls-1{fill:none;}`}</style>
    </defs>
    <path d="M12,6H10A2,2,0,0,0,8,8V24a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2Z" />
    <path d="M22,6H20a2,2,0,0,0-2,2V24a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2Z" />
    <rect
      id="_Transparent_Rectangle_"
      data-name="&lt;Transparent Rectangle&gt;"
      className="cls-1"
      width="32"
      height="32"
    />
  </svg>
);

export default PauseIcon;

