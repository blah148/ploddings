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
          content:content_id2 (id, page_type, slug, name, thumbnail_200x200)`)
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

	// Function to determine class name based on page type
	function getLedClassName(pageType) {
		switch (pageType.toLowerCase()) {
			case 'songs': return "songsLed";
			case 'threads': return "threadsLed";
			case 'blog': return "blogLed";
			default: return '';
		}
	}
	
	return (
		<div>
			{relatedContent.length && (
				<ul className="contentFeed">
					{relatedContent.map((item) => (
						<li key={item.content.id}>
							<a className="listLink" href={`/${item.content.page_type}/${item.content.slug}`}>
								<img
									className="sidebarThumbnail"
									src={item.content.thumbnail_200x200 ? item.content.thumbnail_200x200 : 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp'}
									alt={item.content.featured_img_alt_text}
								/>
								<div className="sidebarName">{item.content.name.length > 50 ? item.content.name.slice(0, 26) + '...' : item.content.name}</div>
								<div className={`led ${getLedClassName(item.content.page_type)}`}></div>
							</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);

}

export default RelatedContent;
