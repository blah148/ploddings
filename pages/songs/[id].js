import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import useStore from '../../zustandStore';
import Sidebar from '../../components/Sidebar';
import FavoriteButton from '../../components/songFavorite';
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
import PDFDownloadButton_SignupFirst from '../../components/PDFDownloadButton_SignupFirst';
import PDFDownloadButton from '../../components/PDFDownloadButton';
import StabilizerText from '../../components/StabilizerText';
import NotificationIcon from '../../components/NotificationIcon';
import MusescoreEmbed from '../../components/MusescoreEmbed';
import { getFingerprint } from '../../utils/fingerprint';
import TablaturePlaceholder from '../../components/TablaturePlaceholder';

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

export default function Song({ userId, ip, threadData, songData }) {

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [relatedContentLength, setRelatedContentLength] = useState(null);
  const [buttonLoaded, setButtonLoaded] = useState(false);
  const [canAccess, setCanAccess] = useState(null);
	const [fingerprint, setFingerprint] = useState(null);

  const logPageVisit = async () => {
    try {
      await axios.post('/api/log-visit', {
        page_id: songData.id,
				userId,
				ip: !userId ? ip : null,
      });
    } catch (error) {
      console.error('Failed to log page visit:', error);
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
        } catch (error) {
          console.error('Error verifying active membership:', error);
        }
      }

      try {
        const fp = await getFingerprint();
				setFingerprint(fp);
        const response = await fetch('/api/check_visitor_access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ip, fingerprint: fp, pageId: songData.id }),
        });

        if (response.status === 200) {
          setCanAccess(true);
        } else {
          setCanAccess(false);
        }
      } catch (error) {
        console.error('Error checking visitor access:', error);
        setCanAccess(false);
      }
    };

    fetchData();
  }, [userId, ip, songData.id]);


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
                <NotificationIcon userId={userId} />
                <Menu userId={userId} />
              </div>
            </div>
            <StabilizerText />
            <div className={styles.songNameContainer}>
              <h1>{songData.name}</h1>
              <FavoriteButton userId={userId} id={songData.id} ip={ip} />
            </div>
            <ParentInfoLink threadData={threadData} fallBack='/' />
            <TuningDetails tuning_id={songData.tuning} />
            <div className={styles.bottomBorder}></div>
            <div className={styles.componentsContainer}>
              <div className={styles.primaryColumn}>
                <h2 id="i">i) Sheet music</h2>
                <div style={{ position: "relative" }}>
									{canAccess && (
											<PDFDownloadButton userId={userId} pdfUrl={songData.pdf_download} songName={songData.name} />
									)}
									{canAccess ? (
											<MusescoreEmbed
													pageId={songData.id}
													userId={userId}
													ip={ip}
													embed_link={songData.link_3}
													canAccess={true}
											/>
									) : (
											<TablaturePlaceholder />
									)}
                </div>
                <h2 id="ii">ii) Slow-downer / pitch-shifter</h2>
                  <SlowDownerComponent isUnlocked={canAccess} dropbox_mp3_link={songData.link_1} />
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
                  <a href="#i" className={styles.songTocItem}>i) Sheet music</a>
                  <a href="#ii" className={styles.songTocItem}>ii) Slow-downer</a>
                  <a href="#iii" className={styles.songTocItem}>iii) More info</a>
                  {relatedContentLength && (<a href="#iv" className={styles.songTocItem}>iv) Related content</a>)}  
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer userId={userId} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {
  const userSession = verifyUserSession(req);
  const songData = await fetchSongData(params.id);
  const threadData = await getParentObject(songData.thread_id);
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;

  return {
    props: {
      songData,
      threadData,
      ip,
      userId: userSession?.id || null,
    },
  };
}

