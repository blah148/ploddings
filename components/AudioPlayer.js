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

    // Destroy previous instance if exists
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#F28C28',
      progressColor: '#E3963E',
      cursorColor: '#555',
      height: 120,
      responsive: true,
    });

    wavesurfer.current.load(recording.recording_link);

    // ✅ Emit progress updates every frame
    wavesurfer.current.on('audioprocess', (currentTime) => {
      window.dispatchEvent(
        new CustomEvent('waveSurfer-progress', {
          detail: { currentTime },
        })
      );
    });

    // ✅ Also emit play/pause events
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
      <div className={styles.songTitle}>
    <span className={styles.demoLabel}>
      <strong style={{ textDecoration: 'underline' }}>Step 1:</strong>
      <br />
      Tap on the 'Listen/play' button below this line, so that at least{' '}
      <span>{remaining}</span> seconds of{' '}
      <span style={{ fontWeight: '800' }}>{recording.name}</span> elapses in play-time.
    </span>
    <br />
    <span style={{ fontSize: '14px', color: 'grey', fontStyle: 'italic', fontWeight: 'normal' }}>
      Note: After that, the “Download PDF”, with a direct link to the guitar tablature, which is shown below the orange waveform, will become clickable.
    </span>
      </div>
      <button onClick={togglePlay} className={styles.playButton}>
        {isPlaying ? 'Pause' : 'Listen/play'}
      </button>

      <div ref={waveformRef} className={styles.waveform}></div>
      <div
        className={styles.songAlbum}
        onClick={() => setShowStreaming(!showStreaming)}
      >
        From the album:{' '}
        <span className={styles.albumClickable}>
          {recording.album}{' '}
          {recording.release_date
            ? `(${new Date(recording.release_date).getFullYear()})`
            : ''}
        </span>
      </div>

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

