import React, { useEffect, useState, useRef } from 'react';
import styles from './ArtistWidget.module.css';
import AudioPlayer from './AudioPlayer.js';
import { FaFileDownload } from 'react-icons/fa';
import YoutubeSubscribe from './YoutubeSubscribe.js';

export default function ArtistWidget_Downloader({ artistName, songName, pdfUrl }) {
  const LISTEN_THRESHOLD = 20; // seconds required to unlock
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
      {/* YouTube Subscribe button */}
      <div className={styles.contentRow}>
        <div className={styles.leftColumn}>
          <YoutubeSubscribe />
        </div>
      </div>

      <h2 className={styles.header}>
        <strong>A Link to Download the PDF Tablature</strong>
      </h2>
<a
  href="#i"
  style={{
    color: '#999',           // light grey tone
    fontSize: '0.9rem',      // slightly smaller than body text
    textDecoration: 'none',  // remove underline
    fontStyle: 'italic',     // gives a softer, subtext feel
    display: 'block',        // makes it occupy its own line
    marginTop: '0px',        // small spacing above
  }}
>
  For: {songName} by {artistName}
</a>

      <div className={styles.contentRow}>
        <p className={styles.bio}>
        </p>
      </div>

      <div className={styles.contentRow}>
        <AudioPlayer time={LISTEN_THRESHOLD} remaining={remaining}/>
      </div>

      <div className={styles.contentRow}>
        {!ready ? (
          <p className={styles.bio}>
            <strong>Step 2:</strong> Preparing your sheet music…
          </p>
        ) : (
          <p className={styles.bio}>
            <strong>Step 2:</strong> Your download is unlocked! Includes a subtle{' '}
            <em>Ploddings.com</em> watermark.
          </p>
        )}

        {/* ✅ Download button (locked illusion until ready) */}
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
              marginTop: '10px',
              border: 'none',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
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
              marginTop: '10px',
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
  );
}

