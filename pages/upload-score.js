import { useEffect, useState } from 'react';
import Head from 'next/head';
import PloddingsAlphaTabEmbed from '../components/PloddingsAlphaTabEmbed';

export default function UploadScore() {
  const [blobUrl, setBlobUrl] = useState(null);
  const [uploadName, setUploadName] = useState(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadName(file.name);
    // Build a blob URL from the file so the embed (which only accepts a URL) can fetch it locally.
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  return (
    <>
      <Head>
        <title>Upload Score — Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{
            display: 'inline-block', padding: '6px 14px', background: '#1a1a2e',
            color: '#ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
          }}>
            Upload MusicXML
            <input type="file" accept=".musicxml,.xml,.mxl" onChange={handleFileUpload}
              style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {uploadName || 'Pick a .musicxml, .xml, or .mxl file to preview it through the Ploddings player'}
          </span>
        </div>

        {blobUrl && (
          <PloddingsAlphaTabEmbed
            key={uploadName /* re-init the player whenever a new file is loaded */}
            musicXMLUrl={blobUrl}
          />
        )}
      </div>
    </>
  );
}
