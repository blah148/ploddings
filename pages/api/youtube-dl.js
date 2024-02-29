import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { supabase } from '../../utils/supabase'; // Ensure this points to your Supabase client initialization

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { videoUrl } = req.body;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: 'Invalid or missing YouTube video URL.' });
  }

  const videoID = ytdl.getURLVideoID(videoUrl);
  const info = await ytdl.getInfo(videoID);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
  const outputPath = `tmp/${title}.mp3`;

  // Using a PassThrough stream to pipe the video stream directly to Supabase Storage without saving locally
  const passThrough = new PassThrough();

  try {
    const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
    ffmpeg(videoStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .pipe(passThrough, { end: true });

    const { data, error } = await supabase.storage
      .from('youtube-dl')
      .upload(outputPath, passThrough, {
        contentType: 'audio/mpeg',
        upsert: false // Change to true if you want to overwrite existing files with the same name
      });

    if (error) {
      throw error;
    }

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.Key}`;
    console.log(`File uploaded: ${fileUrl}`);
    res.status(200).json({ message: 'Conversion and upload successful', url: fileUrl });
  } catch (error) {
    console.error('Conversion or upload failed:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

