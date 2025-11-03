import React, { useEffect, useState, useRef } from 'react';
import styles from './ArtistWidget.module.css';
import AudioPlayer from './AudioPlayer.js';
import { FaFileDownload } from 'react-icons/fa';
import YoutubeSubscribe from './YoutubeSubscribe.js';

export default function ArtistWidget_Downloader({ artistName, songName, pdfUrl }) {
  const LISTEN_THRESHOLD = 120; // seconds required to unlock
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [ready, setReady] = useState(false);
  const listenedSecondsRef = useRef(new Set());
  const isPlayingRef = useRef(false);

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

  // Unlock after threshold reached
  useEffect(() => {
    if (playedSeconds >= LISTEN_THRESHOLD) setReady(true);
  }, [playedSeconds]);

  const remaining = Math.max(LISTEN_THRESHOLD - playedSeconds, 0);

  const handleFakeClick = (e) => {
    if (!ready) {
      e.preventDefault();
      alert(
        `Please listen for ${remaining} more second${remaining !== 1 ? 's' : ''}.`
      );
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
			<p>To obtain a PDF version of the tabs (shown above on this page), there's but one kind favor that <strong>blah148</strong> asks of you.</p>
      {/* YouTube Subscribe button */}
      <div className={styles.contentRow}>
        <div className={styles.leftColumn}>
          <YoutubeSubscribe />
        </div>
      </div>
			<p>It is to sample music that <strong>blah148</strong> made from 2024 to 2025, in large part with the inspiration from the players transcribed for this project. Though, having said this, an imposition isn't meant; if it's preferred not to listen, then that is okay! - the on-site, embedded tablature is still available above to use.</p>
      <div className={styles.contentRow}>
        <AudioPlayer time={LISTEN_THRESHOLD} remaining={remaining} />
      </div>

      <div
        className={styles.contentRow}
        style={{
          marginTop: '20px',
        }}
      >
        <strong
          style={{
            fontSize: '16px',
            color: 'black',
            textDecoration: 'underline',
          }}
        >
          Step 2:
        </strong>
        <span>Once the play-back time has elapsed, as part of Step 1, then click on the 'un-greyed out' version of the button that will appear below, which will open a new tab with the downloadable PDF version of the guitar tablature.</span>
        {/* ✅ Download button area pinned to bottom left */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
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

