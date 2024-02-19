import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Assuming you're using Next.js for routing
import Loader from './Loader';
import { supabase } from '../pages/utils/supabase'; // Import Supabase client
import { useLoading } from '../context/LoadingContext';

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
  }, [tuning_id, startLoading, stopLoading]);

  if (isLoading) {
    return <Loader />;
  }

  if (!tuningDetails) {
    return <div>No tuning details found.</div>;
  }

  return (
    <Link href={`/${tuningDetails.anchored_musescore_link}`}>
      <div>{tuningDetails.name}</div>
    </Link>
  );
};

export default TuningDetails;

