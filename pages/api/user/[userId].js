// pages/api/user/[userId].js
import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('credit_balance')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ creditBalance: data.credit_balance });
}

