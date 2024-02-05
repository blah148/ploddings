// pages/songs/[id].js
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';
import { supabase } from '../utils/supabase'; // Adjust the import path as needed
import { fetchSlugsFromTable, fetchDataBySlug, getParentObject } from '../../db-utilities';

const SlowDowner = dynamic(() => import('../../components/SlowDowner'), { ssr: false });
import YoutubeEmbed from '../../components/YoutubeVideo';

// Verify the user's session using the JWT token
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

export default function Song({ songData, isAuthenticated, userId }) {
  const router = useRouter();
	const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!router.isFallback && songData?.id) {
      logPageVisit(isAuthenticated);
    }
  }, [router.isFallback, songData?.id]);

  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_type: 'songs',
        page_id: songData.id,
				isAuthenticated,
				userId,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
    }
  };

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

	// Function to toggle the favorite status
	const toggleFavorite = async () => {
		const action = isFavorite ? 'remove' : 'add';
		try {
			const response = await axios.post('/api/favorites', {
				userId, // Assume userId is passed as a prop from getServerSideProps
				pageId: songData.id,
				pageType: 'songs',
				action,
			});
			setIsFavorite(!isFavorite); // Toggle the local favorite state
			console.log(response.data.message); // Optional: handle response
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

  return (
    <div>
      {songData.slug && (
        <Link href={`/threads/${songData.slug}`}>
          Go to parent thread
        </Link>
      )}
      <h1>{songData.song_name}</h1>
      <div>{songData.thread_name}</div>
      <div>{songData.song_id}</div>
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
      {isAuthenticated && (
    		 <button onClick={toggleFavorite}>
        	 {isFavorite ? 'Unfavorite' : 'Favorite'}
      	 </button>
      )}
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);

  const songData = await fetchDataBySlug('songs', params.id);
  if (!songData) {
    return { notFound: true };
  }

  const additionalData = await getParentObject(songData.thread_id);

  return {
    props: {
      songData: { ...songData, ...additionalData },
      isAuthenticated: !!userSession,
			userId: userSession?.id || null,
    },
  };
}

