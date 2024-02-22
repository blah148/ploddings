import Link from 'next/link';
import Logout from '../components/Logout';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';
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
			.select('id, name');

		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
			return;
		}

		const categoriesWithChildren = await Promise.all(categoriesData.map(async (category) => {
			const { data: contentItems = [] } = await supabase
				.from('content')
				.select(`
					id,
					name,
					slug,
					page_type,
					tuning,
					thumbnail_200x200,
					featured_img_alt_text
				`)
				.eq('category_id', category.id);

			return { ...category, contentItems };
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
      .from('content')
      .select('id, name, slug, thumbnail_200x200, featured_img_alt_text');

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
      .from('content')
      .select('id, name, slug, tuning, featured_img_alt_text, thumbnail_200x200');

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

    <div className="bodyA">
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeedAll">
			  <Loader isLoading={isLoading} />
				<div>
					<button onClick={() => changeTab('categories')}>Categories</button>
					<button onClick={() => changeTab('threads')}>Threads</button>
					<button onClick={() => changeTab('songs')}>Songs</button>
				</div>
     </div> 
      {activeTab === 'categories' && (
				 <div>
				</div>
      )}
      
      {activeTab === 'threads' && (
        <div>
          <h2>Threads Feed</h2>
          <ul>
          </ul>
        </div>
      )}
      
      {activeTab === 'songs' && (
        <div>
          <h2>Songs Feed</h2>
          <ul>
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
      userId: userSession?.id || null,
    },
  };
}

