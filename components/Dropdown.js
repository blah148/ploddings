import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../pages/utils/supabase'; // Adjust the import path as necessary
import styles from '../styles/songs.module.css';
import DownChevron from './DownChevron';
import Link from 'next/link'; // Make sure to import the Link component
import { useRouter } from 'next/router'; // Import useRouter

function Dropdown({ id }) {
  const [isVisible, setIsVisible] = useState(false);
  const [relatedContents, setRelatedContents] = useState([]);
  const dropdownRef = useRef(null);
  const router = useRouter(); // Use useRouter to access the current route

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
		<>
    {relatedContents.length>0 && (<div ref={dropdownRef}>
      <button 
        onClick={toggleDropdown} 
        className={styles.dropdownButton}>
        <label>Chapters</label>
        <DownChevron />
      </button>
      {isVisible && (
        <div className={styles.dropdownContainer}>
          {relatedContents.length > 0 ? (
            relatedContents.map((content, index) => {
              // Construct the page's path
              const path = `/${content.page_type}/${content.slug}`;
              // Check if the current path matches the link's href
              const isCurrentPage = router.asPath == path;

              return (
                <Link href={path} key={content.id} passHref>
                  {/* Apply bold style conditionally */}
                  <div className={`${styles.linkStyle} ${isCurrentPage ? styles.boldLink : ''}`}>
										{content.pagination_title}
									</div>
                </Link>
              );
            })
          ) : (
            <p>No related content found.</p>
          )}
        </div>
      )}
    </div>)}
	</>
  );
}

export default Dropdown;

