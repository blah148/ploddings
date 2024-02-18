import React from 'react';
import Link from 'next/link'; // Import Link from Next.js for navigation

export default function ParentLink({ page_type, parentLink }) {
  return (
    <Link href={`/${page_type}/${parentLink}`} passHref> {/* Use Link component for navigation */}
      <div className="previous-button w-inline-block">
        <div className="html-embed-71 w-embed">
          <svg role="img" height="auto" width="auto" aria-hidden="true" className="Svg-sc-ytk21e-0 leya-dW IYDlXmBmmUKHveMzIPCF" viewBox="0 0 16 16" data-encore-id="icon" style={{ marginBottom: 0 }}>
            <path fill="currentColor" d="M11.03.47a.75.75 0 0 1 0 1.06L4.56 8l6.47 6.47a.75.75 0 1 1-1.06 1.06L2.44 8 9.97.47a.75.75 0 0 1 1.06 0z"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
}

