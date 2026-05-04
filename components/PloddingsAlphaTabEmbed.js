import { useEffect, useRef, useState } from 'react';

// Walk the raw MusicXML to collect articulations alphaTab's importer drops on the floor:
//   <scoop>   = slide up INTO a note (upward scoop)
//   <plop>    = slide down INTO a note
//   <doit>    = slide up OUT of a note
//   <falloff> = slide down OUT of a note
// Then map each match onto its alphaTab Note via (measure, voice, beat-in-voice, note-in-chord).
function applyScoops(alphaTab, score, xmlText) {
  const SlideInType = alphaTab.model?.SlideInType;
  const SlideOutType = alphaTab.model?.SlideOutType;
  if (!SlideInType || !SlideOutType) return 0;
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) return 0;

  const map = new Map(); // `${measureIdx}|${voice}|${beatIdx}|${noteIdx}` → { slideIn, slideOut }
  doc.querySelectorAll('part').forEach((part) => {
    part.querySelectorAll(':scope > measure').forEach((measure, measureIdx) => {
      const counters = new Map();
      measure.querySelectorAll(':scope > note').forEach((noteEl) => {
        const voiceEl = noteEl.querySelector(':scope > voice');
        const voice = voiceEl ? voiceEl.textContent.trim() : '1';
        const isChord = noteEl.querySelector(':scope > chord') !== null;
        if (!counters.has(voice)) counters.set(voice, { beatIdx: -1, noteIdx: 0 });
        const c = counters.get(voice);
        if (isChord) c.noteIdx++;
        else { c.beatIdx++; c.noteIdx = 0; }
        const art = noteEl.querySelector(':scope > notations > articulations');
        if (!art) return;
        const scoop = art.querySelector(':scope > scoop');
        const plop = art.querySelector(':scope > plop');
        const doit = art.querySelector(':scope > doit');
        const falloff = art.querySelector(':scope > falloff');
        if (!scoop && !plop && !doit && !falloff) return;
        map.set(`${measureIdx}|${voice}|${c.beatIdx}|${c.noteIdx}`, {
          slideIn: scoop ? SlideInType.IntoFromBelow : (plop ? SlideInType.IntoFromAbove : null),
          slideOut: doit ? SlideOutType.OutUp : (falloff ? SlideOutType.OutDown : null),
        });
      });
    });
  });
  if (map.size === 0) return 0;

  let applied = 0;
  score.tracks.forEach((track) => {
    track.staves.forEach((staff) => {
      staff.bars.forEach((bar, barIdx) => {
        bar.voices.forEach((voice, voiceIdx) => {
          const voiceId = String(voiceIdx + 1);
          voice.beats.forEach((beat, beatIdx) => {
            beat.notes.forEach((note, noteIdx) => {
              const info = map.get(`${barIdx}|${voiceId}|${beatIdx}|${noteIdx}`);
              if (!info) return;
              if (info.slideIn != null) note.slideInType = info.slideIn;
              if (info.slideOut != null) note.slideOutType = info.slideOut;
              applied++;
            });
          });
        });
      });
    });
  });
  return applied;
}

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Renders an alphaTab interactive score with synced playback, sticky play controls,
 * and post-render layout fixups (header collapse, tuning re-position, rest-shift, etc.).
 *
 * Props:
 *   musicXMLUrl  — URL to fetch the score from. Should return raw .musicxml or .mxl bytes.
 *                  (For Backblaze sources, wrap with /api/proxy-musicxml; for songs pages, use /api/score/[slug].)
 */
