import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../utils/supabase'; 
import { fetchSongData, getParentObject } from '../../db-utilities';
import jwt from 'jsonwebtoken'; 
import { useLoading } from '../../context/LoadingContext';
import Loader from '../../components/Loader';
import SlowDownerComponent from '../../components/slowDownerComponent';
import TabsComponent from '../../components/extraNotesTabs';
import styles from '../../styles/songs.module.css';
import IpodMenuLink from '../../components/ParentBackLink';
import ParentInfoLink from '../../components/ParentInfoLink';
import RelatedContent from '../../components/RelatedGrid_Songs';
import TuningDetails from '../../components/TuningButton';
import Menu from '../../components/Menu';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import PDFDownloadButton from '../../components/PDFDownloadButton';
import StabilizerText from '../../components/StabilizerText';
import MusescoreEmbed from '../../components/MusescoreEmbed';
import BeingWatchedMobile from '../../components/BeingWatchedMobile.js';
import Head from 'next/head';
import GTM from '../../components/GTM.js';
import ArtistWidget from '../../components/ArtistWidget.js';

export default function Song({ userId = null, ip, threadData, songData }) {

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [relatedContentLength, setRelatedContentLength] = useState(null);
  const [buttonLoaded, setButtonLoaded] = useState(false);

  // Function to log the page visit directly to the database
  const logPageVisit = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_history')
        .insert([
          {
            ip: ip,
            page_id: songData.id,
            visited_at: new Date()
          }
        ]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to log page visit:', error.message);
    }
  };

	useEffect(() => {
		if (!songData?.paid_traffic) {   // run only if not true
			logPageVisit();
		}
	}, [userId, ip]);

  return (
    <div className="bodyA">
      {songData?.paid_traffic && (
				<>
				  <GTM />
				</>
      )}
      <SEO
        title={`Guitar Tabs for ${songData.name} by ${threadData.name}`}
        image={threadData.link_3}
        page_type="songs"
        slug={songData.slug}
				description={`Click play to listen to interactive guitar tablature for ${songData.name} by ${threadData.name}.`}
      />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
<Link className="homeButton mobileOnly" href="/" passHref>
  <img
    src="https://f005.backblazeb2.com/file/ploddings-images/site_images/ploddings_logo-on-transparent.png"
    alt="Ploddings logo"
    style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: '8px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
  />
  <div className="homeText" style={{ display: 'inline-block', verticalAlign: 'middle', margin: 'auto' }}>
    (Back to All Pre-War Blues Tabs)
  </div>
</Link>

            </div>
            <div className={styles.songNameContainer}>
              <h1>{songData.name}</h1>
            </div>
            <ParentInfoLink threadData={threadData} fallBack='/' />
            <TuningDetails tuning_id={songData.tuning} />
{songData.published_date && (
  <div>
    Date posted:{' '}
    {new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(songData.published_date))}
  </div>
)}

            <div className={styles.bottomBorder}></div>
            <div className={styles.componentsContainer}>
              <div className={styles.primaryColumn}>
                <h2 id="i">i) Guitar tablature / sheet music</h2>
                <div style={{ position: "relative" }}>
											<MusescoreEmbed
													pageId={songData.id}
													userId={userId}
													ip={ip}
													embed_link={songData.link_3}
													canAccess={true}
											/>
                </div>
	
								<PDFDownloadButton pdfUrl={songData.pdf_download} songName={songData.name}/>
                <h2 id="ii">ii) Slow-downer playalong</h2>
                  <SlowDownerComponent isUnlocked={true} dropbox_mp3_link={songData.link_1} />
                <h2 id="iii">iii) More info</h2>
                {(songData.body_text || songData.lyrics || songData.tuning) && (
                  <TabsComponent extra_notes={songData.body_text} song_lyrics={songData.lyrics} youtube_link={songData.link_2} />
                )}
                {relatedContentLength && (<h2 id="iv">iv) Related content</h2>)}
                <RelatedContent id={songData.id} setRelatedContentLength={setRelatedContentLength} />
              </div>
              <div className={styles.tocContainer}>
                <div className={styles.tableOfContents}>
                  <h2>Table of contents:</h2>
                  <a href="#i" className={styles.songTocItem}>i) Guitar tabs</a>
                  <a href="#ii" className={styles.songTocItem}>ii) Slow-downer</a>
                  <a href="#iii" className={styles.songTocItem}>iii) More info</a>
                  {relatedContentLength && (<a href="#iv" className={styles.songTocItem}>iv) Related content</a>)}  
                </div>
              </div>
            </div>

            <ArtistWidget pageType="songs" />

						<BeingWatchedMobile />
          </div>
        </div>
        <Footer userId={userId} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  // const userSession = verifyUserSession(req);
  const songData = await fetchSongData(params.id);
  const threadData = await getParentObject(songData.thread_id);

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;

  return {
    props: {
      songData,
      threadData,
      ip,
      // userId: userSession?.id || null,
    },
  };
}

