import React, { useEffect, useRef, useState } from 'react';
import Loader from './Loader';
import { supabase } from '../utils/supabase'; // Import Supabase client
import { useLoading } from '../context/LoadingContext';

const LazyLoadedDiv = ({ page_type, category_id, currentSongId = null }) => {
  const [isIntersecting, setIntersecting] = useState(false);
	const { isLoading, startLoading, stopLoading } = useLoading();
	const [songs, setSongs] = useState([]);
  const targetRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(targetRef.current);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Adjust as needed
      }
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, []);

  const fetchItemsFromDatabase = async () => {
		startLoading();
    try {
      const { data: songs, error } = await supabase
        .from(page_type)
        .select('id, name, slug, page_views, pdf_embed, tuning')
        .eq('category_id', category_id)
        .neq('id', currentSongId); // Exclude currentSongId from the query

      if (error) {
        throw error;
      }
     	setSongs(songs); 
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
			stopLoading();
    }
  };

  useEffect(() => {
    if (isIntersecting) {
      fetchItemsFromDatabase();
    }
  }, [isIntersecting]);

	return (
		<div ref={targetRef}>
			{isLoading ? (
				<Loader />
			) : isIntersecting && (
				<div>
					{songs.map(song => (
						<div key={song.id}>
							<p>ID: {song.id}</p>
							<p>Name: {song.name}</p>
							<p>Slug: {song.slug}</p>
							<p>Page Views: {song.page_views}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);

};

export default LazyLoadedDiv;

