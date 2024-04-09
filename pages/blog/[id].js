// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { supabase } from '../../utils/supabase'; // Adjust the import path as needed
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
import Image from 'next/image';
import TableOfContents from '../../components/TableOfContents';
import RelatedContent from '../../components/RelatedGrid_Songs';
import Dropdown from '../../components/Dropdown';
import Footer from '../../components/Footer';
import Menu from '../../components/Menu';
import styles from '../../styles/songs.module.css';
import SEO from '../../components/SEO';
import StabilizerText from '../../components/StabilizerText';
import NotificationIcon from '../../components/NotificationIcon';
import TokenAndBalance from '../../components/TokensMenuItem';

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
		<SEO
			title={blogData.name}
			image={blogData.thumbnail_200x200}
			page_type="blog"
			published_date={blogData.published_date}
			slug={blogData.slug}
			author="blah148"
		/>
    <Sidebar userId={userId} ip={ip} />
    <div className="mainFeedAll">
      <div className="feedContainer">
        <Loader isLoading={isLoading} />
        <div className="mainFeed">
          <div className="topRow">
            <IpodMenuLink threadData={threadData} fallBack='blog' />
							<div style={{display: "flex"}}>
								{userId && <TokenAndBalance userId={userId} />}
								<NotificationIcon userId={userId} />
                <Menu userId={userId} />
							</div>
          </div>
					<StabilizerText />
          <div className={styles.songNameContainer}>
            <h1>{blogData.name}</h1>
            <FavoriteButton userId={userId} id={blogData.id} ip={ip} />
          </div>
          <ParentInfoLink threadData={threadData} fallBack='blog' fallBackTitle='Guitar blog' />
          <Dropdown id={blogData.id} />
          <div>Date posted: {formatDate(blogData.published_date)}</div>
          <div className={styles.bottomBorder}></div>
          <div className={styles.componentsContainer}>
            <div className={styles.primaryColumn}>
              <div className={styles.blogBodyText} dangerouslySetInnerHTML={{ __html: updatedHtmlContent }} />
							<div className={styles.paginationBlock}>
                {blogData.sibling_previous && (<Pagination sibling_previous={blogData.sibling_previous} />)}
                {blogData.sibling_next && (<Pagination sibling_next={blogData.sibling_next} />)}
							</div>
            </div>
						<div className={styles.tocContainer}>
              <TableOfContents htmlContent={blogData.body_text} onUpdate={handleContentUpdate} />
						</div>
          </div>
        </div>
      </div>
			<Footer userId={userId} />
    </div>
  </div>
);
} 

// Export the function for use in other modules
export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);

  const forwardedFor = req.headers['x-forwarded-for'];
 	const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;

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


