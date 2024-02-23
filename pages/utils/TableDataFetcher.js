import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useLoading } from '../../context/LoadingContext';
import styles from '../../styles/songs.module.css';
import Link from 'next/link';

const TableDataFetcher = ({ threadId }) => {
  const [childData, setChildData] = useState([]);
	const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
			startLoading();
      try {
        const { data, error } = await supabase
          .from('content')
          .select('id, page_type, capo_position, slug, name, thumbnail_200x200, featured_img_alt_text')
					.eq('thread_id', threadId)
					.order('capo_position');

        if (error) {
          throw error;
        }
        setChildData(data);
				stopLoading();
      } catch (error) {
        console.error('Error fetching data:', error.message);
				stopLoading();
      }
    };

    if (threadId) {
      fetchData();
    }
  }, []);

  // Directly render the fetched data within the component
  return (
    <div className={styles.threadFeed}>
      {childData.length > 0 ? (
        <ul>
          {childData.map((item, index) => (
            <li key={item.id} className={styles.contentFeedItem}>
							<Link href={`/${item.page_type}/${item.slug}`} passHref>
                <img src={item.thumbnail_200x200} alt={item.featured_img_alt_text}/>
							  <div className={styles.feedItemTitle}>{item.name}</div>
							  <div className="led"></div>
							</Link>
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

