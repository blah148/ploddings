import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../pages/utils/supabase'; // Adjust the import path as necessary
import styles from '../styles/songs.module.css';
import DownChevron from './DownChevron';
import Link from 'next/link'; // Make sure to import the Link component

function Dropdown({ id }) {
  const [isVisible, setIsVisible] = useState(false);
  const [relatedContents, setRelatedContents] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchRelatedContents = async () => {
      let { data, error } = await supabase
        .from('junction_related_content')
        .select('content_id2, content:content_id2 (id, page_type, slug, pagination_title)')
        .eq('content_id1', id);

      if (error) {
        console.error('Error fetching related content:', error.message);
      } else {
        setRelatedContents(data.map(item => item.content));
      }
    };

    if (id) {
      fetchRelatedContents();
    }
  }, [id]);

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
      {isVisible && (
        <div className={styles.dropdownContainer}>
          {relatedContents.length > 0 ? (
            relatedContents.map((content, index) => (
              <Link href={`/${content.page_type}/${content.slug}`} key={content.id} passHref>
                <a className={styles.linkStyle}>{content.pagination_title}</a> {/* Use a styled <a> tag within Link */}
              </Link>
            ))
          ) : (
            <p>No related content found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dropdown;

