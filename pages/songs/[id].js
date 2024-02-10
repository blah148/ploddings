// pages/songs/[id].js
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import FavoriteButton from '../../components/songFavorite';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import { fetchDataBySlug } from '../../db-utilities';
const SlowDowner = dynamic(() => import('../../components/SlowDowner'), { ssr: false });
import jwt from 'jsonwebtoken'; 
import YoutubeEmbed from '../../components/YoutubeVideo';
import YoutubeVideo from '../../components/youtubePlayerAPI';
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

export default function Song({ userId, isAuthenticated, ip, songData }) {

	const { isLoading, setIsLoading } = useLoading();
	const [threadData, setThreadData] = useState(null);

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

	useEffect(() => {
		if (userId !== null) {
			logPageVisit();
		}
	}, [userId]);

  useEffect(() => {
    const fetchThreadData = async () => {
      if (songData?.thread_id) {
        try {
          const { data, error } = await supabase
            .from('threads')
            .select('slug, name')
            .eq('id', songData.thread_id)
            .single();

          if (error) {
            throw error;
          }
          setThreadData(data);
        } catch (error) {
          console.error('Error fetching thread data:', error.message);
        }
      }
    };

    fetchThreadData();
  }, [songData?.thread_id]);

  return (
    <div>
			<Sidebar userId={userId} isAuthenticated={isAuthenticated} ip={ip} />
			<Loader isLoading={isLoading} />
      {threadData && (
        <Link href={`/threads/${threadData.slug}`}>
          Go to parent thread
        </Link>
      )}
      <h1>{songData.name}</h1>
			{threadData && <div>{threadData.name}</div>}
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
				<YoutubeVideo videoId={songData.youtube_link} />
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

	const userSession = verifyUserSession(req);
  const songData = await fetchDataBySlug('songs', params.id);
	const ip = req.connection.remoteAddress;

  return {
    props: {
      songData,
			ip,
			isAuthenticated: !!userSession,
			userId: userSession?.id || null,
    },
  };
}

