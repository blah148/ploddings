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
    blog: <>This blog is written by <strong>blah148</strong>, who is an Albertan musician. A Youtube channel, started in 2006 by blah148, contains an array of in-depth guitar tutorials for pre-war blues music, to learn more. Also, a sample recording is shown below, from a separate album project.</>,
    about: <>The person who built this site, and its transcriptions, is <strong>blah148</strong>; musician from Alberta, Canada, with a long-time love for pre-war blues. To hear a music sample by blah148, a recording from a related album project.</>,
    songs: <>This guitar tablature was notated by <strong>blah148</strong>; a pre-war blues enthusiast, from Alberta, Canada. To hear some music by blah148, a recording is below from a recent musical project.</>,
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
      <h2 className={styles.header}>
        <strong>{headings[pageType] || headings.blog}</strong>
      </h2>

      <div className={styles.contentRow}>
        {/* Artist image */}
        <div className={styles.leftColumn}>
					<YoutubeSubscribe />
        </div>
			</div>
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

