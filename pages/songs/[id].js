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
import SlowDownerComponent from '../../components/slowDownerComponent';
import TabsComponent from '../../components/extraNotesTabs';
import styles from '../../styles/songs.module.css';
import IpodMenuLink from '../../components/ParentBackLink';
import ParentInfoLink from '../../components/ParentInfoLink';
import RelatedContent from '../../components/RelatedGrid_Songs';
import TuningDetails from '../../components/TuningButton';
import Menu from '../../components/Menu';
import Footer from '../../components/Footer';

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
    <div className="mainFeedAll">
      <div className="feedContainer">
        <Loader isLoading={isLoading} />
        <div className="mainFeed">
          <div className="topRow">
            <IpodMenuLink threadData={threadData} fallBack='/' />
            <Menu userId={userId} />
          </div>
          <div className={styles.songNameContainer}>
            <h1>{songData.name}</h1>
            <FavoriteButton userId={userId} id={songData.id} ip={ip} />
          </div>
          <ParentInfoLink threadData={threadData} fallBack='/' />
          <TuningDetails tuning_id={songData.tuning} />
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
          <SlowDownerComponent dropbox_mp3_link={songData.link_1} />
          {(songData.body_text || songData.lyrics || songData.tuning) && (
            <TabsComponent extra_notes={songData.body_text} song_lyrics={songData.lyrics} youtube_link={songData.link_2} />
          )}
          <RelatedContent id={songData.id} />
        </div>
      </div>
      <Footer userId={userId} />
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

