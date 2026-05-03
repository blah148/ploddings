import { useEffect, useRef, useState, useCallback } from 'react';
import Head from 'next/head';

const MUSICXML_URL = 'https://f005.backblazeb2.com/file/ploddings-songs/spoonful-blues_charley-patton.musicxml';
const SONG_SLUG = 'spoonful-blues-charley-patton';
const SONG_NAME = 'Spoonful Blues';
const ARTIST_NAME = 'Charley Patton';

function buildMeasureOrder(repetitions, totalMeasures) {
  const realReps = (repetitions || []).filter(r => !r.virtualOverallRepetition);
  if (!realReps.length) return Array.from({ length: totalMeasures }, (_, i) => i);

  const repeatMap = new Map();
  realReps.forEach(rep => {
    const startIdx = rep.startMarker?.measureIndex ?? 0;
    const endIdx = rep.backwardJumpInstructions?.[0]?.measureIndex ?? totalMeasures - 1;
    const extra = (rep.userNumberOfRepetitions || 2) - 1;
    repeatMap.set(endIdx, { startIdx, timesLeft: extra });
  });

  const order = [];
  let i = 0;
  while (i < totalMeasures) {
    order.push(i);
    if (repeatMap.has(i)) {
      const region = repeatMap.get(i);
      if (region.timesLeft > 0) { region.timesLeft--; i = region.startIdx; continue; }
    }
    i++;
  }
  return order;
}

function midiToPitch(midi) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function pitchToMidi(pitchStr) {
  const m = pitchStr.match(/^([A-G]#?)(-?\d+)$/);
  if (!m) return 60;
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return (parseInt(m[2]) + 1) * 12 + names.indexOf(m[1]);
}

function extractSwingRatio(xmlDoc) {
  const swingEl = xmlDoc.querySelector('sound swing');
  if (!swingEl || swingEl.querySelector('straight')) return 0.5;
  const first = parseFloat(swingEl.querySelector('first')?.textContent || 1);
  const second = parseFloat(swingEl.querySelector('second')?.textContent || 1);
  return first / (first + second);
}

function applySwing(t, swingRatio, quarterDur) {
  if (Math.abs(swingRatio - 0.5) < 0.001) return t;
  const beatIdx = Math.floor((t + quarterDur * 0.01) / quarterDur);
  const within = t - beatIdx * quarterDur;
  const halfQ = quarterDur * 0.5;
  if (Math.abs(within - halfQ) < halfQ * 0.12) return beatIdx * quarterDur + swingRatio * quarterDur;
  return t;
}

function extractStrumInfo(xmlDoc) {
  const strumMap = new Map();
  const parts = xmlDoc.querySelectorAll('part');
  if (!parts.length) return strumMap;

  let divisions = 1;
  parts[0].querySelectorAll('measure').forEach((measure, mIdx) => {
    const divEl = measure.querySelector('attributes > divisions');
    if (divEl) divisions = parseInt(divEl.textContent) || divisions;

    let beatPos = 0;
    measure.querySelectorAll('note').forEach(noteEl => {
      const isChord = !!noteEl.querySelector('chord');
      const dur = parseInt(noteEl.querySelector('duration')?.textContent || 0);
      const arpEl = noteEl.querySelector('notations arpeggiate');
      const glissEl = noteEl.querySelector('notations glissando[type="start"], notations slide[type="start"]');
      if (!!(arpEl || glissEl)) {
        const key = `${mIdx}_${Math.round((beatPos / (divisions * 4)) * 10000)}`;
        if (!strumMap.has(key)) strumMap.set(key, arpEl?.getAttribute('direction') === 'up' ? 'up' : 'down');
      }
      if (!isChord) beatPos += dur;
    });
  });
  return strumMap;
}

// Parse all per-note articulations: scoop, plop, fermata, tremolo, bend, harmonic, mute
// Returns Map: "mIdx_offsetKey" → { grace, fermata, tremolo, bend, harmonic, mute }
function extractArticulations(xmlDoc) {
  const map = new Map();
  const parts = xmlDoc.querySelectorAll('part');
  if (!parts.length) return map;

  let divisions = 1;
  parts[0].querySelectorAll('measure').forEach((measure, mIdx) => {
    const divEl = measure.querySelector('attributes > divisions');
    if (divEl) divisions = parseInt(divEl.textContent) || divisions;

    let beatPos = 0;
    measure.querySelectorAll('note').forEach(noteEl => {
      const isChord = !!noteEl.querySelector('chord');
      const dur = parseInt(noteEl.querySelector('duration')?.textContent || 0);

      const hasScoop = !!noteEl.querySelector('notations articulations scoop');
      const hasPlop  = !!noteEl.querySelector('notations articulations plop');
      const hasFermata = !!noteEl.querySelector('notations fermata');
      const tremoloEl = noteEl.querySelector('notations ornaments tremolo');
      const bendEl = noteEl.querySelector('notations technical bend bend-alter');
      const hasHarmonic = !!noteEl.querySelector('notations technical harmonic');
      const isDeadNote = noteEl.querySelector('notehead')?.textContent === 'x';
      // Vibrato: <wavy-line>, <vibrato>, or <other-articulation smufl="...vibrato..."/>
      const otherArt = noteEl.querySelector('notations articulations other-articulation');
      const otherSmufl = (otherArt?.getAttribute('smufl') || '').toLowerCase();
      const hasVibrato = !!noteEl.querySelector('notations ornaments wavy-line, notations ornaments vibrato')
        || otherSmufl.includes('vibrato') || otherSmufl.includes('wiggle');

      const flags = {};
      if (hasScoop) flags.grace = 'up';
      else if (hasPlop) flags.grace = 'down';
      if (hasFermata) flags.fermata = true;
      if (tremoloEl) flags.tremolo = parseInt(tremoloEl.textContent) || 2;
      if (bendEl) flags.bend = parseFloat(bendEl.textContent) || 0;
      if (hasHarmonic) flags.harmonic = true;
      if (isDeadNote) flags.mute = true;
      if (hasVibrato) flags.vibrato = true;

      if (Object.keys(flags).length) {
        const key = `${mIdx}_${Math.round((beatPos / (divisions * 4)) * 10000)}`;
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...flags });
      }
      if (!isChord) beatPos += dur;
    });
  });
  return map;
}

