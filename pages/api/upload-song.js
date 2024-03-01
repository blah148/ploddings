// pages/api/upload-song.js
import nextConnect from 'next-connect';
import multer from 'multer';
import { supabase } from '../../utils/supabase'; // Adjust the import path

// Configure Multer
const upload = multer({
  storage: multer.memoryStorage(),
  // Include any Multer configuration such as file size limits here
});

const handler = nextConnect();

handler.use(upload.single('file'));

handler.post(async (req, res) => {
  console.log('Received POST request to /api/upload-song');

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Extract file extension and generate a random file name
  const supabaseBucket = 'youtube-dl'; // Update with whatever Supabase bucket
  const fileExt = req.file.originalname.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  // Upload the file to Supabase
  console.log('Uploading file to Supabase');
  const { data, error } = await supabase.storage
    .from('supabaseBucket') // Make sure to replace 'your-bucket-name' with your actual bucket name
    .upload(filePath, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (error) {
    console.log('Error uploading file to Supabase:', error.message);
    return res.status(500).json({ error: error.message });
  }

  // Construct the URL to access the file; adjust as needed based on your Supabase setup
  const publicURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/${supabaseBucket}/${data.Key}`;
  console.log('File uploaded successfully. Public URL:', publicURL);

  res.status(200).json({ publicURL });
});

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};

