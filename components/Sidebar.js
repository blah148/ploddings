import { useAuth } from '../context/AuthContext';
import { supabase } from './utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {

	const { isAuthenticated, login, logout } = useAuth();
	const [visitHistory, setVisitHistory] = useState([]);
	const [starred, setStarred] = useState([]);

	useEffect(() => {
		if (userId) {
			fetchStarred(userId)
				.then(({ data, count }) => {
					setStarred(data);
					console.log('Count of starred items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch starred:', error);
				});
		}
	}, [userId]);

	useEffect(() => {
		if (userId) {
			fetchVisitHistory(userId)
				.then(({ data, count }) => {
					setVisitHistory(data);
					console.log('Count of visit history items:', count);
				})
				.catch(error => {
					console.error('Failed to fetch visit history:', error);
				});
		}
	}, [userId]);

	return (
		<div>
			<Link href="/"><a>
				<svg role="img" height="22" width="22" aria-hidden="true" class="Svg-sc-ytk21e-0 haNxPq home-active-icon" viewBox="0 0 24 24" data-encore-id="icon">
					<path style="fill: white" d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z">
					</path>
				</svg>
				<div>Home</div>
			</a></Link>
			
			

		



		</div>

	);
}
