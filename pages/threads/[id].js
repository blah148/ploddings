// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import Typed from 'typed.js';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
const { fetchSlugsFromTable, fetchDataBySlug, fetchChildrenByThreadId } = require('../../db-utilities');

// Verify the user's session using the JWT token
const verifyUserSession = (req) => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return null; // No session
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Session valid
  } catch (error) {
    return null; // Session invalid
  }
};

export default function Thread({ threadData, songs, blogs, isAuthenticated, userId }) {

  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		if (!router.isFallback && threadData?.thread_id) {
			logPageVisit(isAuthenticated);
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
				isAuthenticated,
				userId,
      });
      // Optionally handle the response
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };
	
	// Function to toggle the favorite status
	const toggleFavorite = async () => {
		const action = isFavorite ? 'remove' : 'add';
		try {
			const response = await axios.post('/api/favorites', {
				userId,
				pageId: threadData.thread_id,
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
      {isAuthenticated && (
        <button onClick={toggleFavorite}>
          {isFavorite ? 'Unfavorite' : 'Favorite'}
         </button>
      )}
    </div>
  );
} 

export async function getServerSideProps({ params, req }) {

	const userSession = verifyUserSession(req);

  // Fetch the thread data based on the slug
  const threadData = await fetchDataBySlug('threads', params.id);

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
			isAuthenticated: !!userSession,
			userId: userSession?.id || null,
    },
  };
}

