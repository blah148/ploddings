// pages/api/unlock.js
import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { userId, contentId } = req.body;

  if (!userId || !contentId) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    // Start by checking the user's current credit balance
    let { data: userData, error: userError } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!userData) throw new Error('User not found');

    // Check if user has enough credits
    if (userData.credit_balance < 1) {
      throw new Error('Insufficient credits');
    }

    // Deduct 1 credit from the user's balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ credit_balance: userData.credit_balance - 1 })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record the unlock in the users_content table
    const { error: insertError } = await supabase
      .from('users_content')
      .insert([
        { user_id: userId, content_id: contentId }
      ]);

    if (insertError) throw insertError;

    // If everything went fine
    res.status(200).json({ success: true, message: 'Content unlocked successfully' });
  } catch (error) {
    console.error('Unlocking content failed', error);
    res.status(500).json({ success: false, message: 'Failed to unlock content', details: error.message });
  }
}

