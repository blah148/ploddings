import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import PloddingsAlphaTabEmbed from '../components/PloddingsAlphaTabEmbed';
import { generateSightReadingExercise } from '../utils/sightReadingGenerator';

export default function SightReadingTest() {
  const [bars, setBars] = useState(8);
  const [doubleStopProb, setDoubleStopProb] = useState(0.35);
  const [seed, setSeed] = useState(0);

  // Regenerate the MusicXML whenever the controls change. useMemo with `seed`
  // in the deps gives us a one-click "new exercise" via setSeed(s => s + 1).
  const xml = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => generateSightReadingExercise({ bars, doubleStopProb }),
    [bars, doubleStopProb, seed],
  );

  // Wrap the XML in a Blob URL — the embed fetches a URL, so this is the
  // cheapest way to hand it client-generated content. Revoke previous URLs
  // so they don't pile up in memory across regenerates.
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [xml]);

  return (
    <>
      <Head>
        <title>Sight Reading Generator | Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ fontFamily: 'sans-serif', padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '4px' }}>
          Sight Reading — Am | Bb7♯11
        </h1>
        <p style={{ fontSize: '13px', color: '#555', marginTop: 0 }}>
          Beats 1–2 sit in A minor; beats 3–4 shift to Bb mixolydian ♯11. The
          scales share C–D–E–F–G, so only A↔Bb and B↔Ab move by a semitone
          across the bar — fingers learn to relocate on those pitches.
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', margin: '16px 0' }}>
          <button
            onClick={() => setSeed((s) => s + 1)}
            style={{
              background: '#f07820', color: '#fff', border: 'none',
              padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
            }}
          >
            ↻ Generate New
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            Bars
            <input
              type="number"
              min="2"
              max="32"
              value={bars}
              onChange={(e) => setBars(Math.max(2, Math.min(32, parseInt(e.target.value, 10) || 8)))}
              style={{ width: '60px', padding: '4px 6px' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            Double-stop density
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={doubleStopProb}
              onChange={(e) => setDoubleStopProb(parseFloat(e.target.value))}
              style={{ width: '160px', accentColor: '#f07820' }}
            />
            <span style={{ width: '38px', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(doubleStopProb * 100)}%
            </span>
          </label>
        </div>

        {url && <PloddingsAlphaTabEmbed musicXMLUrl={url} />}
      </div>
    </>
  );
}
