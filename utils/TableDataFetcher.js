import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from './supabase';
import { useLoading } from '../context/LoadingContext';
import styles from '../styles/songs.module.css';
import LoadingLink from '../components/LoadingLink';

const TableDataFetcher = ({ threadId, userId }) => {
  const [childData, setChildData] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
      try {
        const { data, error } = await supabase.rpc('fetch_content_with_unlocked_status', {
          p_thread_id: threadId,
          p_user_id: userId
        });

        if (error) {
          throw error;
        }
        setChildData(data);
        // console.log('this is the table data fetcher data', data);
        stopLoading();
      } catch (error) {
        console.error('Error fetching data:', error.message);
        stopLoading();
      }
    };

    if (threadId) {
      fetchData();
    }
  }, [threadId, userId]);

  // Directly render the fetched data within the component
  return (
    <div className="threads categoryGroup">
      {childData.length > 0 ? (
        <ul>
          {childData.map((item) => (
            <li key={item.id} className={styles.contentFeedItem}>
              <LoadingLink href={`/${item.page_type}/${item.slug}`}>
                <div className={styles.LoadingLinkContainer}>
                  <Image width={40} height={40} src={item.thumbnail_200x200} alt={item.featured_img_alt_text} />
                  <div className={styles.feedItemTitle}>
                    {typeof window !== 'undefined' && window.innerWidth <= 768 && item.name.length > 27 ? item.name.slice(0, 27) + '...' : item.name}
                  </div>
                  <div className={`led ${item.user_active_membership ? 'unlocked' : 'locked'}`}></div>
                </div>
              </LoadingLink>
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};

export default TableDataFetcher;

