import { useEffect, useRef, useState } from 'react';
import UnlockAudioButton from './UnlockAudioButton';

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

// Read MusicXML <swing> ratios that alphaTab's importer doesn't recognize (anything other than 2:1, 3:1, 1:3)
// and snap to the closest TripletFeel bucket. MuseScore's "Light Swing" 60/40 and "Custom" 52/48 etc. fall here.
// Only runs against uncompressed .musicxml — for .mxl we'd need to unzip first.
function applySwing(alphaTab, score, xmlText) {
  if (!xmlText) return false;
  const TF = alphaTab.model?.TripletFeel;
  if (!TF) return false;
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) return false;
  const swing = doc.querySelector('swing');
  if (!swing) return false;
  if (swing.querySelector('straight')) return false; // already-straight, importer handled it
  const first = parseInt(swing.querySelector('first')?.textContent || '0', 10);
  const second = parseInt(swing.querySelector('second')?.textContent || '0', 10);
  if (first <= 0 || second <= 0) return false;
  const isSixteenth = (swing.querySelector('swing-type')?.textContent || '').trim().toLowerCase().includes('16');
  const percent = first / (first + second);
  // Most MuseScore swing values fall between 52% and 67% — those should all apply triplet swing.
  // Threshold tuned so 52% (light swing) triggers and only ratios essentially at 50/50 stay straight.
  // ≤51% → straight (no change). 51–70% → triplet swing. >70% → hard shuffle (dotted).
  let target;
  if (percent <= 0.51) return false;
  if (percent < 0.70) target = isSixteenth ? TF.Triplet16th : TF.Triplet8th;
  else target = isSixteenth ? TF.Dotted16th : TF.Dotted8th;
  let applied = 0;
  (score.masterBars || []).forEach((mb) => {
    // Only fill in where alphaTab's importer left it at the default — never override a value it already mapped.
    if (mb.tripletFeel == null || mb.tripletFeel === TF.NoTripletFeel) {
      mb.tripletFeel = target;
      applied++;
    }
  });
  return applied > 0;
}

