import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import fetchVisitHistory from './fetchVisitHistory.js';
import fetchStarred from './fetchStarred.js';
import fetchBeingWatched from './fetchBeingWatched.js';

export default function Sidebar({ userId, isAuthenticated, ip }) {

	const [visitHistory, setVisitHistory] = useState([]);
	const [starred, setStarred] = useState([]);
	const [beingWatched, setBeingWatched] = useState([]);
	const maximumObjects = 8;
	const [objectLimit, setObjectLimit] = useState(maximumObjects);
	const groupMax = 3;
  const [starredCount, setStarredCount] = useState(0);
  const [visitHistoryCount, setVisitHistoryCount] = useState(0);

	useEffect(() => {
		if (userId) {
			fetchStarred(userId, groupMax)
				.then(({ data, count }) => {
					setStarred(data);
					setStarredCount(count);
					console.log('Count of starred items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch starred:', error);
				});
		}
	}, [userId]);

	useEffect(() => {
		if (userId) {
			fetchVisitHistory(userId, groupMax)
				.then(({ data, count }) => {
					setVisitHistory(data);
					setVisitHistoryCount(count);
					console.log('Count of visit history items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch visit history:', error);
				});
		}
	}, [userId]);

  useEffect(() => {
    // Recalculate objectLimit based on the fetched counts
    const usedSpace = starredCount + visitHistoryCount;
    const remainingSpace = maximumObjects - usedSpace;
    setObjectLimit(Math.max(remainingSpace, 0)); // Ensure it doesn't go negative
  }, [starredCount, visitHistoryCount]);
	
  useEffect(() => {
    // Ensure objectLimit is passed correctly and only fetch when necessary
    if (objectLimit > 0) {
			console.log('heres some data', userId, ip, objectLimit);
      fetchBeingWatched(userId, ip, objectLimit)
        .then(({ data, count }) => {
          setBeingWatched(data);
					console.log('this is the beingWatched data', data);
          console.log('Count of being watched items:', count);
        })
        .catch(error => {
          console.error('Failed to fetch being watched:', error);
      });
    }
  }, [userId, ip, objectLimit]); // Ensure useEffect triggers when objectLimit changes

	return (
		<div>
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
					<path style={{ fill: 'white' }} d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732 V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1 .732l-7.5-4.33z">
					</path>
				</svg>
				<div>Home</div>
			</a>
		</div>
	);
}
