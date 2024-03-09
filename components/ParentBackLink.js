import React from 'react';
import { useRouter } from 'next/router'; // Import useRouter from Next.js for accessing router
import { useEffect } from 'react'; // Import useEffect for side effects
import { useLoading } from '../context/LoadingContext';
import Link from 'next/link'; // Import Link from Next.js for navigation
import styles from '../styles/songs.module.css';

export default function IpodMenuLink({ threadData, fallBack }) {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const router = useRouter();

  // Determine the href dynamically: use threadData if available, otherwise fallBack
  const href = threadData && threadData.page_type && threadData.slug
               ? `/${threadData.page_type}/${threadData.slug}`
               : `/${fallBack}`;

  useEffect(() => {
    const handleRouteChange = () => {
      // Stop loading when the route changes
      stopLoading();
    };

    // Subscribe to router events
    router.events.on('routeChangeStart', startLoading);
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('routeChangeError', handleRouteChange);

    // Clean up subscription when component is unmounted
    return () => {
      router.events.off('routeChangeStart', startLoading);
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('routeChangeError', handleRouteChange);
    };
  }, []); // Empty dependency array to only run effect once

  return (
    <Link href={href} passHref>
      <div className={styles.upLevel}>
        <div className="previousButton">
          <svg role="img" height="16" width="16" aria-hidden="true" className="Svg-sc-yt k21e-0 leya-dW IYDlXmBmmUKHveMzIPCF" viewBox="0 0 16 16" data-encore-id="icon" style={{ marginBottom: 0 }}>
            <path fill="currentColor" d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
}

