import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
import useGuestStore from '../zustandStore_guest';
import { useLoading } from '../context/LoadingContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ userId, ip }) {
  const { startLoading, stopLoading } = useLoading();

  // Destructure state and fetch methods from the store
  const {
    visitHistory,
    starred,
    beingWatched,
    fetchAndSetVisitHistory,
    fetchAndSetBeingWatched,
    fetchAndSetStarred,
    groupMax,
  } = useStore();

  // Fetch visitHistory and beingWatched only on component mount
  useEffect(() => {
    startLoading();
    (async () => {
      try {
        await fetchAndSetVisitHistory(userId, groupMax, ip);
        await fetchAndSetBeingWatched(userId, ip, groupMax);
      } catch (error) {
        console.error("An error occurred during data fetching:", error);
      } finally {
        stopLoading();
      }
    })();
    // Empty dependency array to ensure this runs only once on component mount
  }, []);

  // Separate effect for fetching starred data to allow updates within the page session
  useEffect(() => {
    // This can be triggered by any event or condition that requires refreshing starred data
    // For demonstration, it's set to refresh on userId
    fetchAndSetStarred(userId, groupMax, ip);
  }, [userId, fetchAndSetStarred, groupMax, ip]);

  // Function to determine class name based on page type
  function getLedClassName(pageType) {
    switch (pageType.toLowerCase()) {
      case 'song': return styles.songsLed;
      case 'thread': return styles.threadsLed;
      case 'blog': return styles.blogLed;
      default: return '';
    }
  }	

  // Determine which data to display based on authentication state
  const displayVisitHistory = visitHistory;
  const displayStarred = starred;
  const displayBeingWatched = beingWatched;

	return (
		<div className={styles.sidebarContainer}>
			<div className={styles.sidebarHeader}>
				<Link href="/" legacyBehavior>
					<a className={styles.returnHome}>
						PLODDINGS
					</a>
				</Link>
			</div>
			<div className={styles.sidebarItems}>
				{displayStarred && (
					<div>
						<h2>Starred</h2>
						<ul>
							{displayStarred.map((star, index) => (
								<li className={styles.listElement} key={star.id}>
									<a className={styles.listLink} href={`/${star.page_type}/${star.slug}`}>
										<div>
											{star.name.length > 26 ? star.name.slice(0, 26) + '...' : star.name}
										</div>
										<div className={`${styles.led} ${getLedClassName(star.page_type)}`}></div>
									</a>
								</li>
							))}
						</ul>
					</div>
				)}
				{displayVisitHistory && (<div>
					<h2>History</h2>
					<ul>
						{displayVisitHistory.map((visit, index) => (
							<li className={styles.listElement} key={visit.id}>
								<a className={styles.listLink} href={`/${visit.page_type}/${visit.slug}`}>
									<div>
										{visit.name.length > 26 ? visit.name.slice(0, 26) + '...' : visit.name}
									</div>
									<div className={`${styles.led} ${getLedClassName(visit.page_type)}`}></div>
								</a>
							</li>
						))}
					</ul>
				</div>)}
				{displayBeingWatched && (<div>
					<h2>Being watched</h2>
					<ul>
						{displayBeingWatched.map((watch, index) => (
							<li key={watch.id} className={styles.listElement}>
								<a className={styles.listLink} href={`/${watch.page_type}/${watch.slug}`}>
									<div>
										{watch.name.length > 26 ? watch.name.slice(0, 26) + '...' : watch.name}
									</div>
									<div className={`${styles.led} ${getLedClassName(watch.page_type)}`}></div>
								</a>
							</li>
						))}
					</ul>
				</div>)}
			</div>
		</div>
	);
}
