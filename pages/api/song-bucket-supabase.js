// utils/song-bucket-supabase.js

export default function handler(req, res) {
  res.status(200).json({ bucket: 'youtube-dl' });
}

