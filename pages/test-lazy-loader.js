import React from 'react';
import LazyLoadedDiv from '../components/relatedContentGrid';

const TestPage = () => {
  return (
    <div>
      {/* Full-height div with grey background */}
      <div style={{ minHeight: '100vh', backgroundColor: 'grey' }}></div>

      {/* LazyLoadedDiv component */}
      <LazyLoadedDiv page_type="songs" category_id={1} currentSongId={187} />

      {/* Additional content can be added here */}
    </div>
  );
};

export default TestPage;

