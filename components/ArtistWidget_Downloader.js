import React, { useEffect, useState, useRef } from 'react';
import styles from './ArtistWidget.module.css';
import { FaFileDownload, FaSpotify, FaApple, FaYoutube, FaBandcamp } from 'react-icons/fa';
import YoutubeSubscribe from './YoutubeSubscribe.js';
import { supabase } from '../utils/supabase.js';
import WaveSurfer from 'wavesurfer.js';

export default function ArtistWidget_Downloader({ artistName, songName, pdfUrl, songId, ip }) {
  const LISTEN_THRESHOLD = 90;
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStreaming, setShowStreaming] = useState(false); // toggle for “bell it shines like gold”
  const listenedSecondsRef = useRef(new Set());
  const isPlayingRef = useRef(false);
  const hasLoggedRef = useRef(false);
  const storageKey = `listen_progress_${songId}`;
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  // Fetch random recording
  useEffect(() => {
    const fetchRandomRecording = async () => {
      const { count, error: countError } = await supabase
        .from('recordings')
        .select('*', { count: 'exact', head: true });
      if (countError) return console.error('Error fetching count:', countError.message);
      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .range(randomIndex, randomIndex);
        if (error) return console.error('Error fetching recording:', error.message);
        if (data && data.length > 0) setRecording(data[0]);
      }
    };
    fetchRandomRecording();
  }, []);

  // WaveSurfer setup
  useEffect(() => {
    if (!recording || !waveformRef.current) return;
    if (wavesurfer.current) wavesurfer.current.destroy();
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#E3963E',
      progressColor: '#E3963E',
      cursorColor: '#555',
      height: 100,
      responsive: true,
      normalize: true,
    });
    wavesurfer.current.load(recording.recording_link);
    wavesurfer.current.on('audioprocess', (currentTime) => {
      window.dispatchEvent(
        new CustomEvent('waveSurfer-progress', { detail: { currentTime } })
      );
    });
    wavesurfer.current.on('play', () => window.dispatchEvent(new Event('waveSurfer-play')));
    wavesurfer.current.on('pause', () => window.dispatchEvent(new Event('waveSurfer-pause')));
    return () => wavesurfer.current && wavesurfer.current.destroy();
  }, [recording]);

  const togglePlay = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
    setIsPlaying(wavesurfer.current.isPlaying());
  };

  // Load / save progress
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(storageKey) || '0');
    if (stored > 0) {
      for (let i = 0; i < stored; i++) listenedSecondsRef.current.add(i);
      setPlayedSeconds(stored);
    }
  }, [storageKey]);

  useEffect(() => () => localStorage.removeItem(storageKey), [songId]);

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

  useEffect(() => localStorage.setItem(storageKey, playedSeconds), [playedSeconds, storageKey]);

  useEffect(() => {
    if (playedSeconds >= LISTEN_THRESHOLD && !hasLoggedRef.current) {
      setReady(true);
      hasLoggedRef.current = true;
      logListenUnlock(songId, playedSeconds, ip);
    }
  }, [playedSeconds]);

  const remaining = Math.max(LISTEN_THRESHOLD - playedSeconds, 0);

  const logListenUnlock = async (songId, seconds_listened, ip) => {
    if (!ip) return console.warn('No IP provided — skipping unlock log.');
    try {
      const { data: existing } = await supabase
        .from('listen_unlocks')
        .select('id')
        .eq('song_id', songId)
        .eq('ip', ip)
        .maybeSingle();
      if (existing) return;
      await supabase.from('listen_unlocks').insert([
        { song_id: songId, seconds_listened, unlocked: true, ip },
      ]);
    } catch (error) {
      console.error('Error logging listen unlock:', error.message);
    }
  };

  const handleFakeClick = (e) => {
    if (!ready) {
      e.preventDefault();
      alert(`Please listen for ${remaining} more second${remaining !== 1 ? 's' : ''}.`);
    }
  };

  // Step 3 appears if unlocked or toggled
  const showStep3 = ready || showStreaming;

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
        Tap to return (up) to the embedded tabs for {songName} by {artistName}
      </a>

      <p>
        To obtain a PDF version of the tabs (shown above on this page), there’s but one
        kind favor that <strong>blah148</strong> asks of you.
      </p>

      <div className={styles.contentRow}>
        <div className={styles.leftColumn}>
          <YoutubeSubscribe />
        </div>
      </div>

      <p>
        It is to sample music that <strong>blah148</strong> made from 2024 to 2025, in
        large part with inspiration from the players transcribed for this project. Though,
        having said this, an imposition isn’t meant; if it’s preferred not to listen,
        that’s okay — the on-site tablature above remains available.
      </p>

      {/* Step 1 */}
      <div className={styles.contentRow}>
        {!recording ? (
          <p>Loading random recording…</p>
        ) : (
          <div className={styles.playerContainer}>
            <div className={styles.songTitle}>
              <span className={styles.demoLabel}>
                <strong style={{ textDecoration: 'underline' }}>Step 1:</strong>
                <br />
                Tap the <em>“Listen/play”</em> button and allow at least{' '}
                <span style={{ textDecoration: 'underline', fontWeight: 600 }}>
                  {remaining}
                </span>{' '}
                seconds of{' '}
                <span style={{ fontWeight: 800 }}>{recording.name} as recorded by blah148</span> to elapse.
              </span>
              <br />
              <span
                style={{
                  fontSize: '14px',
                  color: 'grey',
                  fontStyle: 'italic',
                  opacity: 0.9,
                  display: 'block',
                  marginTop: '4px',
                }}
              >
                After that, the “Download PDF” button unlocks.
              </span>
            </div>

            <button onClick={togglePlay} className={styles.playButton}>
              {isPlaying ? 'Pause' : 'Listen/play'}
            </button>

            <div ref={waveformRef} style={{ width: '100%', marginBottom: '8px' }}></div>

            {/* “Bell It Shines Like Gold” toggle */}
            <div
              onClick={() => setShowStreaming(!showStreaming)}
              style={{
                cursor: 'pointer',
                color: '#2e68c0',
                textDecoration: 'underline',
                marginTop: '4px',
              }}
            >
              From the album: The Bell It Shines Like Gold (2025)
            </div>

            {/* Streaming platform links */}
            {showStreaming && (
              <div className={styles.streamingIcons}>
                <a
                  href="https://www.youtube.com/blah148"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.icon} ${styles.youtube}`}
                >
                  <FaYoutube />
                </a>
                <a
                  href="https://open.spotify.com/artist/5CfmXejuAGqUn3pK18xqV1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.icon} ${styles.spotify}`}
                >
                  <FaSpotify />
                </a>
                <a
                  href="https://music.apple.com/artist/1738712630"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.icon} ${styles.apple}`}
                >
                  <FaApple />
                </a>
                <a
                  href="https://blah148.bandcamp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.icon} ${styles.bandcamp}`}
                >
                  <FaBandcamp />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div
        className={styles.contentRow}
        style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'flex-start' }}
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
          Once playback time elapses, click the unlocked button below.
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
              style={{
                background: '#2e68c0',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <FaFileDownload /> Download PDF
            </a>
          ) : (
            <button
              onClick={handleFakeClick}
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
                opacity: 0.8,
                cursor: 'not-allowed',
              }}
            >
              <FaFileDownload /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Step 3: visible when toggled or unlocked */}
      {showStep3 && (
        <div
          className={styles.contentRow}
          style={{
            marginTop: '30px',
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
            Step 3 (optional):
          </strong>
          <span style={{ marginBottom: '10px' }}>
            Perhaps listen to the other traditional folk & blues tracks from the 2025 album "the Bell It Shines Like Gold" by blah148. It was intended to be recorded in a traditional 'field recording'-like style.
 
          </span>
          <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 0 0' }}>
            <iframe
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/album/7d8NpGwxV9OS0evVmLU2VE?utm_source=generator"
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

