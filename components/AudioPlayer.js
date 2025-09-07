// components/AudioPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from '../utils/supabase'; // adjust path if needed
import styles from './AudioPlayer.module.css';

export default function AudioPlayer() {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState(null);

  // Fetch a random recording from Supabase
  useEffect(() => {
    const fetchRandomRecording = async () => {
      console.log('Fetching row count from recordings…');
      const { count, error: countError } = await supabase
        .from('recordings')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching count:', countError.message);
        return;
      }

      console.log('Row count:', count);

      if (count && count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        console.log('Random index chosen:', randomIndex);

        const { data, error } = await supabase
          .from('recordings')
          .select('*')
          .range(randomIndex, randomIndex);

        if (error) {
          console.error('Error fetching recording:', error.message);
          return;
        }

        console.log('Fetched recording data:', data);

        if (data && data.length > 0) {
          console.log('Loaded random recording:', data[0]);
          setRecording(data[0]);
        } else {
          console.warn('No data returned from Supabase query.');
        }
      } else {
        console.warn('No rows found in recordings table.');
      }
    };

    fetchRandomRecording();
  }, []);

  // Initialize WaveSurfer when recording is loaded
  useEffect(() => {
    if (!recording || !waveformRef.current) return;

    console.log('Initializing WaveSurfer for recording:', recording);

    // Destroy old instance if exists
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

    wavesurfer.current.on('ready', () => {
      console.log('WaveSurfer ready, duration:', wavesurfer.current.getDuration());
    });

    wavesurfer.current.on('error', (err) => {
      console.error('WaveSurfer error:', err);
    });

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        console.log('WaveSurfer destroyed.');
      }
    };
  }, [recording]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
      console.log('Toggled play. Now playing:', wavesurfer.current.isPlaying());
    }
  };

  if (!recording) return <p>Loading random recording…</p>;

  return (
    <div className={styles.playerContainer}>
      <div ref={waveformRef} className={styles.waveform}></div>

      <div className={styles.controls}>
        <button onClick={togglePlay} className={styles.playButton}>
          {isPlaying ? 'Pause ⏸' : 'Play ▶️'}
        </button>
      </div>

      <div className={styles.songTitle}>{recording.name}</div>
      <div className={styles.songArtist}>
        {recording.credits || 'Unknown Artist'}
      </div>
    </div>
  );
}

