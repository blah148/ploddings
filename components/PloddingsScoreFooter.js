import { useState } from 'react';

// Footer + share/embed CTA for the PloddingsScoreEmbed.
// Extracted into its own component so the attribution row, Blahnok credit,
// and "Embed this sheet music" CTA can be styled / iterated independently.
export default function PloddingsScoreFooter({ songSlug = '' }) {
  const [copied, setCopied] = useState(false);
  const embedCode = `<iframe src="https://www.ploddings.com/embed/${songSlug}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Attribution row: Powered by Ploddings (links home) + Transcribed by Blahnok */}
      <div className="pl-footer" style={{
        padding: '10px 16px', background: '#f5f5f5',
        borderTop: '1px solid #000',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '12px', color: '#777',
      }}>
        <a href="/" style={{ color: '#999', textDecoration: 'none' }}>
          Powered by <strong style={{ color: '#f07820' }}>Ploddings</strong>
        </a>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Transcribed by <a href="https://blahnok.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#f07820', textDecoration: 'none', fontWeight: 600 }}>Blahnok</a>
        </span>
      </div>

      {/* Share / embed CTA */}
      <div className="pl-share-row" style={{
        padding: '12px 16px 16px',
        background: '#f9f9f9',
        borderTop: '1px solid #ddd',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Embed this sheet music on your site</span>
          <button
            onClick={handleCopy}
            style={{
              fontSize: '11px', padding: '3px 10px',
              border: '1px solid #ccc', borderRadius: '4px',
              background: copied ? '#e8f5e9' : '#fff',
              color: copied ? '#2e7d32' : '#555',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          readOnly value={embedCode} onClick={(e) => e.target.select()}
          style={{
            width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '11px',
            border: '1px solid #ddd', borderRadius: '4px', background: '#fff',
            resize: 'none', height: '50px', boxSizing: 'border-box', color: '#444',
          }}
        />
      </div>
    </>
  );
}
