import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { PassThrough } from 'stream';
import { supabase, supabaseUrl } from '../../utils/supabase'; // Make sure this is correctly pointing to your Supabase client initialization

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
    const outputPath = `${title}.mp3`;
		console.log('metadata', videoID, info, title, outputPath);

    // Using a PassThrough stream as an intermediate step
    const passThrough = new PassThrough();
    const chunks = [];

    try {
				console.log('supabase stuff', supabase, supabaseUrl);
        // Set up ffmpeg to convert the stream
        const videoStream = ytdl(videoUrl, { quality: 'highestaudio' });
        ffmpeg(videoStream)
            .audioCodec('libmp3lame')
            .format('mp3')
            .pipe(passThrough, { end: true });

        // Collect chunks of data from the stream
        passThrough.on('data', chunk => chunks.push(chunk));

        // Wait for the stream to finish
        passThrough.on('end', async () => {
            // Combine all chunks into a single Buffer
            const buffer = Buffer.concat(chunks);

            // Upload the buffer to Supabase Storage
            const { data, error } = await supabase.storage
                .from('youtube-dl')
                .upload(outputPath, buffer, {
                    contentType: 'audio/mpeg',
                    upsert: true,
                });

            if (error) {
                throw error;
            }

						console.log('the supabaseUrl', supabaseUrl);

            // Construct the URL to the uploaded file
            const fileUrl = `${supabaseUrl}/storage/v1/object/public/youtube-dl/${title}.mp3`;
            console.log(`File uploaded: ${fileUrl}`);
            res.status(200).json({ message: 'Conversion and upload successful', url: fileUrl });
        });

    } catch (error) {
        console.error('Conversion or upload failed:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

