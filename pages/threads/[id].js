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
const { fetchDataBySlug, fetchThreadData } = require('../../db-utilities');
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

export default function Thread({ userId, ip, threadData }) {

  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_id: threadData.id,
				userId,
				ip: !userId ? ip : null,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };

	useEffect(() => {
	  logPageVisit();
	}, [userId, ip]);
	
  return (
    <div className="bodyA">
			<Sidebar userId={userId} ip={ip} />
			<div className="mainFeed">
				<h1>{threadData.name}</h1>
				<FavoriteButton userId={userId} id={threadData.id} ip={ip} />
				<ChatWithGPT initialPrompt={`who is ${threadData.name}`} />
				<div>{threadData.id}</div>
				<img src={threadData.link_3}/>
				<TableDataFetcher threadId={threadData.id} />
			</div>
    </div>
  );
} 

export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);
  const threadData = await fetchThreadData(params.id);
  
  let ip;
  // Check if `userSession` is not null before trying to access its properties
  if (userSession === null || userSession.id === null) {
    ip = req.connection.remoteAddress;
  }

  const props = {
    threadData, 
    ip,
    userId: userSession?.id || null, 
  };

  return { props };
}

