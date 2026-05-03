import { useState } from 'react';
import Head from 'next/head';
import PloddingsScoreEmbed from '../components/PloddingsScoreEmbed';

export default function UploadScore() {
  const [xmlText, setXmlText] = useState(null);
  const [uploadName, setUploadName] = useState(null);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadName(file.name);
      setXmlText(ev.target.result);
    };
    reader.readAsText(file);
  }

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
            <input type="file" accept=".musicxml,.xml" onChange={handleFileUpload}
              style={{ display: 'none' }} />
          </label>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {uploadName || 'Pick a .musicxml or .xml file to preview it through the Ploddings player'}
          </span>
        </div>
      </div>

      {xmlText && (
        <PloddingsScoreEmbed
          key={uploadName /* re-init the player whenever a new file is loaded */}
          musicXMLText={xmlText}
          songName="Uploaded Score"
          artistName=""
          songSlug="upload-preview"
        />
      )}
    </>
  );
}
