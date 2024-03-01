import { exec } from 'child_process';
import fs from 'fs/promises'; // Use the fs module with Promise support for async operations
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid installed for generating unique filenames
import { supabase, supabaseUrl } from '../../utils/supabase'; // Correctly point to your Supabase client initialization

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Invalid or missing YouTube video URL.' });
  }

  // Use a unique identifier to avoid filename conflicts
  const uniqueFilename = `${uuidv4()}.mp3`;
  const command = `youtube-dl --verbose --extract-audio --audio-format mp3 --output "${uniqueFilename}" "${videoUrl}"`;

  try {
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
          return;
        }
        resolve(stdout); // No need to parse stdout if we know the filename
      });
    });

    // Now read the file into a buffer
    const buffer = await fs.readFile(uniqueFilename);

    // Upload the buffer to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('youtube-dl')
      .upload(uniqueFilename, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Construct the URL to the uploaded file
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/youtube-dl/${uniqueFilename}`;
    res.status(200).json({ message: 'Conversion and upload successful', url: fileUrl });
  } catch (error) {
    console.error('Conversion or upload failed:', error);
    res.status(500).json({ error: 'Internal server error', details: error.toString() });
  }
};

