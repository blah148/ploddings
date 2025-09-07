// components/ArtistWidget.js
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ArtistWidget.module.css';
import { FaSpotify, FaApple, FaYoutube, FaBandcamp } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer.js';

export default function ArtistWidget({ pageType }) {
  const [showLinks, setShowLinks] = useState(false);

  const headings = {
    blog: 'About the Author',
    about: 'About blah148',
    songs: 'Who wrote the tabs?',
  };

  const bioTexts = {
    blog: <>This blog is written by <strong>blah148</strong> – an Albertan musician who has been posting about acoustic blues music since 2006. A sample recording is shown below from a recent release.</>,
    about: <>The person who built this site, as well as its transcriptions, is <strong>blah148</strong> – an Albertan musician, with a long-time interest in pre-war blues. A sample recording is below from a recent release.</>,
    songs: <>This transcription / guitar tablature was notated by <strong>blah148</strong>, who is a pre-war blues enthusiast, hailing from Alberta, Canada. A sample home recording is below from a recent release.</>,
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
          <Image
            src="https://f005.backblazeb2.com/file/blah148/profile-images/profile-image_blah148_200x200.jpeg"
            alt="blah148 profile"
            width={100}
            height={100}
            className={styles.profileImage}
          />
        </div>

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

