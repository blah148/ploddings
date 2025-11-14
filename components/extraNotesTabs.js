import { useState, useEffect } from 'react';
import TuningEmbed from './TuningEmbed';
import styles from '../styles/songs.module.css';
import YoutubeVideo from './youtubePlayerAPI';

export default function TabsComponent({ extra_notes = null, song_lyrics = null, youtube_link = null, lesson_link = null }) {
  const [selectedTab, setSelectedTab] = useState(null);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
    localStorage.setItem('selectedTab', tab);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedTab === null && localStorage.getItem('selectedTab') !== null) {
        const storedTab = parseInt(localStorage.getItem('selectedTab'), 10);
        setSelectedTab(storedTab);
      } else if (selectedTab === null && localStorage.getItem('selectedTab') === null) {
        if (lesson_link) {
          setSelectedTab(1);
        } else {
          setSelectedTab(1);
        }
      }
    }
  }, [selectedTab, lesson_link]);

  return (
    <div>
      <div className={styles.tabs}>

        {lesson_link && (
          <button
            className={`${styles.tabButton} ${selectedTab === 1 ? styles.active : ''}`}
            onClick={() => handleTabClick(1)}
          >
            Tutorial
          </button>
        )}

        {extra_notes && (
          <button
            className={`${styles.tabButton} ${selectedTab === 2 ? styles.active : ''}`}
            onClick={() => handleTabClick(2)}
          >
            Notes
          </button>
        )}

        {song_lyrics && (
          <button
            className={`${styles.tabButton} ${selectedTab === 3 ? styles.active : ''}`}
            onClick={() => handleTabClick(3)}
          >
            Lyrics
          </button>
        )}

        {youtube_link && (
          <button
            className={`${styles.tabButton} ${selectedTab === 4 ? styles.active : ''}`}
            onClick={() => handleTabClick(4)}
          >
            Recording
          </button>
        )}

      </div>

      <div className={styles.tabContent}>

        {lesson_link && (
          <div
            style={{ display: selectedTab === 1 ? 'block' : 'none' }}
            className={`${styles.tabPane} ${selectedTab === 1 ? styles.active : ''}`}
          >
            <div className={styles.youtubeContainer}>
              <YoutubeVideo videoId={lesson_link} />
            </div>
          </div>
        )}

        {extra_notes && (
          <div
            dangerouslySetInnerHTML={{ __html: extra_notes }}
            style={{ display: selectedTab === 2 ? 'block' : 'none' }}
            className={`${styles.tabPane} ${selectedTab === 2 ? styles.active : ''}`}
          ></div>
        )}

        {song_lyrics && (
          <div
            dangerouslySetInnerHTML={{ __html: song_lyrics }}
            style={{ display: selectedTab === 3 ? 'block' : 'none' }}
            className={`${styles.tabPane} ${selectedTab === 3 ? styles.active : ''}`}
          ></div>
        )}

        {youtube_link && (
          <div
            style={{ display: selectedTab === 4 ? 'block' : 'none' }}
            className={`${styles.tabPane} ${selectedTab === 4 ? styles.active : ''}`}
          >
            <div className={styles.youtubeContainer}>
              <YoutubeVideo videoId={youtube_link} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

