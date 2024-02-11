import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
import useGuestStore from '../zustandStore_guest';
import ResizePanes from './SidebarResizers';

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

		if (userId != null) {
			fetchAndSetBeingWatched(userId, ip, groupMax);
		}
	}, [userId]);

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
		  <ResizePanes displayVisitHistory={displayVisitHistory} displayStarred={displayStarred} displayBeingWatched={displayBeingWatched} />
		</div>
	);
}
