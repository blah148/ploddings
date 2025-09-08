// components/YouTubeSubscribe.js
import Script from 'next/script';
import { useEffect } from 'react';

export default function YouTubeSubscribe() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gapi?.ytsubscribe) {
      window.gapi.ytsubscribe.go();
    }
  }, []);

  return (
    <div>
      <Script
        src="https://apis.google.com/js/platform.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.gapi?.ytsubscribe) {
            window.gapi.ytsubscribe.go();
          }
        }}
      />

      <div
        className="g-ytsubscribe"
        data-channel="blah148"
        data-layout="full"
        data-count="default"
      ></div>
    </div>
  );
}

