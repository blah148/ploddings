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
import IpodMenuLink from '../../components/ParentBackLink';
import ParentInfoLink from '../../components/ParentInfoLink';
import Pagination from '../../components/Pagination';
import Link from 'next/link';
import TableOfContents from '../../components/TableOfContents';

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

// Function to format the date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

export default function Blog({ threadData, blogData, ip, userId }) {

	const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);
  const [updatedHtmlContent, setUpdatedHtmlContent] = useState(blogData.body_text);

  const handleContentUpdate = (newHtmlContent) => {
    setUpdatedHtmlContent(newHtmlContent);
  };

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

	// Function to create markup
	const createMarkup = (htmlString) => {
		return { __html: htmlString };
	};
		
  return (
    <div className="bodyA">
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeed">
				<IpodMenuLink threadData={threadData} />
				<h1>{blogData.name}</h1>
				<ParentInfoLink threadData={threadData} />
				<FavoriteButton userId={userId} id={blogData.id} ip={ip} />
				<div>Date posted: {formatDate(blogData.published_date)}</div>
				<div>{blogData.id}</div>
				<img src={blogData.featured_img}/>
        <TableOfContents htmlContent={blogData.body_text} onUpdate={handleContentUpdate} />
        <div dangerouslySetInnerHTML={{ __html: updatedHtmlContent }} />
				<Pagination sibling_previous={blogData.sibling_previous} sibling_next={blogData.sibling_next} />
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


