// Next.js API route: /api/log-visit
import { supabase } from '../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  // Extract the page visit details and isAuthenticated flag from the request body
  const { page_type, page_id, isAuthenticated, userId } = req.body;

  try {
    // Prepare an object for the visit_history record
    const visitRecord = { page_type, page_id };

    // If the user is authenticated, add the user_id to the record
    if (isAuthenticated && userId) {
      visitRecord.user_id = userId;
    }

    // Insert the page visit into the visit_history table
    const { error: insertError } = await supabase
      .from('visit_history')
      .insert([visitRecord]);

    if (insertError) {
      throw insertError;
    }

    // Respond with success if the visit is logged successfully
    res.status(200).json({ message: isAuthenticated ? 'Visit logged successfully' : 'Visit logged for non-authenticated user' });
  } catch (error) {
    console.error('Error logging visit:', error);
    res.status(500).json({ error: 'Error logging visit' });
  }
}

