// pages/songs/[id].js
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import FavoriteButton from '../../components/songFavorite';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import { fetchSongData, getParentObject } from '../../db-utilities';
import jwt from 'jsonwebtoken'; 
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';
import LazyLoadedDiv from '../../components/relatedContentGrid';
import DivSwitcher from '../../components/slowDownerAndYoutubeVideo';
import TabsComponent from '../../components/extraNotesTabs';
import styles from '../../styles/bodyA.module.css';
import ParentInfoLink from '../../components/ParentInfoLink';
import RelatedContent from '../../components/RelatedGrid_Songs';

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

export default function Song({ userId, ip, threadData, songData }) {

	const { isLoading, startLoading, stopLoading } = useLoading();

	const logPageVisit = async () => {
		try {
			await axios.post('/api/log-visit', {
				page_id: songData.id,
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
				<Loader isLoading={isLoading} />
				{threadData && (
					<Link href={`/threads/${threadData.slug}`}>
						Go to parent thread
					</Link>
				)}
				<h1>{songData.name}</h1>
				<RelatedContent id={songData.id} />
				<ParentInfoLink threadData={threadData} fallBack='/' />
				<div>{songData.id}</div>
				<FavoriteButton userId={userId} id={songData.id} ip={ip} />
				{songData.link_3 && (
					<iframe
						width="100%"
						height="480px"
						src={songData.link_3}
						frameBorder="0"
						allowFullScreen
						allow="autoplay; fullscreen">
					</iframe>
				)}
				<DivSwitcher dropbox_mp3_link={songData.link_1} youtube_link={songData.link_2} />
				{(songData.body_text || songData.lyrics || songData.tuning) && (
					<TabsComponent extra_notes={songData.body_text} song_lyrics={songData.lyrics} tuning={songData.tuning} />
				)}
				<LazyLoadedDiv page_type="songs" category_id={songData.category_id} currentSongId = {songData.id} />
			</div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

	const userSession = verifyUserSession(req);
  const songData = await fetchSongData(params.id);
	const threadData = await getParentObject(songData.thread_id);
	const ip = req.connection.remoteAddress;

  return {
    props: {
      songData,
			threadData,
			ip,
			userId: userSession?.id || null,
    },
  };
}

