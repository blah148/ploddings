import { join } from 'path';
import { existsSync, unlink } from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

const deletionTimers = new Map();
const deleteAfter = 43200000; // 12 hours in milliseconds

function scheduleFileDeletion(filePath) {
    if (deletionTimers.has(filePath)) {
        clearTimeout(deletionTimers.get(filePath));
        deletionTimers.delete(filePath);
    }

    const timer = setTimeout(() => {
        unlink(filePath, err => {
            if (err) console.error(`Failed to delete file: ${filePath}`, err);
            else console.log(`File deleted: ${filePath}`);
        });
        deletionTimers.delete(filePath);
    }, deleteAfter);

    deletionTimers.set(filePath, timer);
}

function convertVideoToMp3(videoUrl, outputPath) {
    return new Promise((resolve, reject) => {
        const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
        ffmpeg(videoStream)
            .audioCodec('libmp3lame')
            .format('mp3')
            .save(outputPath)
            .on('end', () => {
                console.log(`File saved: ${outputPath}`);
                resolve();
            })
            .on('error', (err) => {
                console.error('An error occurred:', err.message);
                reject(err);
            });
    });
}

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

    if (existsSync(outputPath)) {
      console.log(`File already exists: ${outputPath}`);
      scheduleFileDeletion(outputPath);
      const fileUrl = `https://${req.headers.host}/tmp/${title}.mp3`;
      return res.status(200).json({ message: 'File served from existing conversion.', url: fileUrl });
    } else {
      await convertVideoToMp3(videoUrl, outputPath);
      scheduleFileDeletion(outputPath);
      const fileUrl = `https://${req.headers.host}/tmp/${title}.mp3`;
      res.status(200).json({ message: 'Conversion successful', url: fileUrl });
    }
  } catch (error) {
    console.error('Conversion failed:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
};

