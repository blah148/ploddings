import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/songs.module.css';
import DownChevron from './DownChevron';
import RelatedContent from './RelatedGrid_Songs';

function Dropdown({ id }) {
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsVisible(!isVisible);

  // Handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div ref={dropdownRef}>
      <button 
				onClick={toggleDropdown} 
				className={styles.dropdownButton}>
				<label>Chapters</label>
				<DownChevron />
			</button>
      {isVisible && <div className={styles.dropdownContainer}>
			  <RelatedContent id={id} />	
			</div>}
    </div>
  );
}

export default Dropdown;

