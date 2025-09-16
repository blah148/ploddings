// components/ArtistWidget.js
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ArtistWidget.module.css';
import { FaSpotify, FaApple, FaYoutube, FaBandcamp } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer.js';
import YoutubeSubscribe from './YoutubeSubscribe';

export default function ArtistWidget({ pageType }) {
  const [showLinks, setShowLinks] = useState(false);

  const headings = {
    blog: 'About the author',
    about: 'About blah148',
    songs: 'About the author',
  };

  const bioTexts = {
    blog: <>The author, <strong>blah148</strong>, is a Korean who tries to play the bluesi, from Alberta, Canada. For a sampling of what foreign, blues-infused sounds, with guitar and vocals, may sound like, any daring and willing subject my click the listen button below.</>,
    about: <>The person who built this site, and its tabs/transcriptions, is <strong>blah148</strong>; musician from Alberta, Canada, with a long-time love for pre-war blues. A sample recording, from a recently released album, is shown below, and particularly fit for a patient listener, who may not mind in sparing some valuable minutes of the day.</>,
    songs: <>The maker of these tabs is, <strong>blah148</strong>; a Korean who tries to play the blues, from Alberta, Canada. For some foreign, though possibly blues infused sounds, with guitar and vocals, any masochist may click to listen below. </>,
  };

  const platformRows = [
    {
      key: 'youtube',
      label: 'YouTube',
      href: 'https://www.youtube.com/blah148',
      Icon: FaYoutube,
      btnClass: styles.btnYoutube,
      iconClass: `${styles.logoIcon} ${styles.youtube}`,
    },
    {
      key: 'spotify',
      label: 'Spotify',
      href: 'https://open.spotify.com/artist/5CfmXejuAGqUn3pK18xqV1',
      Icon: FaSpotify,
      btnClass: styles.btnSpotify,
      iconClass: `${styles.logoIcon} ${styles.spotify}`,
    },
    {
      key: 'apple',
      label: 'Apple Music',
      href: 'https://music.apple.com/artist/1738712630',
      Icon: FaApple,
      btnClass: styles.btnApple,
      iconClass: `${styles.logoIcon} ${styles.apple}`,
    },
    {
      key: 'bandcamp',
      label: 'Bandcamp',
      href: 'https://blah148.bandcamp.com',
      Icon: FaBandcamp,
      btnClass: styles.btnBandcamp,
      iconClass: `${styles.logoIcon} ${styles.bandcamp}`,
    },
  ];

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.contentRow}>
        {/* Artist image */}
        <div className={styles.leftColumn}>
					<YoutubeSubscribe />
        </div>
			</div>
      <h2 className={styles.header}>
        <strong>{headings[pageType] || headings.blog}</strong>
      </h2>

			<div className={styles.contentRow}>
        <div className={styles.rightColumn}>
          <p className={styles.bio}>{bioTexts[pageType] || bioTexts.blog}</p>
        </div>
      </div>
		  <div className={styles.contentRow}>
			   <AudioPlayer />
			</div>

    </div>
  );
}

