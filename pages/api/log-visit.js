// Next.js API route: /api/log-visit
import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  // Extract the page visit details and isAuthenticated flag from the request body
  const { ip, page_id, userId } = req.body;

  try {
    // Prepare an object for the visit_history record
    const visitRecord = {
      page_id,
      ...(userId ? { user_id: userId } : { ip }),
      visited_at: new Date() // Assuming you have a visited_at column to update with the current timestamp
    };

    // Perform the upsert into the visit_history table
    const { error: upsertError } = await supabase
      .from('visit_history')
      .upsert([visitRecord], {
        onConflict: userId ? 'user_id, page_id' : 'ip, page_id',
        returning: 'minimal', // Optional: Don't return data for the upsert operation
      });

    if (upsertError) {
      throw upsertError;
    }

    // Respond with success if the visit is logged successfully
    res.status(200).json({ message: userId ? 'Visit logged or updated successfully' : 'Visit logged or updated for non-authenticated user' });
  } catch (error) {
    console.error('Error logging visit:', error);
    res.status(500).json({ error: 'Error logging visit' });
  }
}

