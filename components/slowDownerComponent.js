import dynamic from 'next/dynamic';
import { supabase } from '../utils/supabase';
const SlowDowner = dynamic(() => import('./SlowDowner'), { ssr: false });
import styles from '../styles/songs.module.css';

export default function SlowDownerComponent ({ dropbox_mp3_link }) {

	return (
		<>
		<SlowDowner mp3={dropbox_mp3_link} />
		</>
	);

}
