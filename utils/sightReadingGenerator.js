// Generates randomized sight-reading exercises as MusicXML.
// Bar shape: 4/4 with beats 1-2 in A minor and beats 3-4 in Bb mixolydian #11.
// The two scales share {C,D,E,F,G}; only A↔Bb and B↔Ab move by a semitone.

const AMINOR = [
  { step: 'A', alter: 0, octave: 3 },
  { step: 'B', alter: 0, octave: 3 },
  { step: 'C', alter: 0, octave: 4 },
  { step: 'D', alter: 0, octave: 4 },
  { step: 'E', alter: 0, octave: 4 },
  { step: 'F', alter: 0, octave: 4 },
  { step: 'G', alter: 0, octave: 4 },
  { step: 'A', alter: 0, octave: 4 },
  { step: 'B', alter: 0, octave: 4 },
  { step: 'C', alter: 0, octave: 5 },
  { step: 'D', alter: 0, octave: 5 },
  { step: 'E', alter: 0, octave: 5 },
];

const BBMIX11 = [
  { step: 'B', alter: -1, octave: 3 },
  { step: 'C', alter: 0, octave: 4 },
  { step: 'D', alter: 0, octave: 4 },
  { step: 'E', alter: 0, octave: 4 },
  { step: 'F', alter: 0, octave: 4 },
  { step: 'G', alter: 0, octave: 4 },
  { step: 'A', alter: -1, octave: 4 },
  { step: 'B', alter: -1, octave: 4 },
  { step: 'C', alter: 0, octave: 5 },
  { step: 'D', alter: 0, octave: 5 },
  { step: 'E', alter: 0, octave: 5 },
];

const STEP_TO_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => 12 * (n.octave + 1) + STEP_TO_PC[n.step] + n.alter;

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Bias the next pick to within `span` semitones of the previous top note so the
// line moves like a melody instead of jumping around the staff at random.
function pickNear(scale, ref, span = 5) {
  if (!ref) return rand(scale);
  const r = midi(ref);
  const near = scale.filter((n) => Math.abs(midi(n) - r) <= span);
  return rand(near.length ? near : scale);
}

// Choose a second note 2 or 5 scale degrees below the top for a 3rd or 6th
// double stop — the two most idiomatic intervals on guitar.
function pickInterval(scale, top) {
  const idx = scale.findIndex(
    (n) => n.step === top.step && n.alter === top.alter && n.octave === top.octave,
  );
  if (idx < 0) return null;
  const candidates = [2, 5].filter((d) => idx - d >= 0);
  if (!candidates.length) return null;
  return scale[idx - rand(candidates)];
}

function buildBeat(scale, prev, doubleStopProb) {
  const top = pickNear(scale, prev, 5);
  const notes = [top];
  if (Math.random() < doubleStopProb) {
    const lower = pickInterval(scale, top);
    if (lower) notes.unshift(lower);
  }
  return notes;
}

function harmonyXml(chord) {
  if (chord === 'Am') {
    return `      <harmony print-frame="no">
        <root><root-step>A</root-step></root>
        <kind text="m">minor</kind>
      </harmony>
`;
  }
  return `      <harmony print-frame="no">
        <root><root-step>B</root-step><root-alter>-1</root-alter></root>
        <kind text="7\u266F11">dominant</kind>
        <degree>
          <degree-value>11</degree-value>
          <degree-alter>1</degree-alter>
          <degree-type>add</degree-type>
        </degree>
      </harmony>
`;
}

function accidentalName(alter) {
  if (alter === -1) return 'flat';
  if (alter === 1) return 'sharp';
  if (alter === -2) return 'flat-flat';
  if (alter === 2) return 'double-sharp';
  return null;
}

function noteXml(note, isChord) {
  const lines = ['      <note>'];
  if (isChord) lines.push('        <chord/>');
  lines.push('        <pitch>');
  lines.push(`          <step>${note.step}</step>`);
  if (note.alter !== 0) lines.push(`          <alter>${note.alter}</alter>`);
  lines.push(`          <octave>${note.octave}</octave>`);
  lines.push('        </pitch>');
  lines.push('        <duration>2</duration>');
  lines.push('        <voice>1</voice>');
  lines.push('        <type>quarter</type>');
  const acc = accidentalName(note.alter);
  if (acc) lines.push(`        <accidental>${acc}</accidental>`);
  lines.push('      </note>');
  return lines.join('\n') + '\n';
}

function measureXml(num, isFirst, doubleStopProb, prevTop) {
  let prev = prevTop;
  let xml = `    <measure number="${num}">\n`;
  if (isFirst) {
    xml += `      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
`;
  }

  // Beats 1-2: Am
  xml += harmonyXml('Am');
  for (let i = 0; i < 2; i++) {
    const notes = buildBeat(AMINOR, prev, doubleStopProb);
    notes.forEach((n, j) => { xml += noteXml(n, j > 0); });
    prev = notes[notes.length - 1];
  }
  // Beats 3-4: Bb7#11
  xml += harmonyXml('Bb7#11');
  for (let i = 0; i < 2; i++) {
    const notes = buildBeat(BBMIX11, prev, doubleStopProb);
    notes.forEach((n, j) => { xml += noteXml(n, j > 0); });
    prev = notes[notes.length - 1];
  }
  xml += `    </measure>\n`;
  return { xml, lastTop: prev };
}

export function generateSightReadingExercise({ bars = 8, doubleStopProb = 0.35 } = {}) {
  let body = '';
  let prevTop = null;
  for (let i = 0; i < bars; i++) {
    const { xml, lastTop } = measureXml(i + 1, i === 0, doubleStopProb, prevTop);
    body += xml;
    prevTop = lastTop;
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Sight Reading \u2014 Am \u2502 Bb7\u266F11</work-title></work>
  <part-list>
    <score-part id="P1">
      <part-name>Guitar</part-name>
      <score-instrument id="P1-I1"><instrument-name>Acoustic Guitar</instrument-name></score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>26</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
${body}  </part>
</score-partwise>
`;
}
