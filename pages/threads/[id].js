// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Typed from 'typed.js';
import ChatWithGPT from '../../components/ChatWithGPT.js';
// Centralized location to globally manage database queries/operations
const { fetchSlugsFromTable, fetchDataBySlug, fetchChildrenByThreadId } = require('../../db-utilities');

export default function Thread({ threadData, songs, blogs }) {

  const router = useRouter();

useEffect(() => {
  if (!router.isFallback && threadData?.thread_id) {
    logPageVisit();
  } else {
    console.log('Did not log page visit:', router.isFallback, threadData?.thread_id);
  }
}, []);

  // Function to log the page visit
  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'threads',
        page_id: threadData.thread_id,
      });
      // Optionally handle the response
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };

  return (
    <div>
      <h1>{threadData.thread_name}</h1>
			<ChatWithGPT initialPrompt={`who is ${threadData.thread_name}`} />
			<div>{threadData.thread_id}</div>
			<img src={threadData.featured_img_550px}/>
      <ul>
        {songs.map(song => (
          <li key={song.id}>{song.song_name} - {song.slug}</li>
        ))}
				{blogs.map(blog => (
          <li key={blog.id}>{blog.blog_name} - {blog.slug}</li>
        ))}
      </ul>			
    </div>
  );
} 

export async function getStaticPaths() {
  // Fetch the list of slugs from your threads table
  const slugs = await fetchSlugsFromTable('threads');
  const paths = slugs.map(slug => ({
    params: { id: slug },
  }));
   
  return { paths, fallback: true };
} 

export async function getStaticProps({ params }) {
  // Fetch the thread data based on the slug
  const threadData = await fetchDataBySlug('threads', params.id);

  // Fetch the songs related to the thread
  const songs = await fetchChildrenByThreadId('songs', params.id);

	// Fetch the blogs related to the thread
	const blogs = await fetchChildrenByThreadId('blog', params.id)

  return {
    props: {
      threadData,
      songs,
			blogs,
    },
  };
}
