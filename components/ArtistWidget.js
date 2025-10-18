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
blog: <>The author of this, as well as the builder of the site's blues & folk tabs, is <strong>blah148</strong>; an enthusiast of these styles of music. Here is a sample recording, trying to amalgamate some of these learnings.</>,
    about: <>The person who built this site, and its tabs/transcriptions, is <strong>blah148</strong>; musician from Alberta, Canada, with a long-time love for pre-war blues. A sample recording, from a recently released album, is shown below, and particularly fit for a patient listener, who may not mind in sparing some valuable minutes of the day.</>,
songs: <>The builder of this site's blues & folk tabs is <strong>blah148</strong>; an enthusiast of these going-the-way-of-the-dodo styles of music. This manner of (at least shooting for) note-for-note tablature, or notation, is part of the endeavor of 'transcribing'. Part of the reason for this library of transcriptions is the feeble hope of <strong>blah148</strong> that the sound of these recordings will start to rub off, maybe by the 111th or 327th one; in some ways, the number is like a measure of desperation and clawing. It's a way that is recommended to others, though may not necessarily replace hearing these sounds up close & in-person. Here is a sample recording, trying to amalgamate some of these learnings.</>,

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

