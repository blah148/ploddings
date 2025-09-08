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
    blog: <>The author, <strong>blah148</strong>, is an Albertan musician, whose been struck with a curiosity for acoustic blues music since initially posting on Youtube in 2006. A first album was released by blah, in 2025, largely after incorporating the library of guitar tablature, which comprises the bulk of this Ploddings pre-war blues project. The author would be greatly indebted to the reader, who may spare some precious minutes, in listening to one of the recent releases, shown below :) Also, in case of any interest to learn the pre-war blues style, on the guitar, the Youtube channel can be visited, for long-form pre-war blues video tutorials, livestreams of the note-for-note transcription of original recordings, and more.</>,
    about: <>The person who built this site, and its transcriptions, is <strong>blah148</strong>; musician from Alberta, Canada, with a long-time love for pre-war blues. A sample recording, from a recently released album, is shown below, and particularly fit for a patient listener, who may not mind in sparing some valuable minutes of the day.</>,
    songs: <>The author, <strong>blah148</strong>, is a pre-war blues enthusiast, from Alberta, Canada. A first album was released by blah, in 2025, in large part by incorporating learnings from the transcriptions/tabs on this site. To the like-minded blues enthusiast who may be viewing this, blah would be quite indebted if a patient ear may be lent to one of the released recordings :) Also, please feel welcome to subscribe to the Youtube channel for long-form pre-war blues video tutorials, livestreams where guitar tabs (like the one above) are written out in real-time, and more. </>,
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

