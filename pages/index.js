import Link from 'next/link';
import Logout from '../components/Logout';
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

export default function Home({ userId, ip  }) {

  const [categories, setCategories] = useState([]);
	const [threads, setThreads] = useState([]);
	const [songs, setSongs] = useState([]);
	const [blogs, setBlogs] = useState([]);

  const [activeTab, setActiveTab] = useState('categories');
	const [loadedTabs, setLoadedTabs] = useState({ categories: false, all: false });
	const { isLoading, startLoading, stopLoading } = useLoading();
  const minLoadingTime = 400;

  // Effect hook to manage activeTab state with localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && savedTab !== activeTab) {
      setActiveTab(savedTab);
    } else {
      // Potentially set a default tab and load its data
      setActiveTab('categories');
    }
  }, []);

  useEffect(() => {
    const fetchDataForTab = async (tab) => {
      if (loadedTabs[tab]) {
        // If the data for this tab is already loaded, do nothing
        return;
      }
      startLoading();
      if (tab === 'categories') {
				await FetchContentByCategory();
      } else if (tab === 'all') {
				const tempThreads = await fetchContentByPageType('threads');
				setThreads(tempThreads);
				const tempSongs = await fetchContentByPageType('songs');
				setSongs(tempSongs);
      }
      stopLoading();
      setLoadedTabs(prev => ({ ...prev, [tab]: true }));
    };
    fetchDataForTab(activeTab);
  }, [activeTab]);

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

	async function fetchContentByPageType(pageType) {
		try {
			const { data, error } = await supabase
				.from('content')
				.select('id, page_type, name, thumbnail_200x200, featured_img_alt_text, slug') // Select all fields, adjust as needed
				.eq('page_type', pageType); // Filter rows where page_type matches the pageType argument

			if (error) {
				throw error;
			}

			return data;
		} catch (error) {
			console.error('Error fetching content by page type:', error.message);
			return []; // Return an empty array in case of error
		}
	}

  // Change active tab and clear the previous tab's data to release memory
  const changeTab = (newTab) => {
    setActiveTab(newTab);
		localStorage.setItem('activeTab', newTab);
//    if (newTab !== 'categories') setCategories([]);
//    if (newTab !== 'threads') setThreads([]);
//    if (newTab !== 'songs') setSongs([]);
  };

  return (

    <div className="bodyA">
			 <Sidebar userId={userId} ip={ip} />
			 <div className="mainFeedAll">
				 <div className="feedContainer">
					 <Loader isLoading={isLoading} />
					 <div className="mainFeed">
						 <div className="topRow">
						   <div></div>
					     <Menu userId={userId} />
						 </div>
						 <div>
							<button onClick={() => changeTab('categories')}>Categories</button>
							<button onClick={() => changeTab('all')}>All</button>
						</div>
						<div className="categoriesContainer">
							 {activeTab === 'categories' && categories.map(category => (
									<div key={category.id} className="categoryGroup">
										<h2>{category.name}</h2>
										<ul>
										{category.content && category.content.map(content => (
											<li key={content.id}>
												<Link href={`/${content.page_type}/${content.slug}`} passHref>
													<img src={content.thumbnail_200x200} alt={content.featured_img_alt_text}/>
													<div>{content.name}</div>
													<div className="led"></div>
												</Link>
											</li>
										))}
										</ul>
									</div>
								))}
						</div>
						<div className="categoriesContainer">
							{activeTab === 'all' && (
								 <div>
									 <h2>Threads</h2>
									 <ul>
									 {threads.map(thread => (
										 <li key={thread.id}>
											 <Link href={`/${thread.page_type}/${thread.slug}`} passHref>
												 <img src={thread.thumbnail_200x200} alt={thread.featured_img_alt_text}/>
											   <div>{thread.name}</div>
												 <div className="led"></div>
											 </Link>
										 </li>
									 ))}
									 </ul>
									 <h2>Songs</h2>
									 {songs.map(song => (
										 <div key={song.id}>
											 <p>{song.name}</p>
										 </div>
									 ))}
								</div>
							)}
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

