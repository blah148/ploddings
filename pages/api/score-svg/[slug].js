// PHASE C — Experimental server-side OSMD rendering.
// Returns the rendered SVG + audio/cursor metadata for a song.
// Source XML never leaves the server.
//
// This is a parallel endpoint — does NOT replace /api/score/[slug] yet.
// Existing client-side rendering keeps working; this is for testing the SSR pipeline.
import { JSDOM } from 'jsdom';
import { supabase } from '../../../utils/supabase';

export const config = {
  api: { responseLimit: false },
  // OSMD render is slow — bump default function timeout
  maxDuration: 30,
};

let cachedAuth = null;
let authExpiry = 0;

async function getB2Auth() {
  if (cachedAuth && Date.now() < authExpiry) return cachedAuth;
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  if (!keyId || !appKey) throw new Error('B2 credentials missing');
  const basic = Buffer.from(`${keyId}:${appKey}`).toString('base64');
  const r = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!r.ok) throw new Error(`B2 auth failed (${r.status})`);
  const data = await r.json();
  cachedAuth = { authToken: data.authorizationToken };
  authExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedAuth;
}

async function fetchXml(songMusicXMLUrl) {
  const bucketName = process.env.B2_BUCKET_NAME_XML;
  const allowedPrefix = bucketName
    ? `https://f005.backblazeb2.com/file/${bucketName}/`
    : 'https://f005.backblazeb2.com/file/';
  if (!songMusicXMLUrl.startsWith(allowedPrefix)) throw new Error('Invalid score URL');

  const auth = await getB2Auth();
  const upstream = await fetch(songMusicXMLUrl, { headers: { Authorization: auth.authToken } });
  if (!upstream.ok) {
    if (upstream.status === 401) { cachedAuth = null; authExpiry = 0; }
    throw new Error(`Upstream ${upstream.status}`);
  }
  const isMxl = /\.mxl(\?|$)/i.test(songMusicXMLUrl);
  const buf = Buffer.from(await upstream.arrayBuffer());
  if (isMxl) {
    const JSZipMod = await import('jszip');
    const JSZip = JSZipMod.default || JSZipMod;
    const zip = await JSZip.loadAsync(buf);
    let xmlPath;
    const container = zip.file('META-INF/container.xml');
    if (container) {
      const cText = await container.async('text');
      const m = cText.match(/<rootfile[^>]*full-path\s*=\s*["']([^"']+)["']/i);
      if (m) xmlPath = m[1];
    }
    if (!xmlPath) {
      xmlPath = Object.keys(zip.files).find(
        (f) => /\.(musicxml|xml)$/i.test(f) && !f.startsWith('META-INF/')
      );
    }
    return xmlPath ? await zip.file(xmlPath).async('text') : '';
  }
  return buf.toString('utf-8');
}

// Set up the jsdom globals OSMD needs. Done lazily once per cold start.
let jsdomInitialized = false;
function initJsdomGlobals() {
  if (jsdomInitialized) return;
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
  global.XMLSerializer = dom.window.XMLSerializer;
  global.HTMLElement = dom.window.HTMLElement;
  global.SVGElement = dom.window.SVGElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
  global.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  // VexFlow uses canvas getBBox / getBoundingClientRect; jsdom returns mostly zero.
  // OSMD has fallbacks but layout will be approximate.
  jsdomInitialized = true;
}

