// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // Correctly import dynamic
import React, { useEffect, useState } from 'react';
const SlowDowner = dynamic(() => import('../../components/SlowDowner'), { ssr: false });

// Centralized location to globally manage database queries/operations
const { fetchSlugsFromTable, fetchDataBySlug, getParentObject } = require('../../db-utilities');

export default function Song({ songData }) {
  // Initializing router object, containing info about current route
  const router = useRouter();
	// Destructures the "id" parameter from the router.query property      
  const { id } = router.query;
	
	// Conditional rendering while there's fetching from the db about dynamic id
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Link to the thread */}
      {songData.slug && (
        <Link href={`/threads/${songData.slug}`}>
          Go to parent thread
        </Link>
			)}
			<h1>{songData.song_name}</h1>
			<div>{songData.thread_name}</div>
			{songData.musescore_embed && (
					<iframe
						width="100%"
						height="480px"
						src={songData.musescore_embed}
						frameBorder="0"
						allowFullScreen
						allow="autoplay; fullscreen">
					</iframe>   
				)}
			<SlowDowner mp3={songData.dropbox_mp3_link} />
    </div>
  );
}

export async function getStaticPaths() {
  // Fetch the list of slugs from your songs table
  const slugs = await fetchSlugsFromTable('songs');
  const paths = slugs.map(slug => ({
    params: { id: slug },
  }));

  return { paths, fallback: true };
}


export async function getStaticProps({ params }) {
  // Fetch the song data based on the slug
  const songData = await fetchDataBySlug('songs', params.id);

  if (!songData) {
    return { notFound: true };
  }

  // Fetch parent object data
  const {thread_name, featured_img_alt_text, featured_img_200px, slug} = await getParentObject(songData.thread_id);

  return { 
    props: { 
      songData: { ...songData, thread_name, featured_img_alt_text, featured_img_200px, slug } 
    } 
  };
}
