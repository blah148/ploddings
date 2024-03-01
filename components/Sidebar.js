import { supabase } from '../utils/supabase';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
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
    fetchAndSetStarred(userId, 3, ip);
  }, [userId, fetchAndSetStarred, groupMax, ip]);

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
				{starred && (
					<div>
						<h2>Starred</h2>
						<ul>
							{starred.map((star, index) => (
								<li className={styles.listElement} key={star.content.id}>
									<a className={styles.listLink} href={`/${star.content.page_type}/${star.content.slug}`}>
										<img
											className={styles.sidebarThumbnail}
											src={star.content.thumbnail_200x200 ? star.content.thumbnail_200x200 : 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp'}
											alt={star.content.featured_img_alt_text}
										/>
										<div className={styles.sidebarName}>{star.content.name.length > 22 ? star.content.name.slice(0, 22) + '...' : star.content.name}</div>
										<div className="led"></div>
									</a>
								</li>
							))}
						</ul>
					</div>
				)}
				{visitHistory && (<div>
					<h2>History</h2>
					<ul>
						{visitHistory.map((visit, index) => (
							<li className={styles.listElement} key={visit.content.id}>
								<a className={styles.listLink} href={`/${visit.content.page_type}/${visit.content.slug}`}>
									<img
										className={styles.sidebarThumbnail}
										src={visit.content.thumbnail_200x200 ? visit.content.thumbnail_200x200 : 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp'}
										alt={visit.content.featured_img_alt_text}
									/>
									<div className={styles.sidebarName}>{visit.content.name.length > 22 ? visit.content.name.slice(0, 22) + '...' : visit.content.name}</div>
									<div className="led"></div>
								</a>
							</li>
						))}
					</ul>
				</div>)}
				{beingWatched && (<div>
					<h2>Being watched</h2>
					<ul>
						{beingWatched.map((watch, index) => (
							<li key={watch.content.id} className={styles.listElement}>
								<a className={styles.listLink} href={`/${watch.content.page_type}/${watch.content.slug}`}>
									<img
										className={styles.sidebarThumbnail}
										src={watch.content.thumbnail_200x200 ? watch.content.thumbnail_200x200 : 'https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp'}
										alt={watch.content.featured_img_alt_text}
									/>
									<div className={styles.sidebarName}>{watch.content.name.length > 22 ? watch.content.name.slice(0, 22) + '...' : watch.content.name}</div>
									<div className="led"></div>
								</a>
							</li>
						))}
					</ul>
				</div>)}
			</div>
		</div>
	);
}
