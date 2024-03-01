import { supabase, supabaseUrl } from './supabase'; // Adjust the import path as necessary

export const uploadSong = async (file) => { // Assuming email is passed as a parameter
  if (!file) {
    return { error: 'No file provided' };
  }

  let supabaseBucket;
  try {
    const response = await fetch('/api/song-bucket-supabase', {
      method: 'GET', // Specify the method
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    supabaseBucket = data.bucket;
  } catch (error) {
    return { error: 'Failed to fetch bucket name: ' + error.message };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(filePath, file);

  if (error) {
    return { error: error.message };
  }

  // Use the supabaseUrl for constructing the public URL
  const publicURL = `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${filePath}`;

  return { publicURL };
};

