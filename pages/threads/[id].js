// pages/threads/[id]
import Image from 'next/image';
import React, { useEffect, useState, createContext, useContext } from 'react';
import TableDataFetcher from '../../utils/TableDataFetcher';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../utils/supabase'; // Adjust the import path as needed
import jwt from 'jsonwebtoken';
import { fetchThreadData } from '../../db-utilities';
import { useLoading } from '../../context/LoadingContext';
import Link from 'next/link';
import Loader from '../../components/Loader';
import styles from '../../styles/songs.module.css';
import Footer from '../../components/Footer';
import Menu from '../../components/Menu';
import IpodMenuLink from '../../components/ParentBackLink';
import VictrolaIcon from '../../components/VictrolaIcon';
import WikipediaIcon from '../../components/WikipediaIcon';
import SEO from '../../components/SEO';
import Head from 'next/head';
import StabilizerText from '../../components/StabilizerText';
import BeingWatchedMobile from '../../components/BeingWatchedMobile.js';	

export default function Thread({ userId=null, ip, threadData }) {

	const { isLoading, startLoading, stopLoading } = useLoading();
	const [parsedContent, setParsedContent] = useState({ firstPTag: '', remainingPTags: '' });

  // Function to log the page visit directly to the database
  const logPageVisit = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_history')
        .insert([
          {
            ip: ip,
            page_id: threadData.id,
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

  return (
    <div className="bodyA">
       <SEO
         title={`${threadData.name} - Interactive Guitar Tabs`}
				 image={threadData.link_3}
				 page_type="threads"
				 slug={threadData.slug}
         description={threadData.meta_description}
				 noTitleTag={true}
       />
       <Head>
         <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{ __html: JSON.stringify({
             '@context': 'https://schema.org',
             '@type': 'Person',
             name: threadData.name,
             url: `https://www.ploddings.com/threads/${threadData.slug}`,
             image: threadData.link_3 || undefined,
             description: threadData.meta_description || undefined,
             sameAs: threadData.wikipedia_link ? [threadData.wikipedia_link] : undefined,
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
<Link className="homeButton" href="/" passHref>
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
						<div className="narrowedFeedBody">
							<div className={styles.headerContainer}>		
								<Image width={300} height={300} alt={threadData.featured_img_alt_text ? threadData.featured_img_alt_text : `${threadData.name} guitar portrait`} src={threadData.link_3 || 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_550px/default_550px.webp'} />
								<div className={styles.rightColumn}>
									<div className={styles.songNameContainer}>
										<h1>{threadData.name}</h1>
									</div>
									{threadData.lyrics && (<div className={styles.lifeAndDeath}>{threadData.lyrics}</div>)}
{threadData.body_text && (
  <div className={styles.aboutDesktopOnly}>
    <div
      className={styles.aboutSection}
      dangerouslySetInnerHTML={{ __html: threadData.body_text }}
    />
  </div>
)}

								</div>
							</div>
							<h2>Guitar tabs / sheet music</h2>
							<TableDataFetcher threadId={threadData.id} userId={userId} />
						</div>
              {threadData.body_text && (
                <div className={styles.aboutMobileOnly}>
                  <h2>About</h2>
                  <div
                    className={styles.aboutSection}
                    dangerouslySetInnerHTML={{ __html: threadData.body_text }}
                  />
                </div>
              )}
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
  const threadData = await fetchThreadData(params.id);
  
	const forwardedFor = req.headers['x-forwarded-for'];
 	const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;

  const props = {
    threadData, 
    ip,
    // userId: userSession?.id || null, 
  };

  return { props };
}

