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

  useEffect(() => {
    const fetchData = async () => {
      startLoading();
				const tempThreads = await fetchContentByPageType('threads');
				setThreads(tempThreads);
				const tempSongs = await fetchContentWithThreadMatch('songs');
				setSongs(tempSongs);
				const tempBlogs = await fetchContentByPageType('blog');
				setBlogs(tempBlogs);
      stopLoading();
    };
    fetchData();
  }, []);

	async function fetchContentByPageType(pageType) {
		try {
			const { data, error } = await supabase
				.from('content')
				.select('id, thread_id, page_type, name, thumbnail_200x200, featured_img_alt_text, slug')
				.eq('page_type', pageType)
				.is('thread_id', null)
				.order('name', { ascending: true});

			if (error) {
				throw error;
			}

			return data;
		} catch (error) {
			console.error('Error fetching content by page type:', error.message);
			return []; // Return an empty array in case of error
		}
	}

async function fetchContentWithThreadMatch(pageType) {
  try {
    const { data, error } = await supabase
      .rpc('fetch_content_with_thread_match', { page_type_param: pageType });

    if (error) {
      throw error;
    }
		console.log('here\'s the data', data);
    return data;
  } catch (error) {
    console.error('Error fetching content with thread match:', error.message);
    return []; // Return an empty array in case of error
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
								 <div className="categoryGroup">
								   <h2 id="songs">All songs</h2>
									 <ul>
									 {songs.map(song => (
										 <li key={song.id}>
										   <Link href={`/${song.page_type}/${song.slug}`} passHref>
											   <img src={song.thumbnail_200x200} alt={song.featured_img_alt_text}/>
											   <div>{song.name}</div>
												 <div>{song.matched_name}</div>	
												 <img src={song.matched_thumbnail} alt={`${song.matched_name} guitar portrait`}/>
											   <div className="led"></div>
										   </Link>
										 </li>
									 ))}
									 </ul>
								</div>
							  <div className="categoryGroup">
									 <h2 id="threads">All threads</h2>
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
									 <h2 id="blog">All blogs</h2>
									 <ul>
									 {blogs.map(blog => (
										 <li key={blog.id}>
										   <Link href={`/${blog.page_type}/${blog.slug}`} passHref>
											   <img src={blog.thumbnail_200x200} alt={blog.featured_img_alt_text}/>
											   <div>{blog.name}</div>
											   <div className="led"></div>
										   </Link>
										 </li>
									 ))}
									 </ul>
								 </div>
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

