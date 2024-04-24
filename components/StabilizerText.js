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

  // Function to check if the sleep period has expired
  const checkSleepExpiration = useCallback(() => {
    const hideUntil = localStorage.getItem('hideStabilizerUntil');
    if (!hideUntil) return true;
    return new Date() > new Date(hideUntil);
  }, []);

  useEffect(() => {
    const shouldRenderComponent = checkSleepExpiration() && !sessionStorage.getItem('noMoreStabilizersThisSession');
    setShouldRender(shouldRenderComponent);

    if (typeof window !== 'undefined' && shouldRenderComponent) {
      const fetchText = async () => {
        let id = sessionStorage.getItem('stabilizerId');

        startLoading(); // Indicate the start of a loading process

        if (!id) {
          const { data: ids, error: idsError } = await supabase.from('stabilizers').select('id');
          if (idsError || !ids.length) {
            console.error('Error fetching IDs:', idsError);
            stopLoading(); // Stop loading on error
            return;
          }
          const randomIndex = Math.floor(Math.random() * ids.length);
          id = ids[randomIndex].id;
          sessionStorage.setItem('stabilizerId', id.toString());
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
  }, [startLoading, stopLoading, checkSleepExpiration]);

  const handleExitClick = useCallback(() => {
    sessionStorage.removeItem('stabilizerId');
    sessionStorage.setItem('noMoreStabilizersThisSession', 'true');
    setShouldRender(false);
  }, []);

  const handleSleepClick = useCallback(() => {
    // Retrieve or initialize the delay multiplier
    let delayMultiplier = parseInt(localStorage.getItem('delayMultiplier'), 10) || 1; // Starts with 4 days

    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + 4 * delayMultiplier); // Multiply 4 days by the current multiplier

    localStorage.setItem('hideStabilizerUntil', hideUntil.toISOString());
    // Update and store the new delay multiplier by doubling it for the next time
    localStorage.setItem('delayMultiplier', (delayMultiplier * 2).toString());

    setShouldRender(false);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={styles.stabilizerText}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
					<div className={styles.exitIconContainer} onClick={handleSleepClick}>
          <SleepIcon />
        </div>
        <div className={styles.exitIconContainer}>
          <ExitIcon onClick={handleExitClick} />
        </div>
      </div>
      <div className={styles.textContent}>{text}</div>
    </div>
  );
}

