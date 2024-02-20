import { supabase } from '../pages/utils/supabase';
import { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';
import styles from '../styles/songs.module.css';

function RelatedContent({ id }) {
  const [relatedContent, setRelatedContent] = useState([]);
	const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
			startLoading();
      let query = supabase
        .from('junction_related_content')
        .select(`
          content_id2,
          content:content_id2 (id, slug, name, thumbnail_200x200)`)
        .eq('content_id1', id)
				.order('content_order', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching related content:', error.message);
				stopLoading();
      } else {
        setRelatedContent(data);
				stopLoading();
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      {relatedContent.length && (
        <ul>
          {relatedContent.map((item) => (
            <li key={item.content_id2}>
              {item.content.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RelatedContent;
