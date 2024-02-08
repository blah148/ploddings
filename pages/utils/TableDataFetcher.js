import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const TableDataFetcher = ({ tableName, threadId }) => {
  const [childData, setChildData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id, slug, name, page_views')
					.eq('thread_id', threadId);

        if (error) {
          throw error;
        }

        setChildData(data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    if (tableName, threadId) {
      fetchData();
    }
  }, [tableName, threadId]);

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

