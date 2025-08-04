// components/ArtistWidget.js
import React from 'react';
import Image from 'next/image';
import styles from './ArtistWidget.module.css';
import { FaSpotify, FaApple, FaYoutube, FaGlobe } from 'react-icons/fa';

export default function ArtistWidget() {
  return (
    <div className={styles.widgetContainer}>
      <h2 className={styles.header}><strong>About the Author</strong></h2>
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
  This is written by <a href="https://www.blah148.com" target="_blank" rel="noopener"><strong>blah148</strong></a>, a Canadian-Korean musician who has explored pre-war blues music & related topics since 2011.
</p>
          <div className={styles.linksContainer}>
            <a href="https://open.spotify.com/artist/5CfmXejuAGqUn3pK18xqV1?si=o7v6Lz0bTGmeLQYJLbEQIA" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
              <FaSpotify />
            </a>
            <a href="https://music.apple.com/artist/1738712630" target="_blank" rel="noopener noreferrer" aria-label="Apple Music">
              <FaApple />
            </a>
            <a href="https://www.blah148.com" target="_blank" aria-label="Website" rel="noopener">
              <FaGlobe />
            </a>
            <a href="https://www.youtube.com/blah148" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

