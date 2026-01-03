
"use client";


import { supabase } from '../utils/supabase';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useStore from '../zustandStore';
import { useLoading } from '../context/LoadingContext';
import styles from './Sidebar.module.css';
import LoadingLink from '../components/LoadingLink';
import { useRouter } from 'next/router';  // ✅ import router

export default function Sidebar({ userId, ip }) {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter(); // ✅ get router instance

  // Destructure state and fetch methods from the store
  const {
    visitHistory,
    starred,
    beingWatched,
    fetchAndSetVisitHistory,
    fetchAndSetBeingWatched,
    groupMax,
  } = useStore();

  // Fetch visitHistory and beingWatched only on component mount
  useEffect(() => {
    startLoading();
    (async () => {
      try {
        await fetchAndSetVisitHistory(userId, ip, 4);
        await fetchAndSetBeingWatched(userId, ip, 7);
      } catch (error) {
        console.error("An error occurred during data fetching:", error);
      } finally {
        stopLoading();
      }
    })();
  }, []);

  // ✅ decide header text based on current route
  const headerText =
    router.pathname === "/"
      ? "PLODDINGS"
      : "Back to Pre-War Blues Tabs";

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.returnHome} legacyBehavior>
          {headerText}
        </Link>
      </div>
      <div className={styles.sidebarItems}>
        {visitHistory && (
          <div>
            <h2>History</h2>
            <ul>
              {visitHistory.map((visit) => (
                <li className={styles.listElement} key={visit.id}>
                  <LoadingLink
                    className={styles.listLink}
                    href={`/${visit.page_type}/${visit.slug}`}
                    passHref
                  >
                    <Image
                      width={40}
                      height={40}
                      className={styles.sidebarThumbnail}
                      src={
                        visit.thumbnail_200x200
                          ? visit.thumbnail_200x200
                          : "https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp"
                      }
                      alt={visit.featured_img_alt_text}
                    />
                    <div className={styles.sidebarName}>
                      {visit.name.length > 22
                        ? visit.name.slice(0, 22) + "..."
                        : visit.name}
                    </div>
                    <div
                      className={`led ${
                        visit.user_active_membership ? "unlocked" : "locked"
                      }`}
                    ></div>
                  </LoadingLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {beingWatched && (
          <div>
            <h2>Being watched</h2>
            <ul>
              {beingWatched.map((watch) => (
                <li key={watch.id} className={styles.listElement}>
                  <LoadingLink
                    className={styles.listLink}
                    href={`/${watch.page_type}/${watch.slug}`}
                    passHref
                  >
                    <Image
                      width={40}
                      height={40}
                      className={styles.sidebarThumbnail}
                      src={
                        watch.thumbnail_200x200
                          ? watch.thumbnail_200x200
                          : "https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px/ploddings_default_200x200.webp"
                      }
                      alt={watch.featured_img_alt_text}
                    />
                    <div className={styles.sidebarName}>
                      {watch.name.length > 22
                        ? watch.name.slice(0, 22) + "..."
                        : watch.name}
                    </div>
                    <div
                      className={`led ${
                        watch.user_active_membership ? "unlocked" : "locked"
                      }`}
                    ></div>
                  </LoadingLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

