import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Assuming you're using Next.js for routing
import Loader from './Loader';
import { supabase } from '../utils/supabase'; // Import Supabase client
import { useLoading } from '../context/LoadingContext';
import styles from '../styles/songs.module.css';

const TuningDetails = ({ tuning_id }) => {
  const [tuningDetails, setTuningDetails] = useState(null);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchTuningDetails = async () => {
      startLoading();
      try {
        const { data, error } = await supabase
          .from('tuning')
          .select('name, anchored_musescore_link')
          .eq('id', tuning_id)
          .single(); // Assuming each `tuning_id` uniquely identifies a row

        if (error) {
          throw error;
        }

        setTuningDetails(data);
      } catch (error) {
        console.error('Error fetching tuning details:', error);
      } finally {
        stopLoading();
      }
    };

    fetchTuningDetails();
  }, []);

  if (!tuningDetails) {
    return <div>No tuning details found.</div>;
  }

  return (
		<div className={styles.tuningButtonContainer}>
      <Link className={styles.tuningButton} href={`${tuningDetails.anchored_musescore_link}`}>
        <div>{tuningDetails.name}</div>
      </Link>
		</div>
  );
};

export default TuningDetails;