export default function PloddingsAlphaTabEmbed({ musicXMLUrl }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const scrubbingRef = useRef(false);
  const [status, setStatus] = useState('Initializing…');
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [tempo, setTempo] = useState(1.0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    let api;
    let cancelled = false;

    async function init() {
      try {
        // Dynamic import — alphaTab is browser-only and would break SSR
        const alphaTab = await import('@coderline/alphatab');
        if (cancelled) return;

        setStatus('Fetching score…');
        const buf = await fetch(musicXMLUrl).then((r) => {
          if (!r.ok) throw new Error(`Score fetch failed (${r.status})`);
          return r.arrayBuffer();
        });
        if (cancelled) return;
        // Text copy for post-load articulation extraction. Only valid for uncompressed .musicxml — .mxl yields garbage
        // and applyScoops returns 0 silently; that's fine.
        const xmlText = new TextDecoder('utf-8').decode(buf);
        setStatus('Initializing alphaTab…');

        const settings = {
          core: {
            fontDirectory: '/alphatab/font/',
            // Force SVG so we can target glyphs in the DOM (default 'default' resolves to Html5Canvas in this env).
            engine: 'svg',
            // Lazy loading defaults to true — placeholders are filled by an IntersectionObserver after postRenderFinished,
            // so DOM-mutation hooks would silently no-op. Disable so all systems are populated when our hook runs.
            enableLazyLoading: false,
          },
          player: {
            enablePlayer: true,
            enableCursor: true,
            enableUserInteraction: true,
            soundFont: '/alphatab/soundfont/sonivox.sf2',
            scrollElement: containerRef.current?.parentElement,
          },
          display: {
            layoutMode: 'page',
            staveProfile: 'default',
            scale: 1.0,
            // Honor source-file system breaks instead of letting alphaTab decide where to wrap.
            systemsLayoutMode: 'useModelLayout',
            // Stretch any non-full system (last one included) to full width.
            justifyLastSystem: true,
            resources: {
              // Default secondaryGlyphColor is rgba(0,0,0,100/255) — alphaTab uses it for voice 1+, making bass faint.
              secondaryGlyphColor: '#000000',
              barNumberColor: 'rgba(160, 160, 160, 0.6)',
            },
          },
          notation: {
            // showWithBars draws an individual stem on every beat (quarters included).
            rhythmMode: 'showWithBars',
            elements: {
              scoreTitle: true,
              scoreSubTitle: true,
              scoreArtist: true,
              scoreCopyright: false,
              // The lyricist/composer/words block duplicates dedicated tuning UI on /songs and the per-string list below.
              scoreWords: false,
              scoreMusic: false,
              scoreWordsAndMusic: false,
              guitarTuning: true,
              // Hide MusicXML rehearsal marks / direction text.
              effectMarker: false,
              effectDirections: false,
              effectText: false,
            },
          },
        };

        api = new alphaTab.AlphaTabApi(containerRef.current, settings);
        apiRef.current = api;
        // Boost output to approximate the social-platform loudness target (~-16 LUFS).
        // Sonivox peaks around -23 LUFS at masterVolume=1.0, so ~2.5x linear (~+8 dB) gets us there.
        api.masterVolume = 2.5;

        // Track each rest beat's voice index — postRenderFinished uses this to shift rests off the note row.
        const restBeatVoice = new Map();
        const collectRestBeatVoices = (score) => {
          restBeatVoice.clear();
          score.tracks.forEach((t) => t.staves.forEach((s) => s.bars.forEach((b) =>
            b.voices.forEach((v, vi) => v.beats.forEach((bt) => { if (bt.isRest) restBeatVoice.set(bt.id, vi); })),
          )));
        };

        api.scoreLoaded.on((score) => {
          if (cancelled) return;
          setStatus(null);
          // Bar numbers only at the first bar of each system.
          try {
            const BND = alphaTab.model?.BarNumberDisplay;
            if (BND && score.stylesheet) score.stylesheet.barNumberDisplay = BND.FirstOfSystem;
          } catch (_) {}
          let touched = true;
          // Flag any masterBar shorter than its time signature as anacrusis — alphaTab then renders it
          // at actual content width instead of padding. Covers pickup bars and mid-piece partial bars.
          try {
            (score.masterBars || []).forEach((mb, idx) => {
              if (mb.isAnacrusis) return;
              const expected = mb.calculateDuration(false);
              let actual = 0;
              score.tracks.forEach((tr) => tr.staves.forEach((st) => {
                const b = st.bars?.[idx];
                if (!b) return;
                const d = b.calculateDuration();
                if (d > actual) actual = d;
              }));
              if (actual > 0 && actual < expected) mb.isAnacrusis = true;
            });
          } catch (_) {}
          // Apply scoop/plop/doit/falloff articulations the importer skips.
          try { applyScoops(alphaTab, score, xmlText); } catch (_) {}
          collectRestBeatVoices(score);
          if (touched) api.render();
        });

        api.error.on((err) => {
          if (cancelled) return;
          setError(`alphaTab: ${err?.message || err}`);
        });

        // Rest <text> glyphs use SMuFL codepoints U+E4E2..U+E4F1. Targeting them by codepoint
        // sidesteps any class-based approach (more robust across alphaTab releases).
        const REST_LO = 0xE4E2;
        const REST_HI = 0xE4F1;
        const REST_SHORT_THRESHOLD = 0xE4E8; // 32nd and shorter — too cluttered, hide outright.
        const isRestText = (t) => {
          const s = t.textContent || '';
          for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            if (c >= REST_LO && c <= REST_HI) return true;
          }
          return false;
        };
        const restCodepoint = (t) => {
          const s = t.textContent || '';
          for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            if (c >= REST_LO && c <= REST_HI) return c;
          }
          return 0;
        };

        // postRenderFinished fires after alphaTab injects every system's SVG into the DOM.
        api.postRenderFinished.on(() => {
          if (cancelled || !containerRef.current) return;
          const root = containerRef.current;
          const allText = root.querySelectorAll('text');
          const svgs = root.querySelectorAll('svg');

          // ── Header layout: collapse subtitle/artist onto a single Y row, last one right-aligned ──
          const HEADER_TOP_MARGIN = 16;
          const HEADER_RIGHT_PAD = 32;
          let titleSvg = null;
          let titleY = Infinity;
          allText.forEach((t) => {
            if (t.getAttribute('text-anchor') !== 'middle') return;
            const y = parseFloat(t.getAttribute('y'));
            if (Number.isFinite(y) && y < titleY) { titleY = y; titleSvg = t.ownerSVGElement; }
          });
          let newY = null;
          if (titleSvg) {
            const centered = [];
            allText.forEach((t) => {
              if (t.ownerSVGElement !== titleSvg) return;
              if (t.getAttribute('text-anchor') !== 'middle') return;
              const y = parseFloat(t.getAttribute('y'));
              if (Number.isFinite(y)) centered.push({ el: t, y });
            });
            centered.sort((a, b) => a.y - b.y);
            const subRows = centered.slice(1).filter((r) => !r.el.classList.contains('header-relayout'));
            if (subRows.length > 0) {
              const svgWidth = parseInt(titleSvg.getAttribute('width'), 10) || 1200;
              newY = subRows[0].y + HEADER_TOP_MARGIN;
              subRows.forEach((r, idx) => {
                r.el.setAttribute('y', String(newY));
                if (idx === subRows.length - 1 && subRows.length > 1) {
                  r.el.setAttribute('x', String(svgWidth - HEADER_RIGHT_PAD));
                  r.el.setAttribute('text-anchor', 'end');
                }
                r.el.classList.add('header-relayout');
              });
            }
            // Tuning lives in a separate placeholder SVG. Find by SMuFL guitarString0..5 codepoints
            // (E834..E83F) and translate it up so its center sits on the subtitle/artist Y row.
            let tuningSvg = null;
            for (const svg of svgs) {
              if (svg === titleSvg) continue;
              const ts = svg.querySelectorAll('text');
              let matched = false;
              for (let i = 0; i < ts.length && !matched; i++) {
                const s = ts[i].textContent || '';
                for (let j = 0; j < s.length; j++) {
                  const c = s.charCodeAt(j);
                  if (c >= 0xE834 && c <= 0xE83F) { matched = true; break; }
                }
              }
              if (matched) { tuningSvg = svg; break; }
            }
            if (tuningSvg && newY != null) {
              const placeholder = tuningSvg.parentElement;
              if (placeholder) {
                const currentTop = parseFloat(placeholder.style.top) || 0;
                const titleTop = parseFloat(titleSvg.parentElement?.style.top) || 0;
                const tuningHeight = parseFloat(tuningSvg.getAttribute('height')) || 51;
                const subtitleAbsoluteY = titleTop + newY;
                const targetTop = Math.max(0, subtitleAbsoluteY - tuningHeight / 2);
                // translateY rather than `top` — alphaTab rewrites placeholder.style.top on every partial render.
                const dy = targetTop - currentTop;
                placeholder.style.transform = `translateY(${dy}px)`;
              }
            }
          }

          // ── Tone down "rendered by alphaTab" attribution (kept per their license terms) ──
          allText.forEach((t) => {
            if ((t.textContent || '').trim() !== 'rendered by alphaTab') return;
            t.style.opacity = '0.15';
            t.style.fontWeight = 'normal';
            const existing = t.getAttribute('transform') || '';
            if (!existing.includes('attr-shift')) {
              t.setAttribute('transform', `translate(0, 24) ${existing}`.trim());
              t.classList.add('attr-shift');
            }
          });

          // ── Shift rest glyphs off the note row (or hide very short ones outright) ──
          allText.forEach((t) => {
            if (!isRestText(t)) return;
            const cp = restCodepoint(t);
            if (cp >= REST_SHORT_THRESHOLD) {
              t.style.opacity = '0';
              t.style.pointerEvents = 'none';
              t.classList.add('rest-shift');
              return;
            }
            let beatId = null;
            for (let p = t.parentElement; p && p !== root; p = p.parentElement) {
              const cls = p.getAttribute?.('class') || '';
              const m = cls.match(/\bb(\d+)\b/);
              if (m) { beatId = parseInt(m[1], 10); break; }
            }
            const voiceIdx = beatId !== null && restBeatVoice.has(beatId) ? restBeatVoice.get(beatId) : 0;
            const dy = voiceIdx === 0 ? -22 : 22;
            const existing = t.getAttribute('transform') || '';
            if (!existing.includes('rest-shift')) {
              t.setAttribute('transform', `translate(0, ${dy}) ${existing}`.trim());
              t.classList.add('rest-shift');
            }
          });
        });

        api.soundFontLoaded.on(() => {
          if (cancelled) return;
          setAudioReady(true);
        });
        api.playerStateChanged.on((e) => {
          if (cancelled) return;
          setPlaying(e.state === 1);
        });
        api.playerPositionChanged.on((e) => {
          if (cancelled) return;
          setDuration(e.endTime || 0);
          if (!scrubbingRef.current) setPosition(e.currentTime || 0);
        });

        api.load(new Uint8Array(buf));
      } catch (err) {
        if (cancelled) return;
        setError(err.message || String(err));
      }
    }

    init();

    return () => {
      cancelled = true;
      try { api?.destroy?.(); } catch (_) {}
    };
  }, [musicXMLUrl]);

  function handlePlayStop() {
    const api = apiRef.current;
    if (!api) return;
    if (playing) api.stop();
    else api.play();
  }
  function handleTempoChange(e) {
    const v = parseFloat(e.target.value);
    setTempo(v);
    if (apiRef.current) apiRef.current.playbackSpeed = v;
  }
  function handleScrubStart() { scrubbingRef.current = true; setScrubbing(true); }
  function handleScrubChange(e) { setPosition(parseFloat(e.target.value)); }
  function handleScrubEnd(e) {
    const ms = parseFloat(e.target.value);
    if (apiRef.current) apiRef.current.timePosition = ms;
    scrubbingRef.current = false;
    setScrubbing(false);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .ploddings-at .at-cursor-bar { background: rgba(240, 120, 32, 0.12); cursor: pointer; }
        .ploddings-at .at-cursor-beat { background: #f07820; width: 2px; }
        .ploddings-at .at-highlight * { fill: #f07820 !important; stroke: #f07820 !important; }
        .ploddings-at .at-selection div { background: rgba(240, 120, 32, 0.08); cursor: pointer; }
        .ploddings-at .at-surface > div:not(:first-child),
        .ploddings-at .at-surface > div:not(:first-child) * { cursor: pointer !important; }
        .ploddings-at-card .ploddings-at-area { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 640px) {
          .ploddings-at-toolbar { flex-wrap: wrap !important; gap: 8px !important; padding: 8px !important; row-gap: 8px !important; }
          .ploddings-at-toolbar .ploddings-at-progress { order: 3; flex-basis: 100% !important; margin: 0 !important; }
          .ploddings-at-toolbar .ploddings-at-tempo { order: 2; margin-left: auto !important; }
          .ploddings-at-toolbar .ploddings-at-play { width: 88px !important; padding: 10px 0 !important; }
          .ploddings-at-toolbar .ploddings-at-tempo input[type="range"] { width: 100px !important; }
          .ploddings-at-area { padding: 8px !important; min-height: 320px !important; }
        }
      ` }} />
      {status && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888', background: '#f5f5f5', borderRadius: '4px' }}>
          {status}
        </div>
      )}
      {error && (
        <div style={{ padding: '20px', color: '#c00', background: '#fee', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
          ✗ {error}
        </div>
      )}
      <div
        className="ploddings-at-card"
        style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}
      >
        <div
          className="ploddings-at-toolbar"
          style={{
            position: 'sticky', top: 0, zIndex: 10,
            background: '#0d1830', borderBottom: '1px solid #060d1c',
            padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'center', color: '#fff',
          }}
        >
          <button
            onClick={handlePlayStop}
            disabled={!audioReady}
            className="ploddings-at-play"
            style={{
              background: playing ? '#bbb' : '#f07820', color: '#fff', border: 'none',
              padding: '8px 0', borderRadius: '6px', cursor: audioReady ? 'pointer' : 'not-allowed',
              fontSize: '14px', fontWeight: 600, opacity: audioReady ? 1 : 0.5,
              width: '110px', boxSizing: 'border-box',
              boxShadow: 'none', WebkitAppearance: 'none', appearance: 'none',
            }}
          >
            {playing ? '⏹ Stop' : '▶ Play'}
          </button>
          <div className="ploddings-at-progress" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, marginLeft: '12px', marginRight: '12px' }}>
            <span style={{ fontSize: '12px', color: '#cfd6e6', fontVariantNumeric: 'tabular-nums', minWidth: '34px' }}>
              {formatTime(position)}
            </span>
            <input
              type="range"
              min="0"
              max={Math.max(duration, 1)}
              step="100"
              value={Math.min(position, duration || 0)}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrubChange}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              disabled={!audioReady || duration === 0}
              style={{ flex: 1, minWidth: 0, accentColor: '#f07820' }}
            />
            <span style={{ fontSize: '12px', color: '#cfd6e6', fontVariantNumeric: 'tabular-nums', minWidth: '34px', textAlign: 'right' }}>
              {formatTime(duration)}
            </span>
          </div>
          <label className="ploddings-at-tempo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#fff' }}>
            <span>Tempo</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={tempo}
              onChange={handleTempoChange}
              disabled={!audioReady}
              style={{ width: '140px' }}
            />
            <span style={{ width: '38px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(tempo * 100)}%
            </span>
          </label>
        </div>
        <div ref={containerRef} className="ploddings-at-area ploddings-at" style={{ padding: '12px', minHeight: '500px' }} />
      </div>
    </>
  );
}
