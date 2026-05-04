import { useState } from 'react';

/**
 * Footer that sits beneath the score embed: attribution row + embed-snippet helper.
 * Pure CSS-in-JS via a scoped <style> block so flex alignment and hover/focus states behave consistently.
 *
 * Props:
 *   songSlug — the song's slug, used to build the embed URL.
 */
export default function PloddingsScoreFooter({ songSlug }) {
  const [copied, setCopied] = useState(false);

  const embedSnippet = songSlug
    ? `<iframe src="https://www.ploddings.com/embed/${songSlug}" width="100%" height="800" frameborder="0" scrolling="no"></iframe>`
    : '';

  function handleCopy() {
    if (!embedSnippet || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(embedSnippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ploddings-footer {
          background: #fafafa;
          border: 1px solid #e3e3e3;
          border-top: none;
          border-radius: 0 0 4px 4px;
          padding: 0 16px;
          font-family: sans-serif;
          color: #555;
          margin-top: -1px;
        }
        .ploddings-footer-attrib {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px 0;
          font-size: 12px;
          font-weight: 400;
          line-height: 1;
        }
        .ploddings-footer-attrib a {
          color: #555;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .ploddings-footer-attrib a:hover { color: #222; }
        .ploddings-footer-attrib a .accent { color: #f07820; }
        .ploddings-footer-embed {
          padding: 16px 0 18px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        .ploddings-footer-embed-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .ploddings-footer-embed-label {
          font-size: 12px;
          color: #555;
          line-height: 1;
        }
        .ploddings-footer-copy {
          appearance: none;
          -webkit-appearance: none;
          background: #ececec;
          color: #333;
          border: 1px solid #d8d8d8;
          margin: 0;
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: none;
          font-family: inherit;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .ploddings-footer-copy:hover { background: #e0e0e0; border-color: #c8c8c8; }
        .ploddings-footer-copy.copied {
          background: #2ac64f; color: #fff; border-color: #25b347;
        }
        .ploddings-footer-snippet {
          width: 100%;
          padding: 12px 12px;
          font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
          font-size: 12px;
          color: #333;
          background: #fff;
          border: 1px solid #d8d8d8;
          border-radius: 4px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .ploddings-footer-snippet:focus { border-color: #888; }
        @media (max-width: 540px) {
          .ploddings-footer-attrib { padding: 14px 0; }
          .ploddings-footer-attrib a { font-size: 12px; }
        }
      ` }} />
      <div className="ploddings-footer">
        {/* Row 1 — attribution */}
        <div className="ploddings-footer-attrib">
          <a href="/">
            Powered by <span className="accent">Ploddings</span>
          </a>
          <a href="https://blahnok.com" target="_blank" rel="noopener noreferrer">
            Transcribed by <span className="accent">Blahnok</span>
          </a>
        </div>
        {/* Row 2 — embed CTA + snippet */}
        {songSlug && (
          <div className="ploddings-footer-embed">
            <div className="ploddings-footer-embed-row">
              <span className="ploddings-footer-embed-label">Embed this sheet music on your site</span>
              <button
                type="button"
                onClick={handleCopy}
                className={`ploddings-footer-copy${copied ? ' copied' : ''}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <input
              className="ploddings-footer-snippet"
              type="text"
              value={embedSnippet}
              readOnly
              onFocus={(e) => e.target.select()}
            />
          </div>
        )}
      </div>
    </>
  );
}
