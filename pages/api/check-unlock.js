// pages/api/check-unlock.js
import { supabase } from '../../utils/supabase'; // Adjust the import path as needed

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, contentId } = req.body;
  if (!userId || !contentId) {
    return res.status(400).json({ message: 'Missing userId or contentId' });
  }

  try {
    const { data, error } = await supabase
      .from('users_content')
      .select('*')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ isUnlocked: false });

    return res.status(200).json({ isUnlocked: true });
  } catch (error) {
    console.error('Error checking unlock status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

