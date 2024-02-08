import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
import useGuestStore from '../zustandStore_guest';

export default function Sidebar({ userId, isAuthenticated, ip }) {
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
		// Initialize guest data loading
		if (!userId && !isAuthenticated) {
			guestStore.initialize();
		} else {
			// For authenticated users, fetch from the server or database
			fetchAndSetStarred(userId, groupMax);
		}
		// Execute for both authenticated and unauthenticated users if objectLimit > 0
		fetchAndSetVisitHistory(userId, groupMax, ip);

		if (effectiveObjectLimit > 0 && userId != null) {
			fetchAndSetBeingWatched(userId, ip, effectiveObjectLimit);
		}
	}, [effectiveObjectLimit, userId]);

  // Determine which data to display based on authentication state
  const displayVisitHistory = visitHistory;
  const displayStarred = !userId && !isAuthenticated ? guestStore.starred : starred;
  const displayBeingWatched = beingWatched;

	return (
		<div>
		<Link href="/" legacyBehavior>
			<a>
				<svg
					role="img"
					height="22"
					width="22"
					aria-hidden="true"
					className="Svg-sc-ytk21e-0 haNxPq home-active-icon"
					viewBox="0 0 24 24"
					data-encore-id="icon"
				> 
					<path style={{ fill: 'white' }} d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732 V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z">
					</path>
				</svg>
				<div>Home</div>
			</a>
		</Link>
			<div>
				<h2>Visit History</h2>
				<ul>
					{displayVisitHistory.map((visit, index) => (
						<li key={index}>
							{visit.page_type} - {visit.name} - {visit.slug}
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Starred</h2>
				<ul>
					{displayStarred.map((star, index) => (
						<li key={index}>
							{star.page_type} - {star.name} - {star.slug}
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Being Watched</h2>
				<ul>
					{displayBeingWatched.map((watch, index) => (
						<li key={index}>
							{watch.page_type} - {watch.name} - {watch.slug}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
