// pages/threads/[id]
import axios from 'axios';
import React, { useEffect, useState, createContext, useContext } from 'react';
import TableDataFetcher from '../utils/TableDataFetcher';
import Sidebar from '../../components/Sidebar';
import Typed from 'typed.js';
import FavoriteButton from '../../components/songFavorite';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import ChatWithGPT from '../../components/ChatWithGPT.js';
import jwt from 'jsonwebtoken';
const { fetchDataBySlug } = require('../../db-utilities');
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';

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

export default function Thread({ userId, isAuthenticated, ip, threadData }) {

	const { isLoading, setIsLoading } = useLoading();

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

	useEffect(() => {
		if (userId !== null) {
			console.log('the userId', userId);
			logPageVisit();
		}
	}, [userId]);
	
  return (
    <div>
			<Sidebar userId={userId} isAuthenticated={isAuthenticated} ip={ip} />
      <h1>{threadData.name}</h1>
			<ChatWithGPT initialPrompt={`who is ${threadData.name}`} />
			<div>{threadData.id}</div>
			<img src={threadData.featured_img_550px}/>
			<TableDataFetcher tableName={threadData.child_type} threadId={threadData.id} />
      <FavoriteButton page_name={threadData.name} page_slug={threadData.slug} page_type="threads" id={threadData.id} userId={userId} isAuthenticated={isAuthenticated} />

    </div>
  );
} 

export async function getServerSideProps({ params, req }) {

	const userSession = verifyUserSession(req);
  const threadData = await fetchDataBySlug('threads', params.id);
  const ip = req.connection.remoteAddress;

  const props = { 
		threadData, 
		isAuthenticated: !!userSession, 
		ip, 
		userId: userSession?.id || null, 
	};

  return { props };
}

