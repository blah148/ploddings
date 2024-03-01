import React from 'react';
import styles from './Loader.module.css';

function Loader({ isLoading }) {
  return (
		<div className={styles.positionSticky}>
    <div className={styles.loaderContainer}>
      {isLoading && (
        <div className={styles.ldsEllipsis}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
    </div>
	</div>
  );
	
}

export default Loader;

