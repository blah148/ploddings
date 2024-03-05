import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
const SlowDowner = dynamic(() => import('./SlowDowner'), { ssr: false });
import styles from '../styles/songs.module.css';
import UnlockAudioButton from './UnlockAudioButton';

export default function SlowDownerComponent({ dropbox_mp3_link }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to detect if the device is mobile
    const detectMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Update state based on device type
    setIsMobile(detectMobile());
  }, []);

  return (
    <>
			{isMobile && <UnlockAudioButton />}
      <SlowDowner mp3={dropbox_mp3_link} />
    </>
  );
}

