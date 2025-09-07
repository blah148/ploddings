import Script from 'next/script';

export default function YouTubeSubscribe() {
  return (
    <div>
      {/* Load Google Platform script */}
      <Script src="https://apis.google.com/js/platform.js" strategy="afterInteractive" />

      {/* Native YouTube Subscribe Button */}
      <div
        className="g-ytsubscribe"
        data-channel="blah148"
        data-layout="full"
        data-count="default"
      ></div>
    </div>
  );
}

