// components/ArtistWidget.js
import React from 'react';
import Image from 'next/image';
import styles from './ArtistWidget.module.css';
import { FaSpotify, FaApple, FaYoutube, FaGlobe } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import the AudioPlayer with SSR disabled
const AudioPlayer = dynamic(() => import('./AudioPlayer'), {
  ssr: false,
});

export default function ArtistWidget({ pageType }) {
  const headings = {
    blog: 'About the Author',
    about: 'About blah148',
    songs: 'About the Artist',
  };

  const bioTexts = {
    blog: (
      <>
        This blog is written by{' '}
        <a href="https://www.blah148.com" target="_blank" rel="noopener">
          <strong>blah148</strong>
        </a>{' '}
        – an Albertan musician who has been posting about acoustic blues music since 2006, and also developed this site as well as its transcriptions.
      </>
    ),
    about: (
      <>
        The person who built this site, as well as its transcriptions, is{' '}
        <a href="https://www.blah148.com" target="_blank" rel="noopener">
          <strong>blah148</strong>
        </a>{' '}
        – an Albertan musician, who has been posting about acoustic blues music since 2006.
      </>
    ),
    songs: (
      <>
        These songs are performed and transcribed by{' '}
        <a href="https://www.blah148.com" target="_blank" rel="noopener">
          <strong>blah148</strong>
        </a>{' '}
        – an Albertan guitarist and singer dedicated to acoustic blues and folk music.
        Each piece is notated with care so you can learn and play along.
      </>
    ),
  };

  return (
    <div className={styles.widgetContainer}>
      <h2 className={styles.header}>
        <strong>{headings[pageType] || headings.blog}</strong>
      </h2>
      <div className={styles.contentRow}>
        <div className={styles.leftColumn}>
          <Image
            src="https://f005.backblazeb2.com/file/blah148/profile-images/profile-image_blah148_200x200.jpeg"
            alt="blah148 profile"
            width={120}
            height={120}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.rightColumn}>
          <p className={styles.bio}>
            {bioTexts[pageType] || bioTexts.blog}
          </p>

          {/* Show AudioPlayer only on Songs page */}
          {pageType === 'songs' && (
            <div style={{ marginTop: '20px' }}>
              <AudioPlayer />
            </div>
          )}

          <div className={styles.linksContainer}>
            <a
              href="https://www.youtube.com/blah148"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
            <a
              href="https://open.spotify.com/artist/5CfmXejuAGqUn3pK18xqV1?si=o7v6Lz0bTGmeLQYJLbEQIA"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Spotify"
            >
              <FaSpotify />
            </a>
            <a
              href="https://music.apple.com/artist/1738712630"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Apple Music"
            >
              <FaApple />
            </a>
            <a
              href="https://www.blah148.com"
              target="_blank"
              aria-label="Website"
              rel="noopener"
            >
              <FaGlobe />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

