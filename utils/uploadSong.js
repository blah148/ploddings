// utils/uploadUtils.js
import { supabase, supabaseUrl } from './supabase'; // Adjust the import path as necessary

export const uploadSong = async (file) => {
  if (!file) {
    return { error: 'No file provided' };
  }
	
	const supabaseBucket = 'youtube-dl'; // Update with whatever Supabase bucket
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

