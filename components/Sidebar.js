import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
import useGuestStore from '../zustandStore_guest';
import { useLoading } from '../context/LoadingContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ userId, isAuthenticated, ip }) {

	const { isLoading, startLoading, stopLoading } = useLoading();

  const {
    visitHistory,
    starred,
    beingWatched,
    fetchAndSetVisitHistory,
    fetchAndSetStarred,
    fetchAndSetBeingWatched,
    objectLimit,
    groupMax,
  } = useStore();
	
  const guestStore = useGuestStore();
	const { starredCount } = guestStore;
	
	const effectiveObjectLimit = isAuthenticated ? objectLimit : objectLimit - starredCount;

	useEffect(() => {
		// Start loading
		startLoading();
		
		// Async IIFE
		(async () => {
			try {
				if (!userId && !isAuthenticated) {
					// Initialize guest data loading
					guestStore.initialize();
				} else {
					// Fetch data for authenticated users
					await fetchAndSetStarred(userId, groupMax);
				}
				
				// Fetch visit history for all users
				await fetchAndSetVisitHistory(userId, groupMax, ip);

				if (effectiveObjectLimit > 0 && userId != null) {
					// Fetch being watched data if conditions are met
					await fetchAndSetBeingWatched(userId, ip, effectiveObjectLimit);
				}
			} catch (error) {
				console.error("An error occurred during data fetching:", error);
			} finally {
				// Stop loading regardless of success or error
				stopLoading();
			}
		})();
	}, [effectiveObjectLimit, userId, isAuthenticated, guestStore, fetchAndSetStarred, fetchAndSetVisitHistory, fetchAndSetBeingWatched, groupMax, ip]);

	function getLedClassName(pageType) {
		switch (pageType.toLowerCase()) {
			case 'songs':
				return styles.songsLed;
			case 'threads':
				return styles.threadsLed;
			case 'blog':
				return styles.blogLed;
			default:
				return ''; // Default class or no class
		}
	}
	
	console.log('testing threads', getLedClassName("threads"));

  // Determine which data to display based on authentication state
  const displayVisitHistory = visitHistory;
  const displayStarred = !userId && !isAuthenticated ? guestStore.starred : starred;
  const displayBeingWatched = beingWatched;

	return (
		<div className={styles.sidebarContainer}>
			<Link href="/" legacyBehavior>
				<a className={styles.returnHome}>
					<svg
						role="img"
						height="22"
						width="22"
						aria-hidden="true"
						className="Svg-sc-ytk21e-0 haNxPq home-active-icon"
						viewBox="0 0 24 24"
						data-encore-id="icon"
					> 
						<path style={{ fill: 'currentColor' }} className={styles.homePath} d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732 V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z">
						</path>
					</svg>
					<div>Home</div>
				</a>
			</Link>
			<div>
				<h2>Visit History</h2>
				<ul>
					{displayVisitHistory.map((visit, index) => (
						<li className={styles.listElement} key={visit.page_id}>
							<a className={styles.listLink} href={`/${visit.page_type}/${visit.slug}`}>
								{visit.name}
							</a>
							<div className={`${styles.led} ${getLedClassName(visit.page_type)}`}></div>
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Starred</h2>
				<ul>
					{displayStarred.map((star, index) => (
						<li className={styles.listElement} key={star.page_id}>
							<a href={`/${star.page_type}/${star.slug}`} className={styles.listLink}>
								{star.name}
							</a>
							<div className={`${styles.led} ${getLedClassName(star.page_type)}`}></div>
						</li> 
					))}
				</ul>
			</div>
			<div>
				<h2>Being Watched</h2>
				<ul>
					{displayBeingWatched.map((watch, index) => (
						<li key={watch.page_id} className={styles.listElement}>
							<a href={`/${watch.page_type}/${watch.slug}`} className={styles.listLink}>
								{watch.name}
							</a>
							<div className={`${styles.led} ${getLedClassName(watch.page_type)}`}></div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
