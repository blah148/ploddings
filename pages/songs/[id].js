import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../utils/supabase'; // Adjust the import path as needed
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
import TablaturePlaceholder from '../../components/TablaturePlaceholder';
import BeingWatchedMobile from '../../components/BeingWatchedMobile.js';

const verifyUserSession = (req) => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return null; // No session
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Session valid
  } catch (error) {
    return null; // Session invalid
  }
};

export default function Song({ userId = null, ip, threadData, songData }) {

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [relatedContentLength, setRelatedContentLength] = useState(null);
  const [buttonLoaded, setButtonLoaded] = useState(false);
  const [canAccess, setCanAccess] = useState(null);

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
	  logPageVisit();
	}, [userId, ip]);

	useEffect(() => {
		const fetchData = async () => {
			if (userId) {
				try {
					const response = await fetch(`/api/active_membership-verify?userId=${userId}`);
					if (response.status === 200) {
						setCanAccess(true);
						return;
					}
					setCanAccess(false); // Set access to false if the status is not 200
				} catch (error) {
					console.error('Error verifying active membership:', error);
					setCanAccess(false);
				}
			}
		};

		fetchData(); // Call the fetchData function
	}, [userId, songData.id]); // Dependencies are correct

  useEffect(() => {
    const loadButton = () => {
     // console.log("Iframe loaded, setting buttonLoaded to true.");
      setButtonLoaded(true);
    };

    const iframeElement = document.getElementById('musescoreIframe');
    if (iframeElement) {
      iframeElement.addEventListener('load', loadButton);
    } else {
     // console.log("Iframe element not found.");
    }

    return () => {
      if (iframeElement) {
        iframeElement.removeEventListener('load', loadButton);
      }
    };
  }, []);

  return (
    <div className="bodyA">
      <SEO
        title={songData.name}
        image={threadData.link_3}
        page_type="songs"
        slug={songData.slug}
        description={songData.meta_description}
      />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink threadData={threadData} fallBack='/' />
              <div style={{display: "flex"}}>
                <Menu userId={userId} />
              </div>
            </div>
            <StabilizerText />
            <div className={styles.songNameContainer}>
              <h1>{songData.name}</h1>
            </div>
            <ParentInfoLink threadData={threadData} fallBack='/' />
            <TuningDetails tuning_id={songData.tuning} />
            <div className={styles.bottomBorder}></div>
            <div className={styles.componentsContainer}>
              <div className={styles.primaryColumn}>
                <h2 id="i">i) Guitar tablature</h2>
                <div style={{ position: "relative" }}>
											<MusescoreEmbed
													pageId={songData.id}
													userId={userId}
													ip={ip}
													embed_link={songData.link_3}
													canAccess={true}
											/>
                </div>
                <h2 id="ii">ii) Slow-downer / pitch-shifter</h2>
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

