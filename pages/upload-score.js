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

  const sampler = new Tone.Sampler({ urls, baseUrl, onload: onReady }).connect(compressor);
  sampler.volume.value = 12;

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

export default function UploadScore() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const synthRef = useRef(null);
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
  const [xmlSource, setXmlSource] = useState(null); // null = use default URL
  const [uploadName, setUploadName] = useState(null);

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

  useEffect(() => {
    let osmd;
    setStatus('Loading score…');
    setOverlays([]);
    setCurrentTime(0);
    setTotalDuration(0);
    setPlayingSync(false);
    cursorStepRef.current = 0;
    cursorLinearRef.current = 0;

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

        // Load from uploaded file text or default URL
        if (xmlSource) {
          await osmd.load(xmlSource);
        } else {
          await osmd.load(proxied);
        }
        osmd.EngravingRules.TabBeamsRendered = true;
        osmd.EngravingRules.AutoBeamTabs = true;
        osmd.render();
        osmd.cursor.show();
        osmd.cursor.reset();
        osmdRef.current = osmd;

        setStatus('Preparing audio…');
        const Tone = await import('tone');

        setStatus('Loading samples…');
        await Promise.race([
          new Promise((resolve) => { synthRef.current = buildSamplerSynth(Tone, 'steel', resolve); }),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ]);

        // Parse MusicXML for tempo, strum, and swing
        let tempo = 80;
        let strumInfo = new Map();
        let articulations = new Map();
        let tempoMap = new Map();
        let swingRatio = 0.55; // MuseScore swing setting — not exported to MusicXML
        try {
          const xmlText = xmlSource ?? await fetch(proxied).then(r => r.text());
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          const soundEl = xmlDoc.querySelector('sound[tempo]');
          if (soundEl) tempo = parseFloat(soundEl.getAttribute('tempo'));
          strumInfo = extractStrumInfo(xmlDoc);
          swingRatio = extractSwingRatio(xmlDoc);
          articulations = extractArticulations(xmlDoc);
          tempoMap = extractTempoMap(xmlDoc);
        } catch (_) {}

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
        console.error('upload-score init error:', err);
        setError('Failed to load: ' + err.message);
        setStatus(null);
      }
    }

    init();

    return () => {
      cancelAnimationFrame(rafRef.current);
      synthRef.current?.dispose();
      import('tone').then((Tone) => { Tone.getTransport().stop(); Tone.getTransport().cancel(); });
      if (osmd) osmd.clear();
    };
  }, [scheduleAtTempo, xmlSource]);

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

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadName(file.name);
      setXmlSource(ev.target.result);
    };
    reader.readAsText(file);
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
        <title>Upload Score — Ploddings</title>
        <meta name="robots" content="noindex, nofollow" />
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
        `}</style>
      </Head>

      <div style={{ fontFamily: 'sans-serif', maxWidth: '960px', margin: '0 auto', padding: '16px' }}>

        {/* MusicXML upload for preview */}
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{
            display: 'inline-block', padding: '5px 12px', background: '#1a1a2e',
            color: '#ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
          }}>
            Upload MusicXML
            <input type="file" accept=".musicxml,.xml" onChange={handleFileUpload}
              style={{ display: 'none' }} />
          </label>
          {uploadName
            ? <span style={{ fontSize: '12px', color: '#555' }}>{uploadName}</span>
            : <span style={{ fontSize: '12px', color: '#aaa' }}>or using default: {SONG_NAME}</span>
          }
        </div>

        {(status || error) && (
          <div style={{ border: '1px solid #ddd', borderRadius: '8px 8px 0 0', background: '#fff', minHeight: '80px' }}>
            {status && <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>{status}</div>}
            {error && <div style={{ padding: '40px', textAlign: 'center', color: '#c00' }}>{error}</div>}
          </div>
        )}

        {!status && !error && (
          <div style={{
            background: '#1a1a2e', padding: '10px 16px', borderRadius: '8px 8px 0 0',
            display: 'flex', alignItems: 'center', gap: '12px',
            position: 'sticky', top: 0, zIndex: 100,
          }}>
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
            {/* Tempo controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button onClick={() => handleTempoChange(-5)} style={btnStyle}>−</button>
              <span style={{ color: '#aaa', fontSize: '11px', minWidth: '54px', textAlign: 'center' }}>{tempo} BPM</span>
              <button onClick={() => handleTempoChange(+5)} style={btnStyle}>+</button>
            </div>
          </div>
        )}

        <div style={{ border: '1px solid #ddd', borderTop: 'none', background: '#fff', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', paddingTop: '20px', paddingBottom: '4px' }}>
            <div style={{ fontFamily: 'Edwin, "Times New Roman", serif', fontSize: '34px', fontWeight: 'bold' }}>{SONG_NAME}</div>
            <div style={{ fontFamily: 'Edwin, "Times New Roman", serif', fontSize: '13px', color: '#666', marginTop: '2px' }}>{ARTIST_NAME}</div>
          </div>
          <div ref={scoreWrapperRef} style={{ position: 'relative' }}>
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
            {overlays.map(({ measureIdx, left, top, width, height }) => (
              <div
                key={measureIdx}
                onClick={() => handleMeasureClick(measureIdx)}
                onMouseEnter={() => setHoveredMeasure(measureIdx)}
                onMouseLeave={() => setHoveredMeasure(null)}
                style={{
                  position: 'absolute', left, top, width, height,
                  zIndex: 10,
                  background: hoveredMeasure === measureIdx ? 'rgba(240,120,32,0.18)' : 'transparent',
                  border: `2px solid ${hoveredMeasure === measureIdx ? 'rgba(240,120,32,0.6)' : 'transparent'}`,
                  cursor: 'pointer', boxSizing: 'border-box', borderRadius: '2px',
                  transition: 'background 0.1s, border-color 0.1s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer: song info + Powered by Ploddings */}
        <div style={{
          padding: '10px 16px', background: '#f5f5f5',
          borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '12px', color: '#777',
        }}>
          <a href="https://www.ploddings.com" target="_blank" rel="noopener noreferrer"
            style={{ color: '#999', textDecoration: 'none' }}>
            Powered by <strong style={{ color: '#f07820' }}>Ploddings</strong>
          </a>
          <span>
            Transcribed by <a href="https://www.ploddings.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#f07820', textDecoration: 'none', fontWeight: 600 }}>Blahnok</a>
          </span>
        </div>

        {/* Share / embed section */}
        <div style={{
          padding: '12px 16px 16px',
          background: '#f9f9f9',
          border: '1px solid #ddd', borderTop: 'none',
          borderRadius: '0 0 8px 8px',
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

      </div>
    </>
  );
}
