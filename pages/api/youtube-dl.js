import { join } from 'path';
import { existsSync, unlink } from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

// Store scheduled deletion timers
const deletionTimers = new Map();

const deleteAfter = 43200000; // 12 hours in milliseconds

// Function to schedule or reset file deletion
function scheduleFileDeletion(filePath) {
    // Clear existing timer if present
    if (deletionTimers.has(filePath)) {
        const timer = deletionTimers.get(filePath);
        clearTimeout(timer);
        deletionTimers.delete(filePath);
    }

    // Schedule new deletion timer
    const timer = setTimeout(() => {
        unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete file: ${filePath}`, err);
            else console.log(`File deleted: ${filePath}`);
        });
        deletionTimers.delete(filePath);
    }, deleteAfter);

    // Store the timer
    deletionTimers.set(filePath, timer);
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
		let fileUrl = `http://${req.headers.host}/tmp/${title}.mp3`;

    // Check if the file already exists
    if (existsSync(outputPath)) {
      console.log(`File already exists: ${outputPath}`);
      // Extend the file's lifetime
      scheduleFileDeletion(outputPath);
			return res.status(200).json({ message: 'File served from existing conversion.', url: fileUrl });
    } else {
      const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
      ffmpeg(videoStream)
        .audioCodec('libmp3lame')
        .format('mp3')
        .save(outputPath)
        .on('end', () => {
          console.log(`File saved: ${outputPath}`);
          // Schedule the file for deletion in 12 hours
          scheduleFileDeletion(outputPath);
        })
        .on('error', (err) => {
          console.error('An error occurred:', err.message);
          res.status(500).end('Conversion failed due to an error.');
        });
    }

    // Construct the URL to access the saved MP3 file
    fileUrl = `http://${req.headers.host}/tmp/${title}.mp3`;
    res.status(200).json({ message: 'Conversion successful', url: fileUrl });

  } catch (error) {
    console.error('Conversion failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

