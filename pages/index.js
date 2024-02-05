import Link from 'next/link';
import Logout from '../components/Logout';
import React, { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';

export default function Home() {

  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');

  // Effect hook to manage activeTab state with localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && savedTab !== activeTab) {
			console.log('testing this', savedTab);
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchCategoriesAndChildren();
  }, []);

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

  return (

    <div>
      <div>
        <button onClick={() => setActiveTab('categories')}>Categories</button>
        <button onClick={() => setActiveTab('threads')}>Threads</button>
        <button onClick={() => setActiveTab('songs')}>Songs</button>
      </div>
      
      {activeTab === 'categories' && (
				 <div>
					{categories.map((category) => (
						<div key={category.id}>
							<h2>{category.category_name}</h2>
							<div>
								<ul>
									{category.songs.map((song, index) => (
										<li key={song.id}>{song.name}</li>
									))}
								</ul>
							</div>
							<div>
								<ul>
									{category.threads.map((thread, index) => (
										<li key={thread.thread_id}>{thread.thread_name}</li>
									))}
								</ul>
							</div>
							<div>
								<ul>
									{category.blogs.map((blog, index) => (
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
          {/* Content for threads */}
          <h2>Threads Content</h2>
          {/* Place your threads content here */}
        </div>
      )}
      
      {activeTab === 'songs' && (
        <div>
          {/* Content for songs */}
          <h2>Songs Content</h2>
          {/* Place your songs content here */}
        </div>
      )}
    </div>
  );
}

