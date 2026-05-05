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
import StabilizerText from '../../components/StabilizerText';
import PloddingsScoreFooter from '../../components/PloddingsScoreFooter';
import BeingWatchedMobile from '../../components/BeingWatchedMobile.js';
import Head from 'next/head';
import GTM from '../../components/GTM.js';

export default function Song({ userId = null, ip, threadData, songData }) {

  const { isLoading, startLoading, stopLoading } = useLoading();
  const [relatedContentLength, setRelatedContentLength] = useState(null);
  const [buttonLoaded, setButtonLoaded] = useState(false);
  // Iframe height tracks the score's rendered height (mobile in particular needs to be tall enough
  // to encompass all systems with 2-bars-per-row layout). Initial 1400 is a generous fallback.
  const [iframeHeight, setIframeHeight] = useState(1400);

  // Drive the site-wide Loader animation while the score-embed iframe is loading.
  useEffect(() => {
    if (!songData?.musicXML) return;
    startLoading();
    const onMessage = (e) => {
      if (!e.data || e.data.type !== 'ploddings-score-ready') return;
      stopLoading();
      // Apply reported height (clamped to a sensible range) so the iframe fits the whole score —
      // mobile especially needs this since 2 bars per system makes the score much taller.
      // No upper clamp — long scores on mobile (2 bars/system) can produce content well past 10000px.
      // Lower floor stays at 400 so a mid-render partial measurement can't shrink the iframe to nothing.
      if (typeof e.data.height === 'number' && e.data.height >= 400) {
        setIframeHeight(Math.ceil(e.data.height));
      }
    };
    window.addEventListener('message', onMessage);
    const fallback = setTimeout(() => stopLoading(), 20000);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(fallback);
      stopLoading();
    };
  }, [songData?.musicXML, startLoading, stopLoading]);

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
				noTitleTag={true}
        page_type="songs"
        slug={songData.slug}
				description={`Click play to listen to interactive guitar tablature for ${songData.name} by ${threadData.name}.`}
      />
      <Head>
        {/* On mobile, cap the score iframe at 80vh so super-long scores scroll internally
            instead of clipping when the auto-height postMessage under-reports. */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 640px) {
            .ploddings-score-iframe {
              max-height: 90vh !important;
              overflow: auto !important;
            }
          }
        ` }} />
        {/* Preload the MusicXML so the score downloads in parallel with JS bundles
            instead of waiting until the embed component mounts and starts fetching. */}
        {/* Preload removed: the embed lives inside an iframe, which has its own preload tag —
            cross-frame preload from the parent doesn't share with the iframe context. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicRecording',
            name: songData.name,
            byArtist: {
              '@type': 'Person',
              name: threadData.name,
            },
            url: `https://www.ploddings.com/songs/${songData.slug}`,
            datePublished: songData.published_date || undefined,
            image: threadData.link_3 || undefined,
            description: songData.meta_description || undefined,
          })}}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ploddings.com' },
              { '@type': 'ListItem', position: 2, name: threadData.name, item: `https://www.ploddings.com/threads/${threadData.slug}` },
              { '@type': 'ListItem', position: 3, name: songData.name, item: `https://www.ploddings.com/songs/${songData.slug}` },
            ],
          })}}
        />
      </Head>
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
<Link className="homeButton mobileOnly" href="/" passHref>
  <Image
    src="https://f005.backblazeb2.com/file/ploddings-images/site_images/ploddings_logo-on-transparent.png"
    alt="Ploddings logo"
    width={60}
    height={60}
    style={{
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: '8px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
    priority
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
                <h2 id="i">i) Sheet music / guitar tablature</h2>
                {songData.musicXML && (
                  <div style={{ position: "relative", marginBottom: "16px" }}>
                    {/* Iframed so the heavy alphaTab load happens in its own document
                        and doesn't block the rest of the song page from painting. */}
                    <iframe
                      className="ploddings-score-iframe"
                      src={`/embed/${songData.slug}`}
                      title={`${songData.name} — interactive score`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: `${iframeHeight}px`,
                        border: 'none',
                        display: 'block',
                        transition: 'height 0.2s ease',
                      }}
                    />
                    <PloddingsScoreFooter songSlug={songData.slug} />
                  </div>
                )}

                <h2 id="ii">ii) Slow-downer playalong</h2>
                  <SlowDownerComponent isUnlocked={true} dropbox_mp3_link={songData.link_1} />
                <h2 id="iii">iii) More info</h2>
                {(songData.body_text || songData.lyrics || songData.tuning) && (
                  <TabsComponent extra_notes={songData.body_text} song_lyrics={songData.lyrics} youtube_link={songData.link_2} lesson_link={songData.video_lesson} />
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
  if (!songData) {
    return { notFound: true };
  }
  const threadData = songData.thread_id ? await getParentObject(songData.thread_id) : null;

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

