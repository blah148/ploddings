import { supabase } from '../pages/utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';

export default function Sidebar({ userId, isAuthenticated, ip }) {
  // Destructure the necessary states and actions from the store
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

  // Effect to fetch visit history and starred items
  useEffect(() => {
    if (userId) {
      fetchAndSetStarred(userId, groupMax);
      fetchAndSetVisitHistory(userId, groupMax);
    }
  }, [userId, fetchAndSetStarred, fetchAndSetVisitHistory, groupMax]);

  // Effect to fetch being watched items
  useEffect(() => {
    if (userId && ip && objectLimit > 0) {
      fetchAndSetBeingWatched(userId, ip, objectLimit);
    }
  }, [userId, ip, objectLimit, fetchAndSetBeingWatched]);

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
			<div>
				<h2>Visit History</h2>
				<ul>
					{visitHistory.map((visit, index) => (
						<li key={index}>
							{visit.page_type} - {visit.page_id} - {new Date(visit.visited_at).toLocaleString()}
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Starred</h2>
				<ul>
					{starred.map((star, index) => (
						<li key={index}>
							{star.page_type} - {star.page_id} - {new Date(star.created_at).toLocaleString()}
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Being Watched</h2>
				<ul>
					{beingWatched.map((watch, index) => (
						<li key={index}>
							{watch.page_type} - {watch.page_id} - {new Date(watch.created_at).toLocaleString()}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
