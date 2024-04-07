import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import ExitIcon from './ExitIcon';
import SleepIcon from './SleepIcon';
import { useLoading } from '../context/LoadingContext';
import styles from './StabilizerText.module.css';

export default function StabilizerText() {
  const [text, setText] = useState('');
  const [shouldRender, setShouldRender] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    setShouldRender(!sessionStorage.getItem('noMoreStabilizersThisSession'));

    if (typeof window !== 'undefined' && !sessionStorage.getItem('noMoreStabilizersThisSession')) {
      const fetchText = async () => {
        let id = localStorage.getItem('stabilizerId');
        
        startLoading(); // Indicate the start of a loading process

        if (!id) {
          // Fetch IDs to get a random ID if none is stored
          const { data: ids, error: idsError } = await supabase.from('stabilizers').select('id');
          if (idsError || !ids.length) {
            console.error('Error fetching IDs:', idsError);
            stopLoading(); // Stop loading on error
            return;
          }
          const randomIndex = Math.floor(Math.random() * ids.length);
          id = ids[randomIndex].id;
          localStorage.setItem('stabilizerId', id.toString());
        }

        const { data, error } = await supabase.from('stabilizers').select('body_text').eq('id', id).single();
        if (error) {
          console.error('Error fetching data:', error);
        } else {
          setText(data.body_text);
        }

        stopLoading(); // Indicate the end of the loading process
      };

      fetchText();
    }
  }, [startLoading, stopLoading]);

  const handleExitClick = useCallback(() => {
    localStorage.removeItem('stabilizerId');
    sessionStorage.setItem('noMoreStabilizersThisSession', 'true');
    setShouldRender(false);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={styles.stabilizerText}>
        <div className={styles.exitIconContainer}>
					<ExitIcon onClick={handleExitClick} />
				</div>
      <div className={styles.textContent}>{text}</div>
    </div>
  );

}

