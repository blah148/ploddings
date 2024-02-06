// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import jwt from 'jsonwebtoken';
import Sidebar from '../../components/Sidebar';
import Typed from 'typed.js';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
const { fetchSlugsFromTable, fetchDataBySlug, fetchChildrenByThreadId } = require('../../db-utilities');

export default function Thread({ ip, threadData, songs, blogs }) {

  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);
	const { userId, isAuthenticated } = useAuth();

	useEffect(() => {
		if (!router.isFallback && threadData?.id) {
			logPageVisit(isAuthenticated);
		} else {
			console.log('Did not log page visit:', router.isFallback, threadData?.id);
		}
	}, []);
		
  // Function to log the page visit
  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'threads',
        page_id: threadData.id,
				page_slug: threadData.slug,
				page_name: threadData.name,
				isAuthenticated,
				userId,
				ip: !isAuthenticated ? ip : undefined,
      });
      // Optionally handle the response
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };
	
	const toggleFavorite = async () => {
		const action = isFavorite ? 'remove' : 'add';
		try {
			const response = await axios.post('/api/favorites', {
				userId,
				pageId: threadData.id,
				pageType: 'threads',
				action,
			});

			setIsFavorite(!isFavorite); // Toggle the local favorite state
			console.log(response.data.message); // Optional: handle response
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

  return (
    <div>
			<Sidebar userId={userId} ip={ip} />
      <h1>{threadData.name}</h1>
			<ChatWithGPT initialPrompt={`who is ${threadData.name}`} />
			<div>{threadData.id}</div>
			<img src={threadData.featured_img_550px}/>
      <ul>
        {songs.map(song => (
          <li className="song_list-item" key={song.id}>{song.song_name} - {song.slug}</li>
        ))}
				{blogs.map(blog => (
          <li className="blog_list-item" key={blog.id}>{blog.blog_name} - {blog.slug}</li>
        ))}
      </ul>			
      {isAuthenticated && (
        <button onClick={toggleFavorite}>
          {isFavorite ? 'Unfavorite' : 'Favorite'}
         </button>
      )}
    </div>
  );
} 

export async function getServerSideProps({ params, req }) {

  // Fetch the thread data based on the slug
  const threadData = await fetchDataBySlug('threads', params.id);

  // Extract the client's IP address from the request object
  const ip = req.connection.remoteAddress;
	console.log('this is the getSSP ip', ip);


  // Before fetching related songs and blogs, increment page views if threadData exists
  if (threadData) {
    try {
      const { data, error } = await supabase
        .rpc('increment_page_views', { row_id: threadData.id });
      
      if (error) {
        console.error('Error incrementing page views:', error.message);
        // Optionally handle the error, e.g., by logging or sending to an error tracking service
      }
    } catch (error) {
      console.error('Failed to call increment_page_views function:', error);
      // Handle or log the error as needed
    }
		console.log('this is the threadData.id', threadData.id);

  }

  // Fetch the songs related to the thread
  const songs = await fetchChildrenByThreadId('songs', params.id);

  // Fetch the blogs related to the thread
  const blogs = await fetchChildrenByThreadId('blog', params.id);

  // Check if threadData exists to handle not found case
  if (!threadData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      threadData,
      songs,
      blogs,
			ip,
    },
  };
}

