import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabase';
import styles from "./AlternativeMusescoreEmbed.module.css";
import PDFDownloadButton_SignupFirst from "./PDFDownloadButton_SignupFirst";

const AlternativeMusescoreEmbed = ({ ip, fingerprint, songId, currentSongName }) => {
  const [contentData, setContentData] = useState(null);

  useEffect(() => {
    const checkAccessAndFetchLink = async () => {
      try {
        // Check if the visitor exists in the 'visitors' table
        let { data: visitor, error } = await supabase
          .from('visitors')
          .select('free_visit_page_id')
          .or(`ip.eq.${ip},fingerprint.eq.${fingerprint}`)
          .order('timestamp_column', { ascending: false })
          .limit(1)
          .single();

        if (error || !visitor) {
          console.error('Error fetching visitor data:', error);
          return;
        }

        const { free_visit_page_id } = visitor;
        console.log('Free visit page ID:', free_visit_page_id);

        // Fetch the link and name from the 'content' table
        let { data: content, error: contentError } = await supabase
          .from('content')
          .select('link_3, name, pdf_download, slug')
          .eq('id', free_visit_page_id)
          .single();

        if (contentError || !content) {
          console.error('Error fetching content data:', contentError);
          return;
        }

        setContentData(content);
      } catch (err) {
        console.error('Error during access check:', err);
      }
    };

    checkAccessAndFetchLink();
  }, [ip, fingerprint, songId]);

  if (!contentData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
			<div className="alertNotice">
				For non-active members & visitors, there exists a viewing limit of 1-song per 72-hours. Until this time has elapsed, the MIDI-tablature & slow-downer/pitch-shifter for {currentSongName} will remain hidden. Until then, the materials for <Link href={`/songs/${contentData.slug}`}>{contentData.name}</Link> are available.
			</div>
			<div className={styles.embed}>
				<iframe
					id="musescoreIframe"
					width="100%"
					height="600px"
					src={contentData.link_3}
					frameBorder="0"
					allowFullScreen
					allow="autoplay; fullscreen"
				></iframe>
			</div>
    </div>
  );
};

export default AlternativeMusescoreEmbed;

