import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import ExitIcon from './ExitIcon';
import SleepIcon from './SleepIcon';

export default function StabilizerText() {
  const [text, setText] = useState('');

  useEffect(() => {
    const fetchTextById = async (id) => {
      const { data, error } = await supabase
        .from('stabilizers')
        .select('body_text')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching data:', error);
        return;
      }

      setText(data.body_text);
    };

    const storedId = localStorage.getItem('stabilizerId');

    if (storedId) {
      // If there's an ID stored, use it to fetch the text
      fetchTextById(storedId);
    } else {
      // If no ID is stored, fetch IDs to select a random one
      const fetchRandomText = async () => {
        const { data: ids, error: idsError } = await supabase
          .from('stabilizers')
          .select('id');

        if (idsError) {
          console.error('Error fetching IDs:', idsError);
          return;
        }

        // Select a random ID from the fetched list
        const randomIndex = Math.floor(Math.random() * ids.length);
        const randomId = ids[randomIndex].id;

        // Store the randomId in localStorage for future use
        localStorage.setItem('stabilizerId', randomId.toString());

        // Fetch the full row data for the selected ID
        await fetchTextById(randomId);
      };

      fetchRandomText();
    }
  }, []);

  return (
    <div className="stabilizerText">
      <div>
        <SleepIcon />
        <ExitIcon />
      </div>
      {text ? text : 'Loading...'}
    </div>
  );
}

