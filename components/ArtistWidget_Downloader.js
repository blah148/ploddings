import React, { useEffect, useState, useRef } from 'react';
import styles from './ArtistWidget.module.css';
import AudioPlayer from './AudioPlayer.js';
import { FaFileDownload } from 'react-icons/fa';
import YoutubeSubscribe from './YoutubeSubscribe.js';
import { supabase } from '../utils/supabase.js';

export default function ArtistWidget_Downloader({ artistName, songName, pdfUrl, songId, ip }) {
  const LISTEN_THRESHOLD = 90; // seconds required to unlock
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [ready, setReady] = useState(false);
  const listenedSecondsRef = useRef(new Set());
  const isPlayingRef = useRef(false);
  const hasLoggedRef = useRef(false);
  const storageKey = `listen_progress_${songId}`;

  // Load saved progress from localStorage
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(storageKey) || '0');
    if (stored > 0) {
      for (let i = 0; i < stored; i++) listenedSecondsRef.current.add(i);
      setPlayedSeconds(stored);
    }
  }, [storageKey]);

useEffect(() => {
  return () => {
    localStorage.removeItem(storageKey);
  };
}, [songId]);


  // Track WaveSurfer playback events
  useEffect(() => {
    const handleProgress = (e) => {
      const { currentTime } = e.detail || {};
      if (typeof currentTime !== 'number') return;

      const second = Math.floor(currentTime);
      if (isPlayingRef.current && !listenedSecondsRef.current.has(second)) {
        listenedSecondsRef.current.add(second);
        setPlayedSeconds(listenedSecondsRef.current.size);
      }
    };

    const handlePlay = () => (isPlayingRef.current = true);
    const handlePause = () => (isPlayingRef.current = false);

    window.addEventListener('waveSurfer-progress', handleProgress);
    window.addEventListener('waveSurfer-play', handlePlay);
    window.addEventListener('waveSurfer-pause', handlePause);

    return () => {
      window.removeEventListener('waveSurfer-progress', handleProgress);
      window.removeEventListener('waveSurfer-play', handlePlay);
      window.removeEventListener('waveSurfer-pause', handlePause);
    };
  }, []);

  // Save progress in localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, playedSeconds);
  }, [playedSeconds, storageKey]);

  // Unlock after threshold reached + log event
  useEffect(() => {
    if (playedSeconds >= LISTEN_THRESHOLD && !hasLoggedRef.current) {
      setReady(true);
      hasLoggedRef.current = true;
      logListenUnlock(songId, playedSeconds, ip);
    }
  }, [playedSeconds]);

  const remaining = Math.max(LISTEN_THRESHOLD - playedSeconds, 0);

  // Log unlock to Supabase (using passed-in IP)
  const logListenUnlock = async (songId, seconds_listened, ip) => {
    if (!ip) {
      console.warn('No IP provided — skipping unlock log.');
      return;
    }

    try {
      // Prevent duplicate logs (same IP + song)
      const { data: existing, error: selectError } = await supabase
        .from('listen_unlocks')
        .select('id')
        .eq('song_id', songId)
        .eq('ip', ip)
        .maybeSingle();

      if (selectError) throw selectError;
      if (existing) {
        console.log('Unlock already logged for this IP/song.');
        return;
      }

      const { error: insertError } = await supabase.from('listen_unlocks').insert([
        {
          song_id: songId,
          seconds_listened,
          unlocked: true,
          ip,
        },
      ]);

      if (insertError) throw insertError;
      // console.log('✅ Listen unlock logged successfully.');
    } catch (error) {
      // console.error('Error logging listen unlock:', error.message);
    }
  };

  // Prevent clicking before unlock
  const handleFakeClick = (e) => {
    if (!ready) {
      e.preventDefault();
      alert(`Please listen for ${remaining} more second${remaining !== 1 ? 's' : ''}.`);
    }
  };

  return (
    <div id="pdf" className={styles.widgetContainer}>
      <h2 className={styles.header}>
        <strong>A Link to Download the PDF Tablature</strong>
      </h2>

      <a
        href="#i"
        style={{
          color: 'grey',
          fontSize: '0.9rem',
          textDecoration: 'none',
          fontStyle: 'italic',
          display: 'block',
          marginTop: '0px',
          opacity: 0.9,
        }}
      >
        For: {songName} by {artistName}
      </a>

      <p>
        To obtain a PDF version of the tabs (shown above on this page), there’s
        but one kind favor that <strong>blah148</strong> asks of you.
      </p>

      {/* YouTube Subscribe button */}
      <div className={styles.contentRow}>
        <div className={styles.leftColumn}>
          <YoutubeSubscribe />
        </div>
      </div>

      <p>
        It is to sample music that <strong>blah148</strong> made from 2024 to
        2025, in large part with inspiration from the players transcribed for
        this project. Though, having said this, an imposition isn’t meant; if
        it’s preferred not to listen, that’s okay — the on-site tablature above
        remains available.
      </p>

      <div className={styles.contentRow}>
        <AudioPlayer time={LISTEN_THRESHOLD} remaining={remaining} />
      </div>

      <div
        className={styles.contentRow}
        style={{
          marginTop: '20px',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <strong
          style={{
            fontSize: '16px',
            color: 'black',
            textDecoration: 'underline',
            marginBottom: '5px',
          }}
        >
          Step 2:
        </strong>
        <span style={{ marginBottom: '10px' }}>
          Once the playback time has elapsed (as part of Step 1), click the
          un-greyed-out button below to open a new tab with the downloadable PDF
          version of the tablature.
        </span>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
            marginTop: '5px',
          }}
        >
          {ready ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnDownload}
              style={{
                background: '#2e68c0',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <FaFileDownload />
              Download PDF
            </a>
          ) : (
            <button
              onClick={handleFakeClick}
              className={styles.btnDownload}
              disabled
              style={{
                background: '#bfbfbf',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'none',
                border: 'none',
                opacity: 0.8,
                cursor: 'not-allowed',
              }}
            >
              <FaFileDownload />
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

