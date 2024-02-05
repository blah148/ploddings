import Link from 'next/link';
import Logout from '../components/Logout';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';

export default function Home() {

  const [categories, setCategories] = useState([]);
  const [threads, setThreads] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');

  // Effect hook to manage activeTab state with localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && savedTab !== activeTab) {
			console.log('testing this', savedTab);
      setActiveTab(savedTab);
    }
  }, []);

  // Fetch data for the active tab only
  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategoriesAndChildren();
    } else if (activeTab === 'threads') {
      fetchAllThreads();
    } else if (activeTab === 'songs') {
      fetchAllSongs();
    }

    // Save the active tab to localStorage when it changes
    if (typeof window !== 'undefined') { // Check if window is defined to avoid SSR issues
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]); // Depend on activeTab state


  const fetchCategoriesAndChildren = async () => {
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
        .select('id, name, slug')
        .eq('category_id', category.id);

      const { data: threads } = await supabase
        .from('threads')
        .select('thread_id, thread_name, slug')
        .eq('category_id', category.id);

      const { data: blogs } = await supabase
        .from('blog')
        .select('id, name, slug')
        .eq('category_id', category.id);

      return { ...category, songs, threads, blogs };
    }));

    setCategories(categoriesWithChildren);
  };

  const fetchAllThreads = async () => {
    const { data: threadsData, error: threadsError } = await supabase
      .from('threads')
      .select('thread_name, slug');

    if (threadsError) {
      console.error('Error fetching threads:', threadsError);
    } else {
      setThreads(threadsData); // Set the fetched threads data to state
    }
  };

  // Function to fetch all songs
  const fetchAllSongs = async () => {
    const { data: songsData, error: songsError } = await supabase
      .from('songs')
      .select('name, slug');

    if (songsError) {
      console.error('Error fetching songs:', songsError);
    } else {
      setSongs(songsData); // Set the fetched songs data to state
    }
  };

  // Change active tab and clear the previous tab's data to release memory
  const changeTab = (newTab) => {
    setActiveTab(newTab);
    if (newTab !== 'categories') setCategories([]);
    if (newTab !== 'threads') setThreads([]);
    if (newTab !== 'songs') setSongs([]);
  };

  return (

    <div>
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
										<li key={thread.thread_id}>{thread.thread_name}</li>
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
              <li key={thread.thread_id}>
                <h3>{thread.thread_name}</h3>
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

