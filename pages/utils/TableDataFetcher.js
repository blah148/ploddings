import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useLoading } from '../../context/LoadingContext';

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
					.eq('id', threadId);

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
  }, [threadId]);

  // Directly render the fetched data within the component
  return (
    <div>
      {childData.length > 0 ? (
        <ul>
          {childData.map((item, index) => (
            <li key={item.id}>
              {item.name} - {item.slug} - {item.page_views}
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