// Parse all <sound tempo="X"/> markers with their measure index
// Returns Map: measureIdx → bpm
function extractTempoMap(xmlDoc) {
  const tempoMap = new Map();
  const parts = xmlDoc.querySelectorAll('part');
  if (!parts.length) return tempoMap;
  parts[0].querySelectorAll('measure').forEach((measure, mIdx) => {
    const soundEl = measure.querySelector('sound[tempo]');
    if (soundEl) tempoMap.set(mIdx, parseFloat(soundEl.getAttribute('tempo')));
  });
  return tempoMap;
}

// Convert a tab MusicXML to standard notation by swapping the clef
// and removing tab-specific staff details. Pitch data is preserved so playback is unchanged.
// Strip visual annotations we don't want in the rendered score:
//   - Instrument-name labels ("Fingerstyle guitar" etc.) from <direction> or <credit>
//   - <metronome> tempo marks (we display tempo in the toolbar instead)
// The <sound tempo="..."> element is preserved so audio tempo detection still works.
function stripInstrumentLabel(xmlText) {
  const isInstrumentLabel = (t) => {
    const s = t.trim().toLowerCase();
    return /^(fingerstyle|acoustic|classical|electric|nylon|steel)( guitar)?$/.test(s)
        || s === 'fingerstyle guitar' || s === 'guitar';
  };
  // Tuning labels like "Eb Bb Eb G Bb Eb" or "E A D G B E" — sequence of pitch names
  const isTuningLabel = (t) => /^\s*([a-g][#b]?\s+){2,7}[a-g][#b]?\s*$/i.test(t);
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    doc.querySelectorAll('direction-type words').forEach(words => {
      const txt = words.textContent;
      if (isInstrumentLabel(txt) || isTuningLabel(txt)) words.closest('direction')?.remove();
    });
    doc.querySelectorAll('credit-words').forEach(cw => {
      const txt = cw.textContent;
      if (isInstrumentLabel(txt) || isTuningLabel(txt)) cw.closest('credit')?.remove();
    });
    doc.querySelectorAll('metronome').forEach(m => m.remove());
    return new XMLSerializer().serializeToString(doc);
  } catch (_) {
    return xmlText;
  }
}

// Convert a tab MusicXML to standard guitar notation (treble-8vb):
//   - Swap TAB clef → treble clef + <clef-octave-change>-1</clef-octave-change>
//     (OSMD displays notes one octave higher and shows "8" below the clef — pitches stay at sounding values)
//   - Strip <staff-details>, <technical>, <print> (tab-specific layout/string indicators)
function convertToStandardNotation(xmlText) {
  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    doc.querySelectorAll('clef').forEach(clef => {
      const sign = clef.querySelector('sign');
      if (sign?.textContent === 'TAB') {
        sign.textContent = 'G';
        const line = clef.querySelector('line');
        if (line) line.textContent = '2';
        if (!clef.querySelector('clef-octave-change')) {
          const oc = doc.createElement('clef-octave-change');
          oc.textContent = '-1';
          clef.appendChild(oc);
        }
      }
    });
    doc.querySelectorAll('staff-details').forEach(sd => sd.remove());
    doc.querySelectorAll('notations technical').forEach(t => t.remove());
    doc.querySelectorAll('print').forEach(p => p.remove());
    return new XMLSerializer().serializeToString(doc);
  } catch (_) {
    return xmlText;
  }
}

// Cross-page display preference cookie (1-year expiry, available on every page)
const DISPLAY_PREF_COOKIE = 'ploddings_display';
function readDisplayPref() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${DISPLAY_PREF_COOKIE}=(tab|standard)`));
  return m ? m[1] : null;
}
function writeDisplayPref(mode) {
  if (typeof document === 'undefined') return;
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${DISPLAY_PREF_COOKIE}=${mode}; max-age=${oneYear}; path=/; SameSite=Lax`;
}

function osmdNoteToTone(note) {
  try {
    if (note.halfTone != null) return midiToPitch(note.halfTone);
    const names = ['C','D','E','F','G','A','B'];
    const acc = note.Pitch.Accidental;
    return `${names[note.Pitch.FundamentalNote]}${acc === 1 ? '#' : acc === -1 ? 'b' : ''}${note.Pitch.Octave}`;
  } catch { return null; }
}

const BASE = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/';
const GUITAR_NOTES = ['A2','C3','Eb3','Gb3','A3','C4','Eb4','Gb4','A4','C5','Eb5'];
const SAMPLE_BASES = {
  steel: { inst: 'acoustic_guitar_steel-mp3', notes: GUITAR_NOTES },
};

function buildSamplerSynth(Tone, type, onReady) {
  const cfg = SAMPLE_BASES[type] || SAMPLE_BASES.steel;
  const urls = Object.fromEntries(cfg.notes.map(n => [n, `${n}.mp3`]));
  const baseUrl = `${BASE}${cfg.inst}/`;
  const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.18 }).toDestination();
  const compressor = new Tone.Compressor(-18, 4).connect(reverb);

  // Plain signal path
  const sampler = new Tone.Sampler({ urls, baseUrl, onload: onReady }).connect(compressor);
  sampler.volume.value = 12;

  // Vibrato signal path: Tone.Vibrato modulates pitch via delay LFO
  const vibrato = new Tone.Vibrato({ frequency: 5.5, depth: 0.06 }).connect(compressor);
  const vibSampler = new Tone.Sampler({ urls, baseUrl }).connect(vibrato);
  vibSampler.volume.value = 12;

  return {
    triggerAttackRelease(p, d, t, useVibrato) {
      (useVibrato ? vibSampler : sampler).triggerAttackRelease(p, d, t);
    },
    dispose() { sampler.dispose(); vibSampler.dispose(); vibrato.dispose(); compressor.dispose(); reverb.dispose(); },
  };
}

