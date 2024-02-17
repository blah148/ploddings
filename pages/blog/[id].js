// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
import { fetchSlugsFromTable, fetchDataBySlug, getParentObject } from '../../db-utilities';
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';
import FavoriteButton from '../../components/songFavorite';


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

export default function Blog({ blogData, isAuthenticated, userId }) {

	const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		if (!router.isFallback && blogData?.id) {
			logPageVisit(isAuthenticated);
		} else {
			console.log('Did not log page visit:', router.isFallback, threadData?.thread_id);
		}
	}, []);
		
  // Function to log the page visit
  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'blog',
        page_id: blogData.id,
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
				pageId: blogData.id,
				pageType: 'blog',
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
      <h1>{blogData.name}</h1>
			<div>{blogData.id}</div>
			<img src={blogData.featured_img}/>
			<FavoriteButton page_type="blog" id={blogData.id} userId={userId} ip={ip} />

      {isAuthenticated && (
        <button onClick={toggleFavorite}>
          {isFavorite ? 'Unfavorite' : 'Favorite'}
         </button>
      )}
    </div>
  );
} 

// Export the function for use in other modules
export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);

  const blogData = await fetchDataBySlug('blog', params.id);
  if (!blogData) {
    return { notFound: true };
  }

  const additionalData = await getParentObject(blogData.thread_id);

  return {
    props: {
      blogData: { ...blogData, ...additionalData },
      isAuthenticated: !!userSession,
      userId: userSession?.id || null,
    },
  };
}


