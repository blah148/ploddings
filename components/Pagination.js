import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../pages/utils/supabase'; // Adjust this import path as needed

export default function Pagination({ sibling_previous, sibling_next }) {
  const [previousPage, setPreviousPage] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  useEffect(() => {
    const fetchSiblingPages = async () => {
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
      }
    };

    fetchSiblingPages();
  }, [sibling_previous, sibling_next]); // Fetch data again if these props change

  return (
    <div className="pagination-next-previous parent">
      {previousPage && (
        <div className="pagination-blog previous">
          <Link href={`/${previousPage.page_type}/${previousPage.slug}`} passHref>
            <div className="text-block-115">{previousPage.pagination_title}</div>
          </Link>
        </div>
      )}
      {nextPage && (
        <div className="pagination-blog next">
          <Link href={`/${nextPage.page_type}/${nextPage.slug}`} passHref>
            <div className="text-block-115">{nextPage.pagination_title}</div>
          </Link>
        </div>
      )}
    </div>
  );
}

