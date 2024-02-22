import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useLoading } from '../../context/LoadingContext';
import styles from '../../styles/songs.module.css';

const TableDataFetcher = ({ threadId }) => {
  const [childData, setChildData] = useState([]);
	const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
			startLoading();
      try {
        const { data, error } = await supabase
          .from('content')
          .select('id, slug, name, thumbnail_200x200, featured_img_alt_text')
					.eq('thread_id', threadId);

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
    <div>
      {childData.length > 0 ? (
        <ul>
          {childData.map((item, index) => (
            <li key={item.id} className={styles.contentFeedItem}>
              <img src={item.thumbnail_200x200} alt={item.featured_img_alt_text}/>
							<div>{item.name}</div>
							<div className="led"></div>
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

