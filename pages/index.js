import Link from 'next/link';
import Logout from '../components/Logout';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';

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


export default function Home({ isAuthenticated, userId, ip  }) {

  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');
	const [loadedTabs, setLoadedTabs] = useState({ categories: false, threads: false, songs: false });
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
        await fetchCategoriesAndChildren();
      } else if (tab === 'threads') {
        await fetchAllThreads();
      } else if (tab === 'songs') {
        await fetchAllSongs();
      }

      stopLoading();
      setLoadedTabs(prev => ({ ...prev, [tab]: true }));
    };

    fetchDataForTab(activeTab);
  }, [activeTab, loadedTabs]);

  const fetchCategoriesAndChildren = async () => {
		
		startLoading();
    const loadingStarted = Date.now();

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, category_name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }

    const categoriesWithChildren = await Promise.all(categoriesData.map(async (category) => {

      const { data: songs } = await supabase
        .from('songs')
        .select('id, name, slug, page_views, pdf_embed, tuning')
        .eq('category_id', category.id);

      const { data: threads } = await supabase
        .from('threads')
        .select('id, name, slug, page_views, featured_img_200px, blurb')
        .eq('category_id', category.id);

      const { data: blogs } = await supabase
        .from('blog')
        .select('id, name, slug, page_views, featured_img, featured_img_alt_text')
        .eq('category_id', category.id);

      return { ...category, songs, threads, blogs };
    }));

    setCategories(categoriesWithChildren);

    const loadingDuration = Date.now() - loadingStarted;
		if (loadingDuration < minLoadingTime) {
		  setTimeout(() => stopLoading(), minLoadingTime - loadingDuration);
		} else {
			stopLoading();
		}
  };

  const fetchAllThreads = async () => {
		startLoading();
		const loadingStarted = Date.now();

    const { data: threadsData, error: threadsError } = await supabase
      .from('threads')
      .select('id, name, slug, page_views, featured_img_200px, blurb');

    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
    } else {
      setThreads(threadsData); // Set the fetched threads data to state
    }
		const loadingDuration = Date.now() - loadingStarted;
		if (loadingDuration < minLoadingTime) {
			// If the loading duration is less than the minimum, delay the loading state change
			setTimeout(() => stopLoading(), minLoadingTime - loadingDuration);
		} else {
			// If it's already been longer than the minimum, set loading to false immediately
			stopLoading();
		}
  };

  // Function to fetch all songs
  const fetchAllSongs = async () => {
		startLoading();
		const loadingStarted = Date.now();	

    const { data: songsData, error: songsError } = await supabase
      .from('songs')
      .select('id, name, slug, page_views, pdf_embed, tuning');

    if (songsError) {
      console.error('Error fetching songs:', songsError);
    } else {
      setSongs(songsData); // Set the fetched songs data to state
    }
		const loadingDuration = Date.now() - loadingStarted;
		if (loadingDuration < minLoadingTime) {
			// If the loading duration is less than the minimum, delay the loading state change
			setTimeout(() => stopLoading(), minLoadingTime - loadingDuration);
		} else {
			// If it's already been longer than the minimum, set loading to false immediately
			stopLoading();
		}

  };

  // Change active tab and clear the previous tab's data to release memory
  const changeTab = (newTab) => {
    setActiveTab(newTab);
		localStorage.setItem('activeTab', newTab);
//    if (newTab !== 'categories') setCategories([]);
//    if (newTab !== 'threads') setThreads([]);
//    if (newTab !== 'songs') setSongs([]);
  };

  return (

    <div>
			<Loader isLoading={isLoading} />
			<Logout />
      <div>
        <button onClick={() => changeTab('categories')}>Categories</button>
        <button onClick={() => changeTab('threads')}>Threads</button>
        <button onClick={() => changeTab('songs')}>Songs</button>
      </div>
      
      {activeTab === 'categories' && (
				 <div>
					{categories.map((category) => (
						<div key={category.id}>
							<h2>{category.category_name}</h2>
							<div>
								<ul>
									{category.songs.map((song) => (
										<li key={song.id}>{song.name}</li>
									))}
								</ul>
							</div>
							<div>
								<ul>
									{category.threads.map((thread) => (
										<li key={thread.id}>{thread.name}</li>
									))}
								</ul>
							</div>
							<div>
								<ul>
									{category.blogs.map((blog) => (
										<li key={blog.id}>{blog.name}</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
      )}
      
      {activeTab === 'threads' && (
        <div>
          <h2>Threads Feed</h2>
          <ul>
            {threads.map((thread) => (
              <li key={thread.id}>
                <h3>{thread.name}</h3>
                <p>{thread.slug}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {activeTab === 'songs' && (
        <div>
          <h2>Songs Feed</h2>
          <ul>
            {songs.map((song) => (
              <li key={song.id}>
                <h3>{song.name}</h3>
                <p>{song.slug}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      isAuthenticated: !!userSession,
      userId: userSession?.id || null,
    },
  };
}