function midiToPitch(midi) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug' });

  // Lookup
  const { data: song, error: sErr } = await supabase
    .from('content')
    .select('musicXML')
    .eq('slug', slug)
    .single();
  if (sErr || !song?.musicXML) {
    return res.status(404).json({
      error: 'Score not found',
      slug,
      supabaseError: sErr?.message || null,
      hasMusicXML: !!song?.musicXML,
      foundRow: !!song,
    });
  }

  try {
    const xmlText = await fetchXml(song.musicXML);

    // Render via OSMD in jsdom
    initJsdomGlobals();
    const containerId = `osmd-container-${Date.now()}`;
    const container = global.document.createElement('div');
    container.id = containerId;
    container.style.width = '1000px';
    global.document.body.appendChild(container);

    const OSMDLib = await import('opensheetmusicdisplay');
    const { OpenSheetMusicDisplay } = OSMDLib;
    const osmd = new OpenSheetMusicDisplay(container, {
      autoResize: false,
      backend: 'svg',
      drawTitle: false,
      drawSubtitle: false,
      drawComposer: false,
      drawPartNames: false,
      drawMeasureNumbers: true,
      drawMeasureNumbersOnlyAtSystemStart: true,
      newSystemFromXML: true,
    });

    await osmd.load(xmlText);
    osmd.EngravingRules.PageLeftMargin = 0;
    osmd.EngravingRules.PageRightMargin = 0;
    osmd.EngravingRules.SystemLeftMargin = 0;
    osmd.EngravingRules.SystemRightMargin = 0;
    osmd.render();

    const svgEl = container.querySelector('svg');
    const svgString = svgEl ? svgEl.outerHTML : '';

    // === Extract audio metadata ===
    const sourceMeasures = osmd.Sheet.SourceMeasures;
    const measureDurWN = sourceMeasures.map((m) => m?.Duration?.RealValue || 1);
    const notesPerMeasure = new Map();
    const stepsPerMeasure = new Map();
    let linearIdx = 0;
    let tempo = 80;

    // Parse tempo from XML directly (cursor-based isn't reliable for tempo)
    const tempoMatch = xmlText.match(/<sound[^>]*tempo\s*=\s*["']([\d.]+)["']/i);
    if (tempoMatch) tempo = parseFloat(tempoMatch[1]);

    osmd.cursor.show();
    osmd.cursor.reset();
    while (!osmd.cursor.iterator.EndReached) {
      const mIdx = osmd.cursor.iterator.CurrentMeasureIndex;
      const absWN = osmd.cursor.iterator.CurrentSourceTimestamp.RealValue;
      const offsetWN = absWN - (sourceMeasures[mIdx]?.AbsoluteTimestamp?.RealValue || 0);
      if (!notesPerMeasure.has(mIdx)) notesPerMeasure.set(mIdx, []);
      if (!stepsPerMeasure.has(mIdx)) stepsPerMeasure.set(mIdx, []);
      stepsPerMeasure.get(mIdx).push({ linearIdx, offsetWN });

      osmd.cursor.iterator.CurrentVoiceEntries?.forEach((ve) => {
        ve.Notes?.forEach((note) => {
          if (!note.isRest() && note.Pitch) {
            if (note.NoteTie && note.NoteTie.StartNote !== note) return;
            let durWN = note.Length.RealValue;
            if (note.NoteTie?.Notes?.length > 1) {
              durWN = note.NoteTie.Notes.reduce((s, n) => s + n.Length.RealValue, 0);
            }
            const midi = note.halfTone;
            if (midi != null) {
              notesPerMeasure.get(mIdx).push({ pitch: midiToPitch(midi), offsetWN, durWN });
            }
          }
        });
      });
      osmd.cursor.next();
      linearIdx++;
    }

    // Expand measure order with repeats
    const measureOrder = [];
    {
      const realReps = (osmd.Sheet.repetitions || []).filter(r => !r.virtualOverallRepetition);
      const repeatMap = new Map();
      realReps.forEach(rep => {
        const startIdx = rep.startMarker?.measureIndex ?? 0;
        const endIdx = rep.backwardJumpInstructions?.[0]?.measureIndex ?? sourceMeasures.length - 1;
        const extra = (rep.userNumberOfRepetitions || 2) - 1;
        repeatMap.set(endIdx, { startIdx, timesLeft: extra });
      });
      let i = 0;
      while (i < sourceMeasures.length) {
        measureOrder.push(i);
        if (repeatMap.has(i)) {
          const region = repeatMap.get(i);
          if (region.timesLeft > 0) { region.timesLeft--; i = region.startIdx; continue; }
        }
        i++;
      }
    }

    // Compute total duration (uniform tempo for now)
    const spWN = (60 / tempo) * 4;
    const totalDur = measureOrder.reduce((sum, mIdx) => sum + measureDurWN[mIdx] * spWN, 0);

    // Cleanup
    osmd.clear?.();
    container.remove();

    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    res.json({
      svg: svgString,
      tempo,
      totalDur,
      measureOrder,
      measureDurWN,
      notes: Array.from(notesPerMeasure.entries()).map(([mIdx, arr]) => ({ mIdx, arr })),
      steps: Array.from(stepsPerMeasure.entries()).map(([mIdx, arr]) => ({ mIdx, arr })),
    });
  } catch (err) {
    console.error('score-svg error:', err);
    return res.status(500).json({ error: err.message || 'render error' });
  }
}
