import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method not allowed');
  }

  const { userId } = req.query;

  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('active_membership')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError.message);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    if (userData && userData.active_membership) {
      return res.status(200).json({ message: 'Active membership verified' });
    } else {
      return res.status(403).json({ error: 'Active membership not verified' });
    }
  } catch (error) {
    console.error('Error verifying active membership:', error.message);
    return res.status(500).json({ error: 'Error verifying active membership' });
  }
}

