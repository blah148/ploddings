// components/AudioPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from '../utils/supabase';
import styles from './AudioPlayer.module.css';
import { FaSpotify, FaApple, FaYoutube, FaBandcamp } from 'react-icons/fa';

export default function AudioPlayer({ time, remaining }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState(null);
  const [showStreaming, setShowStreaming] = useState(false);

  // Fetch a random recording from Supabase
  useEffect(() => {
    const fetchRandomRecording = async () => {
      const { count, error: countError } = await supabase
        .from('recordings')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching count:', countError.message);
        return;
      }

      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count);

        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .range(randomIndex, randomIndex);

        if (error) {
          console.error('Error fetching recording:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setRecording(data[0]);
        }
      }
    };

    fetchRandomRecording();
  }, []);

  // Initialize WaveSurfer when recording is loaded
  useEffect(() => {
    if (!recording || !waveformRef.current) return;

    // Destroy any previous instance
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    // ✅ Create new WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#E3963E', // warm orange waveform
      progressColor: '#E3963E', // same as wave (no visual "progress" fill)
      cursorColor: '#555',
      height: 100,
      responsive: true,
      normalize: true,
    });

    wavesurfer.current.load(recording.recording_link);

    // ✅ Emit progress updates for unlock tracker
    wavesurfer.current.on('audioprocess', (currentTime) => {
      window.dispatchEvent(
        new CustomEvent('waveSurfer-progress', { detail: { currentTime } })
      );
    });

    wavesurfer.current.on('play', () => {
      window.dispatchEvent(new Event('waveSurfer-play'));
    });

    wavesurfer.current.on('pause', () => {
      window.dispatchEvent(new Event('waveSurfer-pause'));
    });

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [recording]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
    }
  };

  if (!recording) return <p>Loading random recording…</p>;

  return (
    <div className={styles.playerContainer}>
      {/* Step 1 Instructions */}
      <div className={styles.songTitle}>
        <span className={styles.demoLabel}>
          <strong style={{ textDecoration: 'underline' }}>Step 1:</strong>
          <br />
          Tap the <em>“Listen/play”</em> button below this line and allow at least{' '}
          <span style={{ textDecoration: 'underline', fontWeight: 600 }}>
            {remaining}
          </span>{' '}
          seconds of{' '}
          <span style={{ fontWeight: 800 }}>{recording.name}</span> to elapse in play-time.
        </span>
        <br />
        <span
          style={{
            fontSize: '14px',
            color: 'grey',
            fontStyle: 'italic',
            fontWeight: 'normal',
            opacity: 0.9,
            display: 'block',
            marginTop: '4px',
          }}
        >
          After that, the “Download PDF” button (below the orange waveform) will unlock,
          granting access to the sheet music file.
        </span>
      </div>

      {/* Play button */}
      <button onClick={togglePlay} className={styles.playButton}>
        {isPlaying ? 'Pause' : 'Listen/play'}
      </button>

      {/* Waveform */}
      <div ref={waveformRef} className={styles.waveform}></div>

      {/* Album info */}
      <div
        className={styles.songAlbum}
        onClick={() => setShowStreaming(!showStreaming)}
        style={{ marginTop: '6px' }}
      >
        From the album:{' '}
        <span
          className={styles.albumClickable}
          style={{
            cursor: 'pointer',
            color: '#2e68c0',
            textDecoration: 'underline',
          }}
        >
          {recording.album}{' '}
          {recording.release_date
            ? `(${new Date(recording.release_date).getFullYear()})`
            : ''}
        </span>
      </div>

      {/* Streaming platform icons */}
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
  );
}

