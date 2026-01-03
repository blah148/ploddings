import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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
     STEP 1 — Fetch ONE random recording
  ---------------------------------------- */

useEffect(() => {
  if (unlocked) {
    setShowUnlockError(false);
  }
}, [unlocked]);


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

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

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
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  /* ----------------------------------------
     STEP 3 — Unlock on streaming click
  ---------------------------------------- */
  const handleStreamingClick = async (platform) => {
    if (!unlocked) {
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
    }
  };

  /* ----------------------------------------
     STEP 4 — Build streaming table rows
  ---------------------------------------- */
  const rows = recording
    ? [
        recording.spotify_link && {
          key: 'spotify',
          label: 'Spotify',
          href: recording.spotify_link,
          Icon: FaSpotify,
          iconClass: styles.spotify,
        },
        recording.applemusic_link && {
          key: 'apple',
          label: 'Apple Music',
          href: recording.applemusic_link,
          Icon: FaApple,
          iconClass: styles.apple,
        },
        recording.youtubemusic_link && {
          key: 'youtube',
          label: 'YouTube Music',
          href: recording.youtubemusic_link,
          Icon: FaYoutube,
          iconClass: styles.youtube,
        },
      ].filter(Boolean)
    : [];

  return (
    <div className={styles.widgetContainer}>
      <h2 className={styles.header}>
        <strong>A Link to Download the PDF Tablature</strong>
      </h2>
<YoutubeSubscribe />
      <p>
Anyone making stuff nowadays (music, writing, and so on) may share a feeling that it's practically like pinching an eyedropper into the sea when releasing things. In any case, for those who wish to have a PDF of the above transcription, by clicking on one of the "Full Recording" streaming links (below) the Download PDF button (further below) will unlock, linked to the downloadable PDF sheet music at no cost.. well, other than the time to load the up the album. Once getting there, a 30-second stream would indirectly help this transcription project.
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
  decoding="async"
/>

<div className={styles.songTitle}>
  <strong>Song: {recording?.name ?? 'Loading…'}</strong>
</div>


<h3><strong>Step 1. </strong>Select one of the "Full Recording buttons"</h3>
<div>
To 'unlock' the Download PDF button (in Step 2), click one of the "Full Recording" text links below can be clicked. 
</div>

<i>Note: sorry for the hoop, but hey the tabs are free</i>


{rows.length > 0 && (
  <table className={styles.platformTable}>
    <tbody>
      {rows.map(({ key, label, href, Icon }) => (
        <tr key={key} className={styles.platformRow}>
          {/* Left: icon + label (NOT a link) */}
          <td className={styles.logoCell}>
            <span className={styles.logoWrap}>
              <Icon className={`${styles.logoIcon} ${styles[key]}`} />
            </span>
            <span className={styles.platformLabel}>{label}</span>
          </td>

          {/* Right: Listen now (ONLY link) */}
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
)
}
<h3>Step 2. Obtain the PDF sheet music</h3>
<div>
Once Step 1 is complete, then the below Download PDF button will be clickable, and you'll be able to view and save the tablature/sheet music.
</div>

<div style={{ margin: '0 0 12px 0' }}>
</div>


<div className={styles.downloadWrapper}>
  {unlocked ? (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.downloadBtn}
    >
      Download PDF
    </a>
  ) : (
    <>
      <span
        className={styles.downloadBtnLocked}
        aria-disabled="true"
        onClick={() => setShowUnlockError(true)}
      >
        Download PDF
        <span className={styles.tooltip}>
          Please click one of the “Full Recording” buttons to unlock
        </span>
      </span>

      {showUnlockError && (
        <div className={styles.unlockError}>
          Please click one of the <strong>“Full Recording”</strong> buttons above to unlock the PDF.
        </div>
      )}
    </>
  )}
</div>



    </div>
  );
}

