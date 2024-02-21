import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../pages/utils/supabase'; // Adjust this import path as needed
import { useLoading } from '../context/LoadingContext';
import LeftChevron from './LeftChevron';
import RightChevron from './RightChevron';
import styles from '../styles/songs.module.css';

export default function Pagination({ sibling_previous, sibling_next }) {
  const [previousPage, setPreviousPage] = useState(null);
  const [nextPage, setNextPage] = useState(null);
	const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchSiblingPages = async () => {
			startLoading();
      // Fetch previous page
      if (sibling_previous) {
        const { data: previousData, error: previousError } = await supabase
          .from('content')
          .select('pagination_title, slug, page_type')
          .eq('id', sibling_previous)
          .single();

        if (!previousError && previousData) {
          setPreviousPage(previousData);
        }
      }

      // Fetch next page
      if (sibling_next) {
        const { data: nextData, error: nextError } = await supabase
          .from('content')
          .select('pagination_title, slug, page_type')
          .eq('id', sibling_next)
          .single();

        if (!nextError && nextData) {
          setNextPage(nextData);
        }
				
				stopLoading();
      }
    };

    fetchSiblingPages();
  }, [sibling_previous, sibling_next]); // Fetch data again if these props change

  return (
    <div className={styles.paginationContainer}>
      {previousPage && (
        <div className={`${styles.paginationBlog} ${styles.previous}`}>
          <Link href={`/${previousPage.page_type}/${previousPage.slug}`} passHref>
						<LeftChevron />
            <div>{previousPage.pagination_title}</div>
          </Link>
        </div>
      )}
      {nextPage && (
        <div className={`${styles.paginationBlog} ${styles.next}`}>
          <Link href={`/${nextPage.page_type}/${nextPage.slug}`} passHref>
            <div>{nextPage.pagination_title}</div>
						<RightChevron />
          </Link>
        </div>
      )}
    </div>
  );
}

