// Access to: pathname, query, asPath, route
import axios from 'axios';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Typed from 'typed.js';
import FavoriteButton from '../../components/songFavorite';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
const { fetchSlugsFromTable, fetchDataBySlug, fetchChildrenByThreadId } = require('../../db-utilities');

export default function Thread({ ip, threadData, songs, blogs }) {

	const { userId, isAuthenticated, loading } = useAuth();

	useEffect(() => {
		if (userId != null && threadData?.id) {
			logPageVisit();
		}
	}, [userId]);
		
  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'threads',
        page_id: threadData.id,
				page_slug: threadData.slug,
				page_name: threadData.name,
				isAuthenticated,
				userId,
				ip: !isAuthenticated ? ip : undefined,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };
	
  return (
    <div>
			<Sidebar userId={userId} ip={ip} />
      <h1>{threadData.name}</h1>
			<ChatWithGPT initialPrompt={`who is ${threadData.name}`} />
			<div>{threadData.id}</div>
			<img src={threadData.featured_img_550px}/>
      <ul>
        {songs.map(song => (
          <li className="song_list-item" key={song.id}>{song.song_name} - {song.slug}</li>
        ))}
				{blogs.map(blog => (
          <li className="blog_list-item" key={blog.id}>{blog.blog_name} - {blog.slug}</li>
        ))}
      </ul>
        <FavoriteButton page_name={threadData.name} page_slug={threadData.slug} page_type="threads" id={threadData.id} userId={userId} isAuthenticated={isAuthenticated} />

    </div>
  );
} 

export async function getServerSideProps({ params, req }) {

  // Fetch the thread data based on the slug
  const threadData = await fetchDataBySlug('threads', params.id);

  // Extract the client's IP address from the request object
  const ip = req.connection.remoteAddress;

  // Fetch the songs related to the thread
  const songs = await fetchChildrenByThreadId('songs', params.id);

  // Fetch the blogs related to the thread
  const blogs = await fetchChildrenByThreadId('blog', params.id);

  // Check if threadData exists to handle not found case
  if (!threadData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      threadData,
      songs,
      blogs,
			ip,
    },
  };
}