export default function EmbedTest() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const synthRef = useRef(null);
  const samplerReadyRef = useRef(null); // Promise that resolves once the sampler bank has loaded
  const parsedDataRef = useRef(null);   // Cache of mode-independent parsed XML + processed scheduling data
  const scoreWrapperRef = useRef(null);
  const timingsRef = useRef([]);
  const rafRef = useRef(null);
  const cursorStepRef = useRef(0);
  const cursorLinearRef = useRef(0);
  const playbackSyncRef = useRef([]);
  const measureSyncIdxRef = useRef(new Map());
  const playingRef = useRef(false);

  // Raw whole-note data — tempo-independent, re-scheduled when tempo changes
  const rawNotesRef = useRef([]);   // [{pitch, orderIdx, offsetWN, durWN, strumOffset, ...articulations}]
  const rawSyncRef = useRef([]);    // [{orderIdx, offsetWN, linearIdx}]
  const measureOrderRef = useRef([]);
  const measureDurWNRef = useRef([]);
  const baseTempoMapRef = useRef(new Map()); // measureIdx → bpm (forward-filled)
  const baseTempoRef = useRef(80); // first-measure tempo for ratio calculations
  const currentTempoRef = useRef(80);
  const swingRatioRef = useRef(0.55);

  const [overlays, setOverlays] = useState([]);
  const [hoveredMeasure, setHoveredMeasure] = useState(null);
  const [vibratoMarks, setVibratoMarks] = useState([]);
  const [status, setStatus] = useState('Loading score…');
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const setPlayingSync = (v) => { playingRef.current = v; setPlaying(v); };
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [tempo, setTempo] = useState(80);
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState('standard'); // 'tab' | 'standard' — standard is the free default
  const [subtitle, setSubtitle] = useState('');
  // TODO: read this from the song's record once the verification workflow is set up
  const verifiedByEar = true;
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // 4-bar tab teaser for free users
  const PREVIEW_BARS = 4; // experiment knob — number of free bars to show in tab preview
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [playHintFade, setPlayHintFade] = useState(false);
  const playStartedRef = useRef(false);
  // TODO: replace with real auth/subscription check (e.g. via Supabase user role)
  const hasTabAccess = false;

  // Schedule (or re-schedule) all notes — uses refs and a tempo scale factor
  const scheduleAtTempo = useCallback((newTempo, Tone) => {
    const swing = swingRatioRef.current;
    const order = measureOrderRef.current;
    const measureDurWN = measureDurWNRef.current;
    const baseMap = baseTempoMapRef.current;
    const baseTempo = baseTempoRef.current;
    const scale = newTempo / baseTempo; // user adjustment scales all XML tempos

    // Piecewise: compute start time (s) for each entry in measureOrder, with measure-specific tempo
    const measureStartSec = new Array(order.length);
    const measureSpWN = new Array(order.length);
    let t = 0;
    for (let i = 0; i < order.length; i++) {
      const mIdx = order[i];
      const bpm = (baseMap.get(mIdx) ?? baseTempo) * scale;
      const spWN = (60 / bpm) * 4;
      measureStartSec[i] = t;
      measureSpWN[i] = spWN;
      t += measureDurWN[mIdx] * spWN;
    }
    const totalDur = t;

    Tone.getTransport().cancel();

    rawNotesRef.current.forEach((n) => {
      const spWN = measureSpWN[n.orderIdx];
      const qDur = spWN * 0.25;
      const baseTime = applySwing(measureStartSec[n.orderIdx] + n.offsetWN * spWN, swing, qDur) + n.strumOffset;
      let dur = Math.max(n.durWN * spWN, 0.05);
      if (n.fermata) dur *= 1.7;
      if (n.mute) dur = 0.05;

      // Pitch transform: harmonic = +12 semitones, bend = + bend semitones
      let pitch = n.pitch;
      const targetMidi = pitchToMidi(pitch);
      let playMidi = targetMidi;
      if (n.harmonic) playMidi += 12;
      if (n.bend) playMidi += Math.round(n.bend);
      pitch = midiToPitch(playMidi);

      // Scoop / plop: chromatic grace notes approaching the original pitch
      if (n.grace) {
        const dir = n.grace === 'up' ? -1 : 1;
        const GRACE_DUR = 0.028;
        for (let g = 0; g < 2; g++) {
          const gracePitch = midiToPitch(targetMidi + dir * (2 - g));
          const graceTime = Math.max(0.001, baseTime - (2 - g) * GRACE_DUR);
          Tone.getTransport().schedule((at) => {
            try { synthRef.current?.triggerAttackRelease(gracePitch, GRACE_DUR * 0.8, at); } catch (_) {}
          }, graceTime);
        }
      }

      // Tremolo: rapid repeats during the note duration (1=eighths, 2=sixteenths, 3=32nds)
      if (n.tremolo > 0) {
        const repeatDur = (qDur / Math.pow(2, n.tremolo)); // beat / 2^slashes
        const repeats = Math.max(2, Math.floor(dur / repeatDur));
        for (let r = 0; r < repeats; r++) {
          const at = baseTime + r * (dur / repeats);
          Tone.getTransport().schedule((time) => {
            try { synthRef.current?.triggerAttackRelease(pitch, (dur / repeats) * 0.85, time); } catch (_) {}
          }, at);
        }
        return;
      }

      Tone.getTransport().schedule((time) => {
        try { synthRef.current?.triggerAttackRelease(pitch, dur, time, n.vibrato); } catch (_) {}
      }, baseTime);
    });

    Tone.getTransport().schedule(() => {
      Tone.getTransport().stop();
      setPlayingSync(false);
      cancelAnimationFrame(rafRef.current);
      osmdRef.current?.cursor.reset();
      cursorStepRef.current = 0;
      cursorLinearRef.current = 0;
      setCurrentTime(0);
    }, totalDur + 0.2);

    const newSync = rawSyncRef.current.map((s) => {
      const spWN = measureSpWN[s.orderIdx];
      const qDur = spWN * 0.25;
      return { ...s, time: applySwing(measureStartSec[s.orderIdx] + s.offsetWN * spWN, swing, qDur) };
    });
    newSync.sort((a, b) => a.time - b.time);
    playbackSyncRef.current = newSync;
    timingsRef.current = newSync.map(s => s.time);
    setTotalDuration(totalDur);
    currentTempoRef.current = newTempo;
    setTempo(newTempo);
  }, []);

  // One-time sampler init — independent of displayMode so toggling tab/notation doesn't rebuild audio
  useEffect(() => {
    let disposed = false;
    let synth;
    samplerReadyRef.current = (async () => {
      const Tone = await import('tone');
      if (disposed) return;
      await Promise.race([
        new Promise((resolve) => {
          synth = buildSamplerSynth(Tone, 'steel', resolve);
          if (!disposed) synthRef.current = synth;
        }),
        new Promise((resolve) => setTimeout(resolve, 8000)),
      ]);
    })();
    return () => {
      disposed = true;
      synth?.dispose();
      synthRef.current = null;
      samplerReadyRef.current = null;
    };
  }, []);

  useEffect(() => {
    let osmd;
    setStatus('Loading score…');
    setOverlays([]);
    setVibratoMarks([]);
    setCurrentTime(0);
    setTotalDuration(0);
    setPlayingSync(false);
    cursorStepRef.current = 0;
    cursorLinearRef.current = 0;

    // Wipe any leftover SVG from a prior render so the new OSMD instance can't stack on top of stale content
    if (containerRef.current) containerRef.current.innerHTML = '';
    osmdRef.current = null;

    async function init() {
      try {
        const OSMDLib = await import('opensheetmusicdisplay');
        const { OpenSheetMusicDisplay, ArticulationEnum } = OSMDLib;

        // Force VexFlow TabNotes to render stems (OSMD doesn't expose this)
        const VFC = OSMDLib.VexFlowConverter || OSMDLib.default?.VexFlowConverter;
        if (VFC && !VFC._patchedForStems) {
          const orig = VFC.CreateTabNote.bind(VFC);
          VFC.CreateTabNote = (gve) => {
            const tn = orig(gve);
            try {
              tn.render_options = { ...(tn.render_options || {}), draw_stem: true, draw_dots: true };
              tn.setStemDirection?.(1);
            } catch (_) {}
            return tn;
          };
          VFC._patchedForStems = true;
        }
        osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: false,
          drawSubtitle: false,
          drawComposer: false,
          followCursor: true,
          drawPartNames: false,
          drawMeasureNumbers: true,
          drawMeasureNumbersOnlyAtSystemStart: true,
          newSystemFromXML: true,
          defaultFontFamily: 'Edwin, "Times New Roman", serif',
        });

        const proxied = `/api/proxy-musicxml?url=${encodeURIComponent(MUSICXML_URL)}`;

        // Cached metadata is mode-independent — fetch + parse + cursor walk only on first run
        let xmlText;
        if (parsedDataRef.current) {
          xmlText = parsedDataRef.current.xmlText;
        } else {
          const xmlTextRaw = await fetch(proxied).then(r => r.text());
          xmlText = stripInstrumentLabel(xmlTextRaw);
        }

        const xmlForRender = displayMode === 'standard' ? convertToStandardNotation(xmlText) : xmlText;
        await osmd.load(xmlForRender);
        osmd.EngravingRules.TabBeamsRendered = true;
        osmd.EngravingRules.AutoBeamTabs = true;
        osmd.render();
        osmd.cursor.show();
        osmd.cursor.reset();
        osmdRef.current = osmd;

        setStatus('Preparing audio…');
        const Tone = await import('tone');
        // Sampler is built once on mount; wait for it to be ready (resolves immediately on subsequent re-renders)
        if (samplerReadyRef.current) {
          setStatus('Loading samples…');
          await samplerReadyRef.current;
        }

        let tempo;
        let articulations;

        if (parsedDataRef.current) {
          // Restore everything from cache — no parsing, no cursor walk, no rebuild
          const c = parsedDataRef.current;
          tempo = c.tempo;
          articulations = c.articulations;
          rawNotesRef.current = c.rawNotes;
          rawSyncRef.current = c.rawSync;
          measureOrderRef.current = c.measureOrder;
          measureDurWNRef.current = c.measureDurWN;
          baseTempoMapRef.current = c.baseTempoMap;
          baseTempoRef.current = c.tempo;
          swingRatioRef.current = c.swingRatio;
          measureSyncIdxRef.current = c.msMap;
          setSubtitle(c.subtitleText);
        } else {
          // First run — parse XML + walk OSMD cursor + build scheduling data
          tempo = 80;
          let strumInfo = new Map();
          articulations = new Map();
          let tempoMap = new Map();
          let swingRatio = 0.55; // MuseScore swing setting — not exported to MusicXML
          let subtitleText = '';
          try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const soundEl = xmlDoc.querySelector('sound[tempo]');
            if (soundEl) tempo = parseFloat(soundEl.getAttribute('tempo'));
            xmlDoc.querySelectorAll('credit').forEach((credit) => {
              const type = credit.querySelector('credit-type')?.textContent.trim().toLowerCase();
              if (type === 'subtitle') {
                const words = credit.querySelector('credit-words')?.textContent.trim();
                if (words) subtitleText = words;
              }
            });
            strumInfo = extractStrumInfo(xmlDoc);
            swingRatio = extractSwingRatio(xmlDoc);
            articulations = extractArticulations(xmlDoc);
            tempoMap = extractTempoMap(xmlDoc);
          } catch (_) {}

          setSubtitle(subtitleText);
          swingRatioRef.current = swingRatio;

          // Linear cursor pass — collect per-measure notes and cursor step positions
          const sourceMeasures = osmd.Sheet.SourceMeasures;
          const measureNotes = new Map();
          const measureSteps = new Map();
          let linearIdx = 0;

          osmd.cursor.reset();
          while (!osmd.cursor.iterator.EndReached) {
            const mIdx = osmd.cursor.iterator.CurrentMeasureIndex;
            const absWN = osmd.cursor.iterator.CurrentSourceTimestamp.RealValue;
            const offsetWN = absWN - (sourceMeasures[mIdx]?.AbsoluteTimestamp?.RealValue || 0);

            if (!measureNotes.has(mIdx)) measureNotes.set(mIdx, []);
            if (!measureSteps.has(mIdx)) measureSteps.set(mIdx, []);
            measureSteps.get(mIdx).push({ linearIdx, offsetWN });

            osmd.cursor.iterator.CurrentVoiceEntries?.forEach((ve) => {
              const isStaccato = ve.Articulations?.some(a => a.articulationEnum === ArticulationEnum.staccato);
              ve.Notes?.forEach((note) => {
                if (!note.isRest() && note.Pitch) {
                  if (note.NoteTie && note.NoteTie.StartNote !== note) return;
                  const pitch = osmdNoteToTone(note);
                  if (pitch) {
                    let durWN = note.Length.RealValue;
                    if (note.NoteTie?.Notes?.length > 1)
                      durWN = note.NoteTie.Notes.reduce((sum, n) => sum + n.Length.RealValue, 0);
                    if (isStaccato) durWN *= 0.5;
                    const noteKey = `${mIdx}_${Math.round(offsetWN * 10000)}`;
                    const art = articulations.get(noteKey) || {};
                    measureNotes.get(mIdx).push({
                      pitch, offsetWN, durWN,
                      strum: strumInfo.get(noteKey) || null,
                      grace: art.grace || null,
                      fermata: art.fermata || false,
                      tremolo: art.tremolo || 0,
                      bend: art.bend || 0,
                      harmonic: art.harmonic || false,
                      mute: art.mute || false,
                      vibrato: art.vibrato || false,
                    });
                  }
                }
              });
            });
            osmd.cursor.next();
            linearIdx++;
          }
          osmd.cursor.reset();

          // Expand with repeat order — store (orderIdx, offsetWN) for piecewise tempo
          const measureOrder = buildMeasureOrder(osmd.Sheet.repetitions, sourceMeasures.length);
          const measureDurWN = sourceMeasures.map(m => m?.Duration?.RealValue || 1);
          const rawNotes = [];
          const rawSync = [];

          // Forward-fill the tempo map so every measure has a tempo
          const filledTempoMap = new Map();
          let lastBpm = tempo;
          for (let i = 0; i < sourceMeasures.length; i++) {
            if (tempoMap.has(i)) lastBpm = tempoMap.get(i);
            filledTempoMap.set(i, lastBpm);
          }

          measureOrder.forEach((mIdx, orderIdx) => {
            const offsetGroups = new Map();
            (measureNotes.get(mIdx) || []).forEach(n => {
              const k = Math.round(n.offsetWN * 10000);
              if (!offsetGroups.has(k)) offsetGroups.set(k, []);
              offsetGroups.get(k).push(n);
            });
            offsetGroups.forEach((group, k) => {
              const offsetWN = k / 10000;
              const strumDir = group.find(n => n.strum)?.strum ?? null;
              const pushNote = (n, strumOffset) => {
                rawNotes.push({
                  pitch: n.pitch, orderIdx, offsetWN, durWN: n.durWN, strumOffset,
                  grace: n.grace, fermata: n.fermata, tremolo: n.tremolo,
                  bend: n.bend, harmonic: n.harmonic, mute: n.mute, vibrato: n.vibrato,
                });
              };
              if (strumDir && group.length > 1) {
                [...group]
                  .sort((a, b) => strumDir === 'down'
                    ? pitchToMidi(a.pitch) - pitchToMidi(b.pitch)
                    : pitchToMidi(b.pitch) - pitchToMidi(a.pitch))
                  .forEach((n, i) => pushNote(n, i * 0.018));
              } else {
                group.forEach(n => pushNote(n, 0));
              }
            });

            (measureSteps.get(mIdx) || []).forEach(({ linearIdx, offsetWN }) => {
              rawSync.push({ orderIdx, offsetWN, linearIdx });
            });
          });

          rawNotesRef.current = rawNotes;
          rawSyncRef.current = rawSync;
          measureOrderRef.current = measureOrder;
          measureDurWNRef.current = measureDurWN;
          baseTempoMapRef.current = filledTempoMap;
          baseTempoRef.current = tempo;

          // Build measure → first sync index map
          const msMap = new Map();
          measureOrder.forEach((mIdx) => {
            if (!msMap.has(mIdx)) {
              const firstStep = rawSync.findIndex(s =>
                (measureSteps.get(mIdx) || []).some(st => st.linearIdx === s.linearIdx)
              );
              if (firstStep !== -1) msMap.set(mIdx, firstStep);
            }
          });
          measureSyncIdxRef.current = msMap;

          // Cache everything mode-independent for subsequent renders
          parsedDataRef.current = {
            xmlText, tempo, swingRatio, subtitleText, articulations,
            rawNotes, rawSync, measureOrder, measureDurWN,
            baseTempoMap: filledTempoMap, msMap,
          };
        }

        // Compute measure overlays
        requestAnimationFrame(() => {
          const wrapper = scoreWrapperRef.current;
          const svg = wrapper?.querySelector('svg');
          if (!svg || !osmd.GraphicSheet?.MeasureList?.[0]) return;
          const vb = svg.viewBox.baseVal;
          if (!vb || vb.width === 0) return;
          const svgRect = svg.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          const offsetX = svgRect.left - wrapperRect.left;
          const offsetY = svgRect.top - wrapperRect.top;
          const scaleX = svgRect.width / vb.width;
          const scaleY = svgRect.height / vb.height;
          const uip = osmd.Drawer?.unitInPixels ?? 10;
          const toX = uip * scaleX;
          const toY = uip * scaleY;
          const PAD_TOP = 24;
          const PAD_BOTTOM = 30;
          setOverlays(
            osmd.GraphicSheet.MeasureList
              .map((measureRow, idx) => {
                const gm = measureRow?.[0];
                if (!gm?.PositionAndShape) return null;
                const { AbsolutePosition: pos, Size: size } = gm.PositionAndShape;
                return {
                  measureIdx: idx,
                  left: offsetX + pos.x * toX,
                  top: offsetY + pos.y * toY - PAD_TOP,
                  width: size.width * toX,
                  height: size.height * toY + PAD_TOP + PAD_BOTTOM,
                };
              })
              .filter(Boolean)
          );

          // Vibrato marker overlays — wavy line above the matched staff entry
          const vibMarks = [];
          let vIdx = 0;
          osmd.GraphicSheet.MeasureList.forEach((measureRow, mIdx) => {
            const gm = measureRow?.[0];
            gm?.staffEntries?.forEach((staffEntry) => {
              const ts = staffEntry.relInMeasureTimestamp?.RealValue;
              if (ts == null) return;
              const key = `${mIdx}_${Math.round(ts * 10000)}`;
              if (articulations.get(key)?.vibrato) {
                const ps = staffEntry.PositionAndShape;
                if (!ps) return;
                const x = offsetX + ps.AbsolutePosition.x * toX;
                const y = offsetY + ps.AbsolutePosition.y * toY;
                vibMarks.push({ id: vIdx++, left: x - 10, top: y - 30, width: 30, height: 16 });
              }
            });
          });
          setVibratoMarks(vibMarks);

        });

        // Initial scheduling
        scheduleAtTempo(tempo, Tone);
        setStatus(null);
      } catch (err) {
        console.error('embed-test init error:', err);
        setError('Failed to load: ' + err.message);
        setStatus(null);
      }
    }

    init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      import('tone').then((Tone) => { Tone.getTransport().stop(); Tone.getTransport().cancel(); });
      if (osmd) osmd.clear();
    };
  }, [scheduleAtTempo, displayMode]);

  // Show "Press Play" hint 5s after load, fade out after ~6s. Suppressed once user starts playback.
  useEffect(() => {
    const showTimer = setTimeout(() => {
      if (playStartedRef.current) return;
      setShowPlayHint(true);
      requestAnimationFrame(() => setPlayHintFade(true));
    }, 5000);
    const hideTimer = setTimeout(() => {
      setPlayHintFade(false);
      setTimeout(() => setShowPlayHint(false), 400);
    }, 11000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  // Hydrate displayMode from cross-page cookie (only if user has access for that mode)
  useEffect(() => {
    const pref = readDisplayPref();
    if (pref && (pref !== 'tab' || hasTabAccess)) {
      setDisplayMode(pref);
    }
  }, []);

  // Spacebar toggles play/pause
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && !status && !e.target.closest('input, textarea, select')) {
        e.preventDefault();
        playingRef.current ? handlePause() : handlePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status]);

  const startSync = useCallback(() => {
    const osmd = osmdRef.current;
    async function tick() {
      const Tone = await import('tone');
      const t = Tone.getTransport().seconds;
      setCurrentTime(t);

      const sync = playbackSyncRef.current;
      while (cursorStepRef.current < sync.length - 1 && sync[cursorStepRef.current + 1].time <= t)
        cursorStepRef.current++;

      const targetLinear = sync[cursorStepRef.current]?.linearIdx ?? 0;
      if (targetLinear < cursorLinearRef.current) {
        osmd.cursor.reset();
        for (let i = 0; i < targetLinear; i++) osmd.cursor.next();
        cursorLinearRef.current = targetLinear;
      } else {
        while (cursorLinearRef.current < targetLinear) { osmd.cursor.next(); cursorLinearRef.current++; }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
  }, []);

  async function handleTempoChange(delta) {
    const Tone = await import('tone');
    const newTempo = Math.max(40, Math.min(240, currentTempoRef.current + delta));
    // Piecewise tempo: scale is uniform so ratio of seconds preserves musical position
    const oldTempo = currentTempoRef.current;
    const oldSeconds = Tone.getTransport().seconds;
    const wasPlaying = playingRef.current;

    if (wasPlaying) { Tone.getTransport().pause(); cancelAnimationFrame(rafRef.current); setPlayingSync(false); }

    scheduleAtTempo(newTempo, Tone);

    const newSeconds = oldSeconds * (oldTempo / newTempo);
    Tone.getTransport().seconds = newSeconds;
    const sync = playbackSyncRef.current;
    let stepIdx = 0;
    while (stepIdx < sync.length - 1 && sync[stepIdx + 1].time <= newSeconds) stepIdx++;
    cursorStepRef.current = stepIdx;
    setCurrentTime(newSeconds);

    if (wasPlaying) { await Tone.start(); Tone.getTransport().start(); setPlayingSync(true); startSync(); }
  }

  async function handleMeasureClick(measureIdx) {
    const Tone = await import('tone');
    const syncIdx = measureSyncIdxRef.current.get(measureIdx);
    if (syncIdx == null) return;
    const targetTime = playbackSyncRef.current[syncIdx]?.time ?? 0;
    const targetLinear = playbackSyncRef.current[syncIdx]?.linearIdx ?? 0;
    cancelAnimationFrame(rafRef.current);
    const wasPlaying = playingRef.current;
    Tone.getTransport().pause();
    Tone.getTransport().seconds = targetTime;
    const osmd = osmdRef.current;
    if (targetLinear < cursorLinearRef.current) {
      osmd.cursor.reset();
      for (let i = 0; i < targetLinear; i++) osmd.cursor.next();
    } else {
      while (cursorLinearRef.current < targetLinear) { osmd.cursor.next(); cursorLinearRef.current++; }
    }
    cursorLinearRef.current = targetLinear;
    cursorStepRef.current = syncIdx;
    setCurrentTime(targetTime);
    if (wasPlaying) { await Tone.start(); Tone.getTransport().start(); startSync(); }
  }

  async function handlePlay() {
    playStartedRef.current = true;
    setPlayHintFade(false);
    setShowPlayHint(false);
    const Tone = await import('tone');
    await Tone.start();
    Tone.getTransport().start();
    setPlayingSync(true);
    startSync();
  }

  async function handlePause() {
    const Tone = await import('tone');
    Tone.getTransport().pause();
    setPlayingSync(false);
    cancelAnimationFrame(rafRef.current);
  }

  async function handleRestart() {
    const Tone = await import('tone');
    const osmd = osmdRef.current;
    cancelAnimationFrame(rafRef.current);
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    cursorStepRef.current = 0;
    cursorLinearRef.current = 0;
    osmd.cursor.reset();
    setCurrentTime(0);
    await Tone.start();
    Tone.getTransport().start();
    setPlayingSync(true);
    startSync();
  }

  function fmt(s) {
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  }

  function handleDisplayToggle(mode) {
    if (mode === displayMode) return;
    if (mode === 'tab' && !hasTabAccess) {
      setShowUpgrade(true);
      return;
    }
    setDisplayMode(mode);
    if (mode === 'standard') setPreviewMode(false);
    writeDisplayPref(mode);
  }

  function handleStartPreview() {
    setPreviewMode(true);
    setDisplayMode('tab');
    setShowUpgrade(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const embedCode = `<iframe src="https://www.ploddings.com/embed/${SONG_SLUG}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;

  const btnStyle = {
    background: 'none', border: '1px solid #444', color: '#ccc',
    cursor: 'pointer', borderRadius: '3px', padding: '2px 8px',
    fontSize: '14px', lineHeight: 1.4,
  };

  return (
    <>
      <Head>
        <title>{SONG_NAME} — {ARTIST_NAME} | Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
        {(() => {
          const ogParams = new URLSearchParams({
            title: SONG_NAME,
            artist: ARTIST_NAME,
            ...(subtitle ? { subtitle } : {}),
            ...(verifiedByEar ? { verified: '1' } : {}),
          });
          const ogUrl = `https://www.ploddings.com/api/og?${ogParams.toString()}`;
          const pageUrl = `https://www.ploddings.com/embed/${SONG_SLUG}`;
          const desc = `${SONG_NAME} — interactive transcription with synced audio playback by ${ARTIST_NAME}. Transcribed by Blahnok on Ploddings.`;
          return (
            <>
              <meta property="og:title"        content={`${SONG_NAME} — ${ARTIST_NAME}`} />
              <meta property="og:description"  content={desc} />
              <meta property="og:image"        content={ogUrl} />
              <meta property="og:image:width"  content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:url"          content={pageUrl} />
              <meta property="og:type"         content="music.song" />
              <meta property="og:site_name"    content="Ploddings" />
              <meta name="twitter:card"        content="summary_large_image" />
              <meta name="twitter:title"       content={`${SONG_NAME} — ${ARTIST_NAME}`} />
              <meta name="twitter:description" content={desc} />
              <meta name="twitter:image"       content={ogUrl} />
            </>
          );
        })()}
        <style>{`
          @font-face {
            font-family: 'Edwin';
            src: url('https://cdn.jsdelivr.net/gh/MuseScorefonts/Edwin@main/Edwin-Roman.otf') format('opentype');
            font-weight: normal; font-style: normal;
          }
          @font-face {
            font-family: 'Edwin';
            src: url('https://cdn.jsdelivr.net/gh/MuseScorefonts/Edwin@main/Edwin-Bold.otf') format('opentype');
            font-weight: bold; font-style: normal;
          }
          @font-face {
            font-family: 'Edwin';
            src: url('https://cdn.jsdelivr.net/gh/MuseScorefonts/Edwin@main/Edwin-Italic.otf') format('opentype');
            font-weight: normal; font-style: italic;
          }
          @keyframes ploddings-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
          .skel-light {
            background: linear-gradient(90deg, #e8e8e8 0%, #f6f6f6 50%, #e8e8e8 100%);
            background-size: 200% 100%;
            animation: ploddings-shimmer 1.6s ease-in-out infinite;
            border-radius: 4px;
          }
          .skel-dark {
            background: linear-gradient(90deg, #2a2a38 0%, #3a3a4a 50%, #2a2a38 100%);
            background-size: 200% 100%;
            animation: ploddings-shimmer 1.6s ease-in-out infinite;
            border-radius: 4px;
            opacity: 0.7;
          }
        `}</style>
      </Head>

      <div style={{
        background: '#1f1f23',
        minHeight: '100vh',
        padding: '20px 16px 32px',
        fontFamily: 'sans-serif',
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#2a2a30',
        border: '1px solid #000',
        borderRadius: '8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>

        {/* Toolbar shell with shimmer placeholders while loading (real toolbar mounts after) */}
        {(status || error) && (
          <div style={{
            background: '#1a1a2e', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderBottom: '1px solid #000',
          }}>
            <div className="skel-dark" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <div className="skel-dark" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <div className="skel-dark" style={{ width: '80px', height: '12px' }} />
            <div className="skel-dark" style={{ flex: 1, height: '4px', borderRadius: '2px' }} />
            <div className="skel-dark" style={{ width: '120px', height: '24px', borderRadius: '14px' }} />
            <div className="skel-dark" style={{ width: '90px', height: '20px' }} />
          </div>
        )}

        {!status && !error && (
          <div style={{
            background: '#1a1a2e', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            position: 'sticky', top: 0, zIndex: 100,
            borderBottom: '1px solid #000',
          }}>
            {showPlayHint && (
              <div
                onClick={() => { setPlayHintFade(false); setTimeout(() => setShowPlayHint(false), 400); }}
                style={{
                  position: 'absolute', top: '54px', left: '42px',
                  background: '#fff', color: '#222',
                  padding: '8px 12px', borderRadius: '6px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  fontSize: '13px', fontWeight: 500,
                  whiteSpace: 'nowrap', cursor: 'pointer',
                  opacity: playHintFade ? 1 : 0,
                  transform: playHintFade ? 'translateY(0)' : 'translateY(-4px)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease',
                  zIndex: 150,
                }}
              >
                <div style={{
                  position: 'absolute', top: '-6px', left: '24px',
                  width: 0, height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #fff',
                }} />
                Press <strong>Play</strong> to hear this score
              </div>
            )}
            <button onClick={handleRestart} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>⏮</button>
            <button
              onClick={playing ? handlePause : handlePlay}
              style={{
                background: '#f07820', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', color: '#fff', cursor: 'pointer',
                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <span style={{ color: '#aaa', fontSize: '12px', minWidth: '80px' }}>
              {fmt(currentTime)} / {fmt(totalDuration)}
            </span>
            <div style={{ flex: 1, height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: '#f07820', borderRadius: '2px',
                width: totalDuration ? `${(currentTime / totalDuration) * 100}%` : '0%',
                transition: 'width 0.1s linear',
              }} />
            </div>
            {/* Display mode toggle switch */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0,
              background: '#0d0d1a', borderRadius: '14px', padding: '2px',
              border: '1px solid #444',
            }}>
              {['standard', 'tab'].map((m) => {
                const active = displayMode === m;
                const locked = m === 'tab' && !hasTabAccess;
                return (
                  <button
                    key={m}
                    onClick={() => handleDisplayToggle(m)}
                    title={locked ? 'Tablature requires a subscription' : (m === 'tab' ? 'Show tablature' : 'Show standard notation')}
                    style={{
                      background: active ? '#f07820' : 'transparent',
                      color: active ? '#fff' : '#aaa',
                      border: 'none', borderRadius: '12px',
                      padding: '4px 12px', fontSize: '11px',
                      fontWeight: 600, cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    {m === 'tab' ? 'Tab' : 'Notation'}
                    {locked && <span style={{ fontSize: '9px', opacity: 0.7 }}>🔒</span>}
                  </button>
                );
              })}
            </div>
            {/* Tempo controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button onClick={() => handleTempoChange(-5)} style={btnStyle}>−</button>
              <span style={{ color: '#aaa', fontSize: '11px', minWidth: '54px', textAlign: 'center' }}>{tempo} BPM</span>
              <button onClick={() => handleTempoChange(+5)} style={btnStyle}>+</button>
            </div>
          </div>
        )}

        {/* Dark "page" area with white score card centered inside, MuseScore-style.
            Always mounted so OSMD has a valid containerRef even during loading. */}
        <div style={{ background: '#2a2a30', padding: '32px 16px' }}>
        <div style={{
          position: 'relative',
          maxWidth: '860px', margin: '0 auto',
          background: '#fff', overflow: 'hidden',
          border: '1px solid #000',
          boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
          // Reserve space for the skeleton during load so the overlay isn't clipped to a tiny card
          minHeight: (status || error) ? '560px' : undefined,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 1fr',
            alignItems: 'end', gap: '16px',
            padding: '20px 24px 8px',
            fontFamily: 'Edwin, "Times New Roman", serif',
          }}>
            <div /> {/* left column reserved for future annotations (tuning, instrument) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '34px', fontWeight: 'bold', lineHeight: 1.1 }}>{SONG_NAME}</div>
              {subtitle && (
                <div style={{ fontSize: '14px', color: '#444', marginTop: '6px' }}>{subtitle}</div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: '14px', color: '#222' }}>{ARTIST_NAME}</div>
          </div>
          <div ref={scoreWrapperRef} style={{ position: 'relative', maxHeight: '700px', overflowY: 'auto' }}>
            <div ref={containerRef} style={{ padding: '0 16px 16px', pointerEvents: 'none' }} />
            {vibratoMarks.map(({ id, left, top, width, height }) => (
              <div key={`vib-${id}`} style={{
                position: 'absolute', left, top, width, height,
                pointerEvents: 'none', zIndex: 5,
                fontSize: '14px', fontWeight: 700, color: '#222',
                textAlign: 'center', lineHeight: '16px',
                letterSpacing: '-2px',
              }}>〜</div>
            ))}
            {overlays.map(({ measureIdx, left, top, width, height }) => {
              const isLockedPreview = previewMode && displayMode === 'tab' && measureIdx >= PREVIEW_BARS;
              return (
                <div
                  key={measureIdx}
                  onClick={() => isLockedPreview ? setShowUpgrade(true) : handleMeasureClick(measureIdx)}
                  onMouseEnter={() => setHoveredMeasure(measureIdx)}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  style={{
                    position: 'absolute', left, top, width, height,
                    zIndex: 10,
                    background: hoveredMeasure === measureIdx
                      ? (isLockedPreview ? 'rgba(120,120,120,0.18)' : 'rgba(240,120,32,0.18)')
                      : 'transparent',
                    border: `2px solid ${hoveredMeasure === measureIdx
                      ? (isLockedPreview ? 'rgba(120,120,120,0.5)' : 'rgba(240,120,32,0.6)')
                      : 'transparent'}`,
                    cursor: 'pointer', boxSizing: 'border-box', borderRadius: '2px',
                    transition: 'background 0.1s, border-color 0.1s',
                  }}
                />
              );
            })}
            {/* Preview-mode blur over locked bars */}
            {previewMode && displayMode === 'tab' && overlays.filter(o => o.measureIdx >= PREVIEW_BARS).map(o => (
              <div
                key={`lock-${o.measureIdx}`}
                style={{
                  position: 'absolute',
                  left: o.left, top: o.top - 4, width: o.width, height: o.height + 8,
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(3px)',
                  WebkitBackdropFilter: 'blur(3px)',
                  pointerEvents: 'none', zIndex: 15,
                }}
              />
            ))}
            {/* Single CTA banner anchored over the first locked bar */}
            {previewMode && displayMode === 'tab' && (() => {
              const first = overlays.find(o => o.measureIdx === PREVIEW_BARS);
              if (!first) return null;
              return (
                <div
                  onClick={() => setShowUpgrade(true)}
                  style={{
                    position: 'absolute',
                    left: first.left, top: first.top + first.height / 2 - 22,
                    padding: '8px 14px',
                    background: '#1a1a2e', color: '#fff',
                    borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                    cursor: 'pointer', zIndex: 25,
                    whiteSpace: 'nowrap',
                  }}
                >
                  🔒 Unlock the full tab →
                </div>
              );
            })()}
          </div>
          {/* Loading skeleton overlay — sits on top of the real card so OSMD can render underneath at full size */}
          {(status || error) && (
            <div style={{
              position: 'absolute', inset: 0,
              background: '#fff',
              padding: '24px',
              zIndex: 50,
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 2fr 1fr',
                alignItems: 'end', gap: '16px', marginBottom: '32px',
              }}>
                <div />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div className="skel-light" style={{ width: '60%', height: '36px' }} />
                  <div className="skel-light" style={{ width: '50%', height: '14px' }} />
                </div>
                <div className="skel-light" style={{ width: '70%', height: '14px', justifySelf: 'end' }} />
              </div>
              {[0,1,2,3].map(i => (
                <div key={i} className="skel-light" style={{
                  width: '100%', height: '64px',
                  marginBottom: i < 3 ? '32px' : 0,
                  opacity: 1 - i * 0.15,
                }} />
              ))}
              <div style={{
                textAlign: 'center', marginTop: '24px',
                fontSize: '13px',
                color: error ? '#c00' : '#888',
              }}>
                {error || status}
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Footer: song info + Powered by Ploddings */}
        <div style={{
          padding: '10px 16px', background: '#f5f5f5',
          borderTop: '1px solid #000',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '12px', color: '#777',
        }}>
          <a href="https://www.ploddings.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#999', textDecoration: 'none' }}>
            Powered by <strong style={{ color: '#f07820' }}>Ploddings</strong>
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Transcribed by <a href="https://www.ploddings.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#f07820', textDecoration: 'none', fontWeight: 600 }}>Blahnok</a>
            {verifiedByEar && (
              <span
                title="This transcription was done by ear from the original recording — not auto-generated."
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: '#e8f5e9', color: '#1f7a3a',
                  border: '1px solid #b9d8c1',
                  padding: '2px 8px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 600, cursor: 'help',
                }}
              >
                <span aria-hidden="true">✓</span>
                Verified by ear
              </span>
            )}
          </span>
        </div>

        {/* Share / embed section */}
        <div style={{
          padding: '12px 16px 16px',
          background: '#f9f9f9',
          borderTop: '1px solid #ddd',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#444' }}>Embed this tab on your site</span>
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

        {showUpgrade && (
          <div
            onClick={() => setShowUpgrade(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 200,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: '8px', padding: '28px 32px',
                maxWidth: '380px', width: '90%', textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative',
              }}
            >
              <button
                onClick={() => setShowUpgrade(false)}
                aria-label="Close"
                style={{
                  position: 'absolute', top: '8px', right: '12px',
                  background: 'none', border: 'none', fontSize: '20px',
                  color: '#999', cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔒</div>
              <div style={{ fontFamily: 'Edwin, "Times New Roman", serif', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                Tablature is a Plus feature
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: 1.5 }}>
                Standard notation is free. Upgrade to view fingering-accurate tablature with playback for every transcription on Ploddings.
              </div>
              <a
                href="/pricing"
                style={{
                  display: 'inline-block', background: '#f07820',
                  color: '#fff', padding: '10px 24px',
                  borderRadius: '6px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '14px',
                }}
              >
                Upgrade to Plus
              </a>
              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={handleStartPreview}
                  style={{
                    background: 'none', border: 'none',
                    color: '#444', textDecoration: 'underline',
                    cursor: 'pointer', fontSize: '13px', padding: 0,
                  }}
                >
                  Preview the first {PREVIEW_BARS} bars free
                </button>
              </div>
              <div style={{ marginTop: '8px' }}>
                <a href="/login" style={{ fontSize: '12px', color: '#1a6ef5', textDecoration: 'none' }}>
                  Already a subscriber? Sign in
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
      </div>
    </>
  );
}
