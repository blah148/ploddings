import { useRouter } from 'next/router';
const { fetchSlugsFromTable, fetchDataBySlug } = require('../../db-utilities');

export default function Song({ songData }) {
  const router = useRouter();
  const { id } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{songData.song_name}</h1>
      <p>{songData.meta_description}</p>
      {/* Render other song details */}
    </div>
  );
}

export async function getStaticPaths() {
  // Fetch the list of slugs from your songs table
  const slugs = await fetchSlugsFromTable('songs');
  const paths = slugs.map(slug => ({
    params: { id: slug },
  }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  // Fetch the song data based on the slug
  const songData = await fetchDataBySlug('songs', params.id);
  return { props: { songData } };
}

