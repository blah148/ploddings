import { supabase } from '../pages/utils/supabase';
import { useEffect, useState } from 'react';

function RelatedContent({ id }) {
  const [relatedContent, setRelatedContent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase
        .from('junction_related_content')
        .select(`
          content_id2,
          content:content_id2 (id, slug, name, thumbnail_200x200)`)
        .eq('content_id1', id);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching related content:', error.message);
      } else {
        setRelatedContent(data);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <h2>Related Content</h2>
      {relatedContent.length ? (
        <ul>
          {relatedContent.map((item) => (
            <li key={item.content_id2}>
              {item.content.name} {/* Example: Accessing the 'name' from the related content */}
              {/* You can also access 'slug', 'id', and 'thumbnail_200x200' similarly */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No related content found.</p>
      )}
    </div>
  );
}

export default RelatedContent;
