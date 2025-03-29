import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import useStore from '../zustandStore'; // Adjust the path as needed
import { useLoading } from '../context/LoadingContext';
import styles from './BeingWatchedMobile.module.css';
import LoadingLink from '../components/LoadingLink';

const BeingWatchedMobile = ({ userId, ip }) => {
  const { beingWatched, fetchAndSetBeingWatched } = useStore();
  const { startLoading, stopLoading } = useLoading();
  const [isDataLoaded, setDataLoaded] = useState(false);  // State to track data loading status

  useEffect(() => {
    startLoading();
    fetchAndSetBeingWatched(userId, ip)
      .then(() => setDataLoaded(true))  // Set data loaded true on successful fetch
      .catch(error => {
        console.error('Error fetching being watched data:', error);
      })
      .finally(stopLoading);
    // Empty dependency array ensures it runs only once on component mount
  }, [userId, ip, fetchAndSetBeingWatched, startLoading, stopLoading]);

  if (!isDataLoaded) {
    return null; // Render nothing while data is not yet loaded
  }

  return (
    <div className="categoryGroup mobileOnly">
      <h2>Being watched</h2>
      <ul>
        {beingWatched.length > 0 ? beingWatched.map((watch, index) => (
          <li key={watch.id} className={styles.listElement}>
            <LoadingLink className={styles.listLink} href={`/${watch.page_type}/${watch.slug}`} passHref>
              <Image 
                width={40} 
                height={40} 
                src={watch.thumbnail_200x200 ? watch.thumbnail_200x200 : 'https://example.com/default_thumbnail.webp'}
                alt={watch.featured_img_alt_text} 
              />
              <div className={styles.sidebarName}>{watch.name.length > 22 ? watch.name.slice(0, 22) + '...' : watch.name}</div>
              <div className={`led ${watch.user_active_membership ? 'unlocked' : 'locked'}`}></div>
            </LoadingLink>
          </li>
        )) : <p>No data found</p>}
      </ul>
    </div>
  );
};

export default BeingWatchedMobile;

