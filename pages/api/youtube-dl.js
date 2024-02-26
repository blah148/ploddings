import { join } from 'path';
import { createWriteStream } from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { videoUrl } = req.body;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).json({ error: 'Invalid or missing YouTube video URL.' });
  }

  try {
    const videoID = ytdl.getURLVideoID(videoUrl);
    const info = await ytdl.getInfo(videoID);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
    const outputPath = join(process.cwd(), 'public', 'tmp', `${title}.mp3`);

    const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
    ffmpeg(videoStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => {
        console.error('An error occurred:', err.message);
        res.status(500).end('Conversion failed due to an error.');
      })
      .on('end', () => {
        // Construct the URL to access the saved MP3 file
        const fileUrl = `http://${req.headers.host}/tmp/${title}.mp3`;
        console.log(`File saved: ${outputPath}`);
        res.status(200).json({ message: 'Conversion successful', url: fileUrl });
      })
      .save(outputPath);

  } catch (error) {
    console.error('Conversion failed:', error);
    // Ensure a response is sent even if an error occurs outside of ffmpeg's error handler
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