// Custom fractional swing — alphaTab's TripletFeel enum only offers discrete buckets (Triplet8th = 66.67%,
// Dotted8th = 75%). For a 60% (or any other) swing we directly mutate Beat.playbackStart/playbackDuration
// of every consecutive same-duration pair (eighth-eighth, sixteenth-sixteenth) within a voice: the first
// note absorbs `ratio` of the combined playback duration, the second absorbs the remainder. Visual layout
// (displayStart/displayDuration) is left untouched so the score still draws as straight notes.
//
// To keep voices in sync, we collect the (oldStart → newStart) shift across every voice in a bar first,
// then in a second pass propagate that shift to any beat in any other voice that originally aligned with
// the swung second-of-pair (e.g. a bass quarter that landed on the second eighth of a treble pair).
function applyCustomSwing(alphaTab, score, ratio) {
  if (!ratio || ratio === 0.5) return 0;
  const Duration = alphaTab.model?.Duration;
  if (!Duration) return 0;
  const isSwingableDuration = (d) => d === Duration.Eighth || d === Duration.Sixteenth;
  // alphaTab defaults tupletNumerator/Denominator to -1 for non-tuplets and exposes the real boolean
  // via the `hasTuplet` getter; anything based on -1 vs 1 gives false positives.
  const isPlainTuplet = (beat) => !beat || !beat.hasTuplet;
  let pairs = 0;

  score.tracks.forEach((track) => {
    track.staves.forEach((staff) => {
      staff.bars.forEach((bar) => {
        // First pass — find eighth/sixteenth pairs in every voice and apply the swing.
        // Track (oldStart → newStart) so the second pass can sync other voices.
        const shifts = new Map();
        bar.voices.forEach((voice) => {
          const beats = voice.beats || [];
          for (let i = 0; i < beats.length - 1; i++) {
            const a = beats[i];
            const b = beats[i + 1];
            if (!isSwingableDuration(a.duration) || a.duration !== b.duration) continue;
            if (!isPlainTuplet(a) || !isPlainTuplet(b)) continue;
            const pairTicks = (a.playbackDuration || 0) + (b.playbackDuration || 0);
            if (pairTicks <= 0) continue;
            // A swing pair is (downbeat note, offbeat note). The downbeat sits on a multiple of pairTicks
            // (e.g. eighth pair = 960 ticks → starts at 0, 960, 1920, ...). Pairing two consecutive eighths
            // that span a beat boundary (offbeat + next-downbeat) shifts the downbeat off-grid and warps the
            // pulse, so skip those.
            if ((a.playbackStart || 0) % pairTicks !== 0) continue;
            const newA = Math.round(pairTicks * ratio);
            const oldBStart = b.playbackStart;
            const newBStart = (a.playbackStart || 0) + newA;
            a.playbackDuration = newA;
            b.playbackStart = newBStart;
            b.playbackDuration = pairTicks - newA;
            shifts.set(oldBStart, newBStart);
            pairs++;
            i++;
          }
        });

        // Second pass — propagate shifts to any other voice's beat that originally landed on a swung second-of-pair start.
        if (shifts.size > 0) {
          bar.voices.forEach((voice) => {
            (voice.beats || []).forEach((beat) => {
              const newStart = shifts.get(beat.playbackStart);
              if (newStart != null && beat.playbackStart !== newStart) {
                beat.playbackStart = newStart;
              }
            });
          });
          // Third pass — make every beat's duration match the gap to the next beat exactly. This both
          // closes positive gaps (silence the listener would hear as "straight") AND trims negative gaps
          // (where a cross-voice shift bumped a beat's start backwards into the previous beat's tail,
          // creating a brief overlap that the soundfont may render as a doubled note).
          bar.voices.forEach((voice) => {
            const beats = voice.beats || [];
            for (let i = 0; i < beats.length - 1; i++) {
              const cur = beats[i];
              const next = beats[i + 1];
              const fitted = (next.playbackStart || 0) - (cur.playbackStart || 0);
              if (fitted > 0) cur.playbackDuration = fitted;
            }
          });
        }
      });
    });
  });
  return pairs;
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
export default function PloddingsAlphaTabEmbed({ musicXMLUrl, swingRatio }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  const scrubbingRef = useRef(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
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
    // Mobile detection used by alphaTab settings (scale) and post-render header layout (stack vs side-by-side).
    const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches;

    async function init() {
      try {
        // Dynamic import — alphaTab is browser-only and would break SSR
        const alphaTab = await import('@coderline/alphatab');
        if (cancelled) return;

        const buf = await fetch(musicXMLUrl).then((r) => {
          if (!r.ok) throw new Error(`Score fetch failed (${r.status})`);
          return r.arrayBuffer();
        });
        if (cancelled) return;
        // Detect compressed (.mxl) bytes by zip magic so we skip the DOMParser pass — calling parseFromString
        // on zip bytes succeeds in returning a parsererror doc but Firefox still logs the failure to the console
        // ("XML Parsing Error: not well-formed at 1:3" — the \x03 in the PK header). For .mxl we'd need to unzip
        // before scoop extraction; that's optional, so just skip.
        const u8 = new Uint8Array(buf);
        const isZip = u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4B && u8[2] === 0x03 && u8[3] === 0x04;
        const xmlText = isZip ? '' : new TextDecoder('utf-8').decode(buf);

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
            // When a swing override is supplied, disable alphaTab's built-in TripletFeel playback so the MIDI
            // generator uses our raw beat.playbackStart values instead of overriding them with the importer-detected
            // Triplet8th/Dotted8th bucket. Without this, MuseScore's <swing> ratio in the file wins.
            playTripletFeel: typeof swingRatio === 'number' ? false : true,
          },
          display: {
            layoutMode: 'page',
            staveProfile: 'default',
            // Mobile shrinks the whole engraving (notes, tabs, stems, etc.) so it's less dominant in a small viewport.
            scale: isMobile ? 0.8 : 1.0,
            // Mobile caps systems at 2 bars and ignores source-file system breaks. Desktop honours model layout.
            ...(isMobile
              ? { systemsLayoutMode: 'automatic', barsPerRow: 2 }
              : { systemsLayoutMode: 'useModelLayout' }),
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
              // Hide rehearsal marks (the bold-line letter boxes), but keep direction text + tempo
              // markers visible — that's where ritardandos and new tempo annotations render.
              effectMarker: false,
              effectDirections: true,
              effectTempo: true,
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
          // MusicXML import sets fermata.type but leaves fermata.length=0 (no MXL standard for stretch).
          // Set sensible defaults so playback actually holds: short=1.2x, medium=1.7x, long=2.2x.
          try {
            const FT = alphaTab.model?.FermataType;
            (score.masterBars || []).forEach((mb) => {
              if (!mb.fermata || typeof mb.fermata.forEach !== 'function') return;
              mb.fermata.forEach((fermata) => {
                if (!fermata || fermata.length > 0) return;
                if (FT && fermata.type === FT.Long) fermata.length = 2.2;
                else if (FT && fermata.type === FT.Medium) fermata.length = 1.7;
                else fermata.length = 1.2;
              });
            });
          } catch (_) {}
          // Apply scoop/plop/doit/falloff articulations the importer skips. Only meaningful for uncompressed .musicxml.
          if (xmlText) {
            try { applyScoops(alphaTab, score, xmlText); } catch (_) {}
          }
          // Custom fractional swing override (e.g. 0.57 for a typical blues feel) — applied directly to
          // Beat.playbackStart/playbackDuration. 0.5 (default for songs without a swing_ratio set in
          // Supabase) is a no-op since applyCustomSwing returns early on exactly 0.5.
          if (typeof swingRatio === 'number' && swingRatio !== 0.5) {
            try {
              const pairs = applyCustomSwing(alphaTab, score, swingRatio);
              if (pairs > 0) {
                touched = true;
                // alphaTab generates MIDI before scoreLoaded fires; loadMidiForScore re-emits MIDI
                // from the modified score so the player actually hears the swing.
                try { api.loadMidiForScore?.(); } catch (_) {}
              }
            } catch (_) {}
          }
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
          setLoading(false);
          // Notify parent (e.g. /songs/[id].js iframe wrapper) that the score is ready, so its page-level loader can stop.
          // Report rendered height so the parent (/songs/[id]) can size the iframe to the score's actual height.
          // Measure the score card's bottom edge — body.scrollHeight is bounded below by the iframe's outer
          // height, so we'd report ~1400px even if the score is taller.
          try {
            const card = root.closest('.ploddings-at-card') || root;
            const rect = card.getBoundingClientRect();
            const h = Math.ceil(rect.bottom + (window.scrollY || 0));
            window.parent?.postMessage({ type: 'ploddings-score-ready', height: h }, '*');
          } catch (_) {
            try { window.parent?.postMessage({ type: 'ploddings-score-ready' }, '*'); } catch (__) {}
          }
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
            const STACK_GAP = isMobile ? 16 : 22;
            let titleWrapShift = 0;
            if (subRows.length > 0) {
              const svgWidth = parseInt(titleSvg.getAttribute('width'), 10) || 1200;
              newY = subRows[0].y + HEADER_TOP_MARGIN;
              // Each subtitle/composer line on its own row, centered. Mobile additionally shrinks the title and sub-row text.
              let titleWrappedExtraLines = 0;
              if (isMobile && centered[0]) {
                const titleEl = centered[0].el;
                titleEl.style.fontSize = '24px';
                // SVG <text> doesn't wrap. On a narrow viewport long titles run off-screen, so split into
                // two roughly-balanced lines using tspans when the rendered width exceeds the available space.
                try {
                  const containerWidth = containerRef.current?.offsetWidth || svgWidth;
                  const available = Math.max(120, containerWidth - 32);
                  const measured = titleEl.getComputedTextLength?.() ?? 0;
                  const text = (titleEl.textContent || '').trim();
                  const words = text.split(/\s+/);
                  if (measured > available && words.length > 1 && !titleEl.classList.contains('title-wrapped')) {
                    // Find the split index whose first half is closest to half the total character count.
                    const totalChars = text.length;
                    let acc = 0, splitIdx = 1, bestDiff = Infinity;
                    for (let i = 0; i < words.length - 1; i++) {
                      acc += words[i].length + (i > 0 ? 1 : 0);
                      const diff = Math.abs(acc - totalChars / 2);
                      if (diff < bestDiff) { bestDiff = diff; splitIdx = i + 1; }
                    }
                    const line1 = words.slice(0, splitIdx).join(' ');
                    const line2 = words.slice(splitIdx).join(' ');
                    const x = titleEl.getAttribute('x') || String(svgWidth / 2);
                    while (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
                    const ns = 'http://www.w3.org/2000/svg';
                    const t1 = document.createElementNS(ns, 'tspan');
                    t1.setAttribute('x', x);
                    t1.textContent = line1;
                    const t2 = document.createElementNS(ns, 'tspan');
                    t2.setAttribute('x', x);
                    t2.setAttribute('dy', '1.1em');
                    t2.textContent = line2;
                    titleEl.appendChild(t1);
                    titleEl.appendChild(t2);
                    titleEl.classList.add('title-wrapped');
                    titleWrappedExtraLines = 1;
                  }
                } catch (_) {}
              }
              // Push sub-rows down by an extra line-height when the title wrapped to two lines.
              titleWrapShift = titleWrappedExtraLines * 28;
              subRows.forEach((r, idx) => {
                if (isMobile) r.el.style.fontSize = '13px';
                r.el.setAttribute('y', String(newY + titleWrapShift + idx * STACK_GAP));
                r.el.setAttribute('x', String(svgWidth / 2));
                r.el.setAttribute('text-anchor', 'middle');
                r.el.classList.add('header-relayout');
              });
              if (titleWrapShift) newY += titleWrapShift;
            }
            // Tuning sits BELOW the stacked sub-rows on its own row.
            const subRowsBottomY = (newY ?? 0) + Math.max(0, subRows.length - 1) * STACK_GAP + STACK_GAP;
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
                // Tuning gets its own row below the stacked subtitle/composer rows, horizontally centered.
                const targetTop = Math.max(0, titleTop + subRowsBottomY);
                const dy = targetTop - currentTop;
                // Measure tuning content's actual horizontal span and translate so its midpoint lands at the container center.
                let minX = Infinity, maxX = -Infinity;
                tuningSvg.querySelectorAll('text').forEach((t) => {
                  const x = parseFloat(t.getAttribute('x'));
                  if (!Number.isFinite(x)) return;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                });
                const SCALE = isMobile ? 0.78 : 1;
                const contentLeft = Number.isFinite(minX) ? minX : 0;
                const contentRight = Number.isFinite(maxX) ? maxX + 30 : contentLeft + 100;
                const contentMidScaled = ((contentLeft + contentRight) / 2) * SCALE;
                const containerWidth = containerRef.current?.offsetWidth || 1200;
                const dx = (containerWidth / 2) - contentMidScaled;
                // translateY/translateX rather than `top`/`left` — alphaTab rewrites those on every partial render.
                placeholder.style.transform = `translate(${dx}px, ${dy}px) scale(${SCALE})`;
                placeholder.style.transformOrigin = 'top left';
              }
            }
            // Shift music-system placeholders down to (a) clear a wrapped-title second line and (b) leave
            // a base 20px gap below the tuning / composer row on mobile so the first staff has breathing
            // room. Tuning is excluded because its custom transform already places it correctly via newY.
            const mobileHeaderMusicGap = isMobile ? 20 : 0;
            const musicPlaceholderShift = titleWrapShift + mobileHeaderMusicGap;
            if (musicPlaceholderShift > 0 && titleSvg) {
              const titlePlaceholder = titleSvg.parentElement;
              const tuningPlaceholder = tuningSvg?.parentElement;
              const placeholders = root.querySelectorAll('.at-surface > div');
              placeholders.forEach((ph) => {
                if (ph === titlePlaceholder || ph === tuningPlaceholder) return;
                if (ph.dataset.musicShifted === 'true') return;
                const existing = ph.style.transform || '';
                ph.style.transform = `translateY(${musicPlaceholderShift}px) ${existing}`.trim();
                ph.dataset.musicShifted = 'true';
              });
            }
          }

          // ── Tone down "rendered by alphaTab" attribution (kept per their license terms) ──
          // Also remove instructional tuning-text directions (e.g. "Guitar Tune down 1 step",
          // "Tuning: Drop D", "Capo 3") that duplicate the per-string tuning panel.
          const TUNING_INSTRUCTION_RE = /\btun(e|ing)\b|\bdrop\s*[a-g]\b|\bcapo\s*\d/i;
          allText.forEach((t) => {
            const s = (t.textContent || '').trim();
            if (s === 'rendered by alphaTab') {
              t.style.opacity = '0.15';
              t.style.fontWeight = 'normal';
              const existing = t.getAttribute('transform') || '';
              if (!existing.includes('attr-shift')) {
                t.setAttribute('transform', `translate(0, 24) ${existing}`.trim());
                t.classList.add('attr-shift');
              }
              return;
            }
            if (TUNING_INSTRUCTION_RE.test(s)) {
              t.remove();
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
        .ploddings-at-card .ploddings-at-area { overflow-x: auto; -webkit-overflow-scrolling: touch; position: relative; }
        /* UnlockAudioButton is mobile-only — desktop doesn't gate AudioContext on user gesture. */
        .ploddings-at-unlock-audio { margin: 8px 0; }
        @media (min-width: 641px) { .ploddings-at-unlock-audio { display: none !important; } }
        /* Shimmer loading state — covers the score area until the first postRenderFinished fires.
           space-evenly distributes rows to fill the full height; align-items:center horizontally centers them. */
        .ploddings-at-shimmer {
          position: absolute; inset: 12px;
          display: flex; flex-direction: column;
          justify-content: space-evenly; align-items: center;
          pointer-events: none;
        }
        .ploddings-at-shimmer-row {
          height: 36px; border-radius: 4px;
          background: linear-gradient(90deg, #eee 0%, #f5f5f5 40%, #ddd 50%, #f5f5f5 60%, #eee 100%);
          background-size: 200% 100%;
          animation: ploddings-at-shimmer 1.4s ease-in-out infinite;
        }
        .ploddings-at-shimmer-row.head { width: 40%; height: 24px; }
        .ploddings-at-shimmer-row.full { width: 92%; }
        .ploddings-at-shimmer-row.short { width: 70%; }
        @keyframes ploddings-at-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 640px) {
          .ploddings-at-toolbar { flex-wrap: wrap !important; gap: 8px !important; padding: 8px !important; row-gap: 8px !important; }
          .ploddings-at-toolbar .ploddings-at-progress { order: 3; flex-basis: 100% !important; margin: 0 !important; }
          .ploddings-at-toolbar .ploddings-at-tempo { order: 2; margin-left: auto !important; }
          .ploddings-at-toolbar .ploddings-at-play { width: 88px !important; padding: 10px 0 !important; }
          .ploddings-at-toolbar .ploddings-at-tempo input[type="range"] { width: 100px !important; }
          .ploddings-at-area { padding: 8px 4px !important; min-height: 320px !important; }
          /* While the score is still loading on mobile, fill 90vh so the shimmer card matches the
             iframe's eventual cap and the user doesn't see a sudden size jump on first paint. */
          .ploddings-at-area.is-loading { min-height: 90vh !important; }
        }
      ` }} />
      {error && (
        <div style={{ padding: '20px', color: '#c00', background: '#fee', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
          ✗ {error}
        </div>
      )}
      {/* Same UnlockAudioButton the slow-downer uses — satisfies iOS user-gesture requirement.
          Rendered ABOVE the score card (not inside it) and hidden on desktop via CSS. */}
      <div className="ploddings-at-unlock-audio">
        <UnlockAudioButton />
      </div>
      <div
        className="ploddings-at-card"
        style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '4px', marginTop: '12px', overflow: 'clip' }}
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
        <div className={`ploddings-at-area ploddings-at${loading ? ' is-loading' : ''}`} style={{ padding: '12px', minHeight: loading ? '700px' : '500px', position: 'relative', background: '#2a2a2e' }}>
          <div ref={containerRef} style={{ maxWidth: '980px', margin: '0 auto', background: '#fff' }} />
          {loading && (
            <div className="ploddings-at-shimmer" aria-hidden="true">
              <div className="ploddings-at-shimmer-row head" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row full" />
              <div className="ploddings-at-shimmer-row short" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
