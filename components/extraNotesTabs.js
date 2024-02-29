import { useState, useEffect } from 'react';
import TuningEmbed from './TuningEmbed';
import styles from '../styles/songs.module.css';
import YoutubeVideo from './youtubePlayerAPI';

export default function TabsComponent ({ extra_notes = null, song_lyrics = null, youtube_link = null }) {

  const [selectedTab, setSelectedTab] = useState(null);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
		localStorage.setItem('selectedTab', tab);
  };
		
	useEffect (() => {
		if (typeof window !== 'undefined') {
		 if (selectedTab === null && localStorage.getItem('selectedTab') !== null) {
				// Convert string in localStorage to a number
				const storedTab = parseInt(localStorage.getItem('selectedTab'), 10);
				setSelectedTab(storedTab);
			}	
			
			else if (selectedTab === null && localStorage.getItem('selectedTab') === null) {
				setSelectedTab(1);
			}
		}
	}, [selectedTab]);


  return (
    <div>
			<div className={styles.tabs}>
				{extra_notes && (
					<button className={`${styles.tabButton} ${selectedTab === 1 ? styles.active : ''}`} onClick={() => handleTabClick(1)}>Notes</button>
				)}
				{song_lyrics && (
					<button className={`${styles.tabButton} ${selectedTab === 2 ? styles.active : ''}`} onClick={() => handleTabClick(2)}>Lyrics</button>
				)}
				{youtube_link && (
					<button className={`${styles.tabButton} ${selectedTab === 3 ? styles.active : ''}`} onClick={() => handleTabClick(3)}>Video</button>
				)}
			</div>
			<div className={styles.tabContent}>
				{extra_notes && (
					<div 
						dangerouslySetInnerHTML={{ __html: extra_notes }} 
						style={{ display: selectedTab === 1 ? 'block' : 'none' }} 
						className={`${styles.tabPane} ${selectedTab === 1 ? styles.active : ''}`}
						></div>
					)}
				{song_lyrics && (
					<div 
						dangerouslySetInnerHTML={{ __html: song_lyrics }} 
						style={{ display: selectedTab === 2 ? 'block' : 'none' }} 
						className={`${styles.tabPane} ${selectedTab === 2 ? styles.active : ''}`}
					></div>
				)}
				{youtube_link && (
					<div 
						style={{ display: selectedTab === 3 ? 'block' : 'none' }} 
						className={`${styles.tabPane} ${selectedTab === 3 ? styles.active : ''}`}
					>
						<YoutubeVideo videoId={youtube_link} />
					</div>
				)}
      </div>
    </div>
  );

};

