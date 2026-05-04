// Diagnostic-only endpoint — the test-alphatab page POSTs JSON here so the payload
// shows up in the `yarn dev` terminal instead of only the browser console.
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const tag = req.query.tag || 'debug';
  console.log(`\n──── [${tag}] ────`);
  try {
    console.log(JSON.stringify(req.body, null, 2));
  } catch {
    console.log(req.body);
  }
  console.log('──── end ────\n');
  res.status(200).json({ ok: true });
}
