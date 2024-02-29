import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '../utils/supabase';
import YoutubeVideo from './youtubePlayerAPI';
const SlowDowner = dynamic(() => import('./SlowDowner'), { ssr: false });
import styles from '../styles/songs.module.css';

export default function DivSwitcher ({ dropbox_mp3_link, youtube_link }) {
  // Define state variables for box order
  const [div1, setDiv1] = useState({order: 1, text: "Down"});
  const [div2, setDiv2] = useState({order: 2, text: "Up"});
	const [switcher, setSwitcher] = useState(null);

	function swapOrder () {
		let storageItem = localStorage.getItem('songComponentOrder')
		setDiv1(storageItem === "column" ? { ...div1, text: "Up" } : { ...div1, text: "Down" });
    setDiv2(storageItem === "column" ? { ...div2, text: "Down" } : { ...div2, text: "Up" });
		setSwitcher(switcher === "column" ? "column-reverse" : "column");
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			if (localStorage.getItem('songComponentOrder') !== null && switcher !== null) {
				localStorage.setItem('songComponentOrder', switcher);
				let storageItem = localStorage.getItem('songComponentOrder');
	//      console.log('UPDATE: switcher, localStorage', switcher, storageItem);
			} else if (localStorage.getItem('songComponentOrder') !== null && switcher === null) {
				let storageItem = localStorage.getItem('songComponentOrder')
				setSwitcher(storageItem);
				setDiv1(storageItem === "column" ? { ...div1, text: "Down" } : { ...div1, text: "Up" });
				setDiv2(storageItem === "column" ? { ...div2, text: "Up" } : { ...div2, text: "Down" });

			}
		}
	}, [switcher]);

return (
  <div>
    { (
      <div className="outerContainer" style={{ display: "flex", flexDirection: switcher }}>
        <div className="box 1" style={{ border: "1px solid grey", margin: "3px" }}>
          {youtube_link && (<button onClick={swapOrder}>{div1.text}</button>)}
					<SlowDowner mp3={dropbox_mp3_link} />
        </div>
				
        {youtube_link && (
					<div className="box 2" style={{ border: "1px solid grey", margin: "3px" }}>
          	<button onClick={swapOrder}>{div2.text}</button>
						<YoutubeVideo videoId={youtube_link} />
        	</div>)}
      </div>
    )}
  </div>
);

}

