import Link from 'next/link';
import Logout from '../components/Logout';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';

export default function Home({ categories, threads, songs, blogs }) {

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
    // Save the active tab to localStorage when it changes
    if (typeof window !== 'undefined') { // Check if window is defined to avoid SSR issues
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]); // Depend on activeTab state

  // Change active tab and clear the previous tab's data to release memory
  const changeTab = (newTab) => {
    setActiveTab(newTab);
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
                  {songs.filter(song => song.category_id === category.id).map((song) => (
                    <li key={song.id}>{song.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <ul>
                  {threads.filter(thread => thread.category_id === category.id).map((thread) => (
                    <li key={thread.thread_id}>{thread.thread_name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <ul>
                  {blogs.filter(blog => blog.category_id === category.id).map((blog) => (
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

export async function getServerSideProps(context) {
  // Initialize your database or API connection here
  // Example using Supabase (make sure your Supabase client is properly initialized)

  const { data: categories } = await supabase.from('categories').select('*');
  const { data: threads } = await supabase.from('threads').select('*');
  const { data: songs } = await supabase.from('songs').select('*');
	const { data: blogs } = await supabase.from('blog').select('*');

  // Return the fetched data as props
  return {
    props: {
      categories, // Assuming your data fetching logic fills these arrays
      threads,
      songs,
			blogs
    },
  };
}

