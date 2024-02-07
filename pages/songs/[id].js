// pages/songs/[id].js
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import FavoriteButton from '../../components/songFavorite';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import { fetchSlugsFromTable, fetchDataBySlug, getParentObject } from '../../db-utilities';
const SlowDowner = dynamic(() => import('../../components/SlowDowner'), { ssr: false });
import YoutubeEmbed from '../../components/YoutubeVideo';

export default function Song({ threadData, ip, songData }) {
	const { userId, isAuthenticated, loading } = useAuth();

	console.log('this is the ip,', ip);
	console.log('this is the isAuthenticated', isAuthenticated);

  useEffect(() => {
    if (isAuthenticated != null && songData?.id) {
      logPageVisit();
    }
  }, [userId, isAuthenticated]);

  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'songs',
        page_id: songData.id,
				page_slug: songData.slug,
				page_name: songData.name,
				isAuthenticated,
				userId,
				ip: ip,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };

  return (
    <div>
			<Sidebar userId={userId} ip={ip} />
      {songData.slug && (
        <Link href={`/threads/${threadData.slug}`}>
          Go to parent thread
        </Link>
      )}
      <h1>{songData.name}</h1>
      <div>{threadData.thread_name}</div>
      <div>{songData.id}</div>
      {songData.musescore_embed && (
        <iframe
          width="100%"
          height="480px"
          src={songData.musescore_embed}
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen">
        </iframe>
      )}
      <SlowDowner mp3={songData.dropbox_mp3_link} />
      {songData.youtube_link && (
        <YoutubeEmbed youtube_link={songData.youtube_link} />
      )}
      {songData.extra_notes && (
        <div className="extraInfo" dangerouslySetInnerHTML={{ __html: songData.extra_notes }} />
      )}
      {songData.lyrics && (
        <div className="lyrics" dangerouslySetInnerHTML={{ __html: songData.lyrics }} />
      )}

      <FavoriteButton page_name={songData.name} page_slug={songData.slug} page_type="songs" id={songData.id} userId={userId} isAuthenticated={isAuthenticated} />
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

  const songData = await fetchDataBySlug('songs', params.id);
  if (!songData) {
    return { notFound: true };
  }

	const ip = req.connection.remoteAddress;

  const threadData = await getParentObject(songData.thread_id);

  return {
    props: {
      songData,
			threadData,
			ip,
    },
  };
}

