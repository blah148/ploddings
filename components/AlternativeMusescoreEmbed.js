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
        const pageId = free_visit_page_id || 297;

        // Fetch the link and name from the 'content' table
        let { data: content, error: contentError } = await supabase
          .from('content')
          .select('link_3, name, pdf_download, slug')
          .eq('id', pageId)
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
			{contentData ? (
				<>
					<div className="alertNotice">
						*For non-active members & visitors, there exists a viewing limit of 1-song per 72-hours. Until this time elapses, the MIDI-tablature & slow-downer/pitch-shifter for {currentSongName} will remain hidden. Until then, the materials for <Link href={`/songs/${contentData.slug}`}>{contentData.name}</Link> are available.
						<div style={{ fontSize: "13px", display: "inline-flex", marginLeft: "6px" }}>
							<Link href="/about">(Learn more)</Link>
						</div>
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
				</>
			) : (
				<>
					<div className="alertNotice">
						*For non-active members & visitors, there exists a viewing limit of 1-song per 72-hours. Until this time elapses, the MIDI-tablature & slow-downer/pitch-shifter for {currentSongName} will remain hidden. Until then, this preview of Crossroad Blues exists to demonstrate the type of tablature that will be available.
						<div style={{ fontSize: "13px", display: "inline-flex", marginLeft: "6px" }}>
							<Link href="/about">(Learn more)</Link>
						</div>
					</div>
					<div className={styles.embed}>
						<iframe
							id="musescoreIframe"
							width="100%"
							height="600px"
							src="https://musescore.com/user/69479854/scores/12391636/s/VszDGy/embed"
							frameBorder="0"
							allowFullScreen
							allow="autoplay; fullscreen"
						></iframe>
					</div>
				</>
			)}
		</div>
	);

};

export default AlternativeMusescoreEmbed;

