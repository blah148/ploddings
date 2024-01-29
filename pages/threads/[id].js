// Access to: pathname, query, asPath, route
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
// Centralized location to globally manage database queries/operations
const { fetchSlugsFromTable, fetchDataBySlug } = require('../../db-utilities');

export default function Thread({ threadData }) {
  // Initializing router object, containing info about current route
  const router = useRouter();
  // Destructures the "id" parameter from the router.query property      
  const { id } = router.query;

  // Conditional rendering while there's fetching from the db about dynamic id
  if (router.isFallback) {
    return <div>Loading...</div>;
  } 
   
  return (
    <div>
      <h1>{threadData.thread_name}</h1>
			<img src={threadData.featured_img_550px}/>
			<div>{threadData.blurb}</div>
			{threadData.life_and_death && (<div>{threadData.life_and_death}</div>
)}			
    </div>
  );
} 

export async function getStaticPaths() {
  // Fetch the list of slugs from your threads table
  const slugs = await fetchSlugsFromTable('threads');
  const paths = slugs.map(slug => ({
    params: { id: slug },
  }));
   
  return { paths, fallback: true };
} 

export async function getStaticProps({ params }) {
  // Fetch the thread data based on the slug
  const threadData = await fetchDataBySlug('threads', params.id);
  return { props: { threadData } };
} 

