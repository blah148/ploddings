// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
import { fetchBlogData, getParentObject } from '../../db-utilities';
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';
import FavoriteButton from '../../components/songFavorite';
import Sidebar from '../../components/Sidebar';
import ParentLink from '../../components/ParentBackLink';
import Link from 'next/link';

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

export default function Blog({ threadData, blogData, ip, userId }) {

	const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);

	const logPageVisit = async () => {
		try {
			await axios.post('/api/log-visit', {
				page_id: blogData.id,
				userId,
				ip: !userId ? ip : null,
			});
		} catch (error) {
			console.error('Failed to log page visit:', error);
		}
	};

	useEffect(() => {
		logPageVisit();
	}, [userId, ip]);
		
  return (
    <div className="bodyA">
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeed">
				<ParentLink page_type={threadData.page_type} parentLink={threadData.slug} />
				<h1>{blogData.name}</h1>
				<FavoriteButton userId={userId} id={blogData.id} ip={ip} />
				<div>{blogData.id}</div>
				<img src={blogData.featured_img}/>
			</div>
    </div>
  );
} 

// Export the function for use in other modules
export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);

	let ip;
	// Check if `userSession` is not null before trying to access its properties
	if (userSession === null || userSession.id === null) {
		ip = req.connection.remoteAddress;
	}

  const blogData = await fetchBlogData(params.id);
  if (!blogData) {
    return { notFound: true };
  }

  const threadData = await getParentObject(blogData.thread_id);

  return {
    props: {
      blogData,
			threadData,
			ip,
      userId: userSession?.id || null,
    },
  };
}


