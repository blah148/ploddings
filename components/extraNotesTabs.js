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
      <div className="tabs">
        {extra_notes && (<button className={selectedTab === 1 ? 'active' : ''} onClick={() => handleTabClick(1)}>Notes</button>)}
        {song_lyrics && (<button className={selectedTab === 2 ? 'active' : ''} onClick={() => handleTabClick(2)}>Lyrics</button>)}
				{youtube_link && (<button className={selectedTab === 3 ? 'active' : ''} onClick={() => handleTabClick(3)}>Video</button>)}
      </div>
      <div className="tab-content">
        {extra_notes && (<div dangerouslySetInnerHTML={{ __html: extra_notes }} style={{ display: selectedTab === 1 ? 'block' : 'none' }} className={selectedTab === 1 ? 'tab-pane active' : 'tab-pane'}></div>)}
        {song_lyrics && (<div dangerouslySetInnerHTML={{ __html: song_lyrics }} style={{ display: selectedTab === 2 ? 'block' : 'none' }} className={selectedTab === 2 ? 'tab-pane active' : 'tab-pane'}></div>)}
				{youtube_link && (<div style={{ display: selectedTab === 3 ? 'block' : 'none' }} className={selectedTab === 3 ? 'tab-pane active' : 'tab-pane'}>
					<YoutubeVideo videoId={youtube_link} />
				</div>)}
      </div>
    </div>
  );

};

