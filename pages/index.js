import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';
import jwt from 'jsonwebtoken';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

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

export default function Home({ userId, ip }) {

  const [categories, setCategories] = useState([]);
	const { isLoading, startLoading, stopLoading } = useLoading();

useEffect(() => {
  const fetchDataForTab = async () => { // Added function name
    startLoading();
    await FetchContentByCategory();
    stopLoading();
  };
  fetchDataForTab();
}, []);

	async function FetchContentByCategory() {
		try {
			// Perform a query that joins 'categories' and 'content' tables on the 'id' and 'category_id' fields, respectively.
			const { data, error } = await supabase
				.from('categories')
				.select('id, name, content!inner(category_id, id, name, page_type, thumbnail_200x200, featured_img_alt_text, slug)')
				.order('name', { foreignTable: 'content', ascending: true });

			if (error) throw error;

			// The result will be an array of categories, each with a 'content' array containing the content items belonging to that category.
			setCategories(data);
			return data;
		} catch (error) {
			console.error('Error fetching content by category:', error.message);
			return [];
		}
	}

  return (

    <div className="bodyA">
			 <Sidebar userId={userId} ip={ip} />
			 <div className="mainFeedAll">
				 <div className="feedContainer">
					 <Loader isLoading={isLoading} />
					 <div className="mainFeed">
						 <div className="topRow">
								<Link className="homeButton mobileOnly" href="/" passHref>
									<svg role="img" height="22" width="22" aria-hidden="true" viewBox="0 0 24 24" data-encore-id="icon">
										<path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"></path>
									</svg>
									<div className="homeText">Home</div>
								</Link>
					     <Menu userId={userId} />
						 </div>
						<div className="narrowedFeedBody">
							<div className="categoriesContainer">
								{categories.map(category => ( // Iterate over categories
									<div key={category.id} className="categoryGroup">
										<h2>{category.name}</h2>
										<ul>
											{category.content && category.content.map(content => (
												<li key={content.id}>
													<Link href={`/${content.page_type}/${content.slug}`} passHref>
														<img src={content.thumbnail_200x200} alt={content.featured_img_alt_text}/>
														<div>{content.name}</div>
													</Link>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<Footer userId={userId} />
			</div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

