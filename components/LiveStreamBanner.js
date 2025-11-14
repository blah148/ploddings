import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import styles from './LiveStreamBanner.module.css';
import { FaYoutube, FaTimes } from 'react-icons/fa';

export default function LiveStreamBanner() {
  const [stream, setStream] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  // --- check localStorage for dismissal window ---
  useEffect(() => {
    const stored = localStorage.getItem('livestream_banner_dismissed_until');
    if (stored && new Date(stored) > new Date()) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    localStorage.setItem('livestream_banner_dismissed_until', twoDaysLater.toISOString());
    setDismissed(true);
  };

  // --- fetch current stream ---
  useEffect(() => {
    const fetchStream = async () => {
      const { data, error } = await supabase
        .from('live_streams')
        .select('*')
        .eq('is_live', true)
        .maybeSingle();

      if (error) console.error('Error fetching live stream:', error.message);
      else setStream(data);
    };

    fetchStream();

    // Real-time updates
    const channel = supabase
      .channel('live_stream_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_streams' },
        (payload) => {
          const newRow = payload.new;
          if (newRow?.is_live) setStream(newRow);
          else setStream(null);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (!stream || dismissed) return null;

  return (
    <div className={styles.banner}>
			<div></div>
			<div className={styles.bannerContainer}>
				<div className={styles.flash}></div>

				<div className={styles.content}>
					<FaYoutube className={styles.icon} />
					<a
						href={stream.youtube_url}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.text}
					>
						<strong>
							LIVESTREAM:
						</strong>{' '}
						{stream.title}
					</a>
				</div>
      </div>
      <button className={styles.closeButton} onClick={handleDismiss}>
        <FaTimes />
      </button>
    </div>
  );
}

