import React, { useEffect, useState, useRef } from 'react';
import styles from './ArtistWidget.module.css';
import { FaFileDownload, FaSpotify, FaApple, FaYoutube } from 'react-icons/fa';
import YoutubeSubscribe from './YoutubeSubscribe.js';
import { supabase } from '../utils/supabase.js';
import WaveSurfer from 'wavesurfer.js';

export default function ArtistWidget_Downloader({
  artistName,
  songName,
  pdfUrl,
  songId,
  ip,
}) {
  const [recording, setRecording] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showUnlockError, setShowUnlockError] = useState(false);

  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const hasLoggedRef = useRef(false);

  /* ----------------------------------------
     RESET ERROR WHEN UNLOCKED
  ---------------------------------------- */
  useEffect(() => {
    if (unlocked) setShowUnlockError(false);
  }, [unlocked]);

  /* ----------------------------------------
     STEP 1 — Fetch random recording
  ---------------------------------------- */
  useEffect(() => {
    const fetchRandomRecording = async () => {
      const { count, error: countError } = await supabase
        .from('recordings')
        .select('*', { count: 'exact', head: true });

      if (countError || !count) return;

      const randomIndex = Math.floor(Math.random() * count);

      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .range(randomIndex, randomIndex);

      if (!error && data?.[0]) {
        setRecording(data[0]);
      }
    };

    fetchRandomRecording();
  }, []);

  /* ----------------------------------------
     STEP 2 — WaveSurfer setup
  ---------------------------------------- */
  useEffect(() => {
    if (!recording || !waveformRef.current) return;

    wavesurferRef.current?.destroy();

    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#E3963E',
      progressColor: '#E3963E',
      cursorColor: '#555',
      height: 90,
      normalize: true,
    });

    wavesurferRef.current.load(recording.recording_link);
    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));

    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [recording]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  /* ----------------------------------------
     STEP 3 — Unlock on streaming click
  ---------------------------------------- */
  const handleStreamingClick = async (platform) => {
    if (unlocked) return;

    setUnlocked(true);

    if (ip && !hasLoggedRef.current) {
      hasLoggedRef.current = true;

      await supabase.from('listen_unlocks').insert([
        {
          song_id: songId,
          unlocked: true,
          platform_clicked: platform,
          ip,
        },
      ]);
    }
  };

  /* ----------------------------------------
     FAKE CLICK (OLD BEHAVIOR)
  ---------------------------------------- */
  const handleFakeClick = (e) => {
    e.preventDefault();
    setShowUnlockError(true);
  };

  /* ----------------------------------------
     BUILD STREAMING ROWS
  ---------------------------------------- */
  const rows = recording
    ? [
        recording.spotify_link && {
          key: 'spotify',
          label: 'Spotify',
          href: recording.spotify_link,
          Icon: FaSpotify,
        },
        recording.applemusic_link && {
          key: 'apple',
          label: 'Apple Music',
          href: recording.applemusic_link,
          Icon: FaApple,
        },
        recording.youtubemusic_link && {
          key: 'youtube',
          label: 'YouTube Music',
          href: recording.youtubemusic_link,
          Icon: FaYoutube,
        },
      ].filter(Boolean)
    : [];

  return (
    <div className={styles.widgetContainer}>
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
        kind favor that <strong>blah</strong> asks of you.
      </p>

      <YoutubeSubscribe />

      <p>
        It is to sample music that <strong>blah148</strong> (this site's builder) made from 2024 to 2025, in
        large part with inspiration from the players transcribed for this project. Though,
        having said this, an imposition isn’t meant; if it’s preferred not to listen,
        that’s okay — the on-site tablature above remains available.
      </p>


      <img
        src="https://f005.backblazeb2.com/file/blah148/albums/albums_the-bell-it-shines-like-gold-blah148_500x500.png"
        alt="The Bell It Shines Like Gold — album artwork by blah148"
        style={{
          width: '100%',
          maxWidth: '220px',
          aspectRatio: '1 / 1',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'block',
          margin: '16px 0 -12px 0',
        }}
        loading="lazy"
      />

      <div className={styles.songTitle}>
        <strong>Song: {recording?.name ?? 'Loading…'}</strong>
      </div>

<br />

<strong
  style={{
    margin: '24px 0 0 0',
    textDecoration: 'underline',
    display: 'block',
  }}
>
  Step 1:
</strong>

<div>
  Tap one of the “Full Recording” buttons below. It’s a recording of{' '}
  <strong>{recording?.name ?? 'this track'}</strong> from the album{' '}
  <em>The Bell It Shines Like Gold (2025)</em>.
</div>

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

      {rows.length > 0 && (
        <table className={styles.platformTable}>
          <tbody>
            {rows.map(({ key, label, href, Icon }) => (
              <tr key={key} className={styles.platformRow}>
                <td className={styles.logoCell}>
                  <span className={styles.logoWrap}>
                    <Icon className={`${styles.logoIcon} ${styles[key]}`} />
                  </span>
                  <span className={styles.platformLabel}>{label}</span>
                </td>
                <td className={styles.actionCell}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleStreamingClick(key)}
                    className={styles.listenNowLink}
                  >
                    Full recording
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

        <strong
          style={{
            fontSize: '16px',
            color: 'black',
            textDecoration: 'underline',
            margin: '18px 0 5px 0',
          }}
        >
          Step 2:
        </strong>

        <span style={{ marginBottom: '10px' }}>
          Once the link is clicked, click the unlocked version of the button below.
        </span>

<div >
  {unlocked ? (
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
        border: 'none',
      }}
    >
      <FaFileDownload /> Download PDF
    </button>
  )}
</div>


    </div>
  );
}

