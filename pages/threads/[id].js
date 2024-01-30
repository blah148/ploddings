// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// Centralized location to globally manage database queries/operations
const { fetchSlugsFromTable, fetchDataBySlug, fetchChildrenByThreadId } = require('../../db-utilities');

export default function Thread({ threadData, songs, blogs }) {
  // Initializing router object, containing info about current route
  const router = useRouter();
  // Destructures the "id" parameter from the router.query property      
  const { id } = router.query;

  // State to store the response from ChatGPT
  const [gptResponse, setGptResponse] = useState('');

  useEffect(() => {
    if (id) {
      getGptResponse(id);
    }
  }, [id]);

  const getGptResponse = async (id) => {
    try {
      const response = await axios.post('../api/chatgpt', {
        prompt: `Return 100 words creating a climactic short story related to ${id}`
      });
      setGptResponse(response.data.message);
    } catch (error) {
      console.error('Error fetching GPT response:', error);
    }
  };

  // Conditional rendering while there's fetching from the db about dynamic id
  if (router.isFallback) {
    return <div>Loading...</div>;
  } 
   
  return (
    <div>
      <h1>{threadData.thread_name}</h1>
			<img src={threadData.featured_img_550px}/>
			<p>{gptResponse}</p>
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
