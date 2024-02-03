// Next.js API route: /api/log-visit
import { supabase } from '../utils/supabase';
import { verifyToken } from '../utils/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const { page_type, page_id } = req.body; // Extract the page visit details from the request body

  try {
    // Attempt to authenticate the user
    const authResult = await verifyToken(req);

    // Prepare an object for the visit_history record
    const visitRecord = { page_type, page_id };

    // If the user is authenticated, add the user_id to the record
    if (!authResult.error && authResult.user?.id) {
      visitRecord.user_id = authResult.user.id;
    }

    // Insert the page visit into the visit_history table
    const { error: insertError } = await supabase
      .from('visit_history')
      .insert([visitRecord]);

    if (insertError) {
      throw insertError;
    }

    // Respond with success if the visit is logged successfully
    res.status(200).json({ message: 'Visit logged successfully' });
  } catch (error) {
    // If there's an error, including failing to verify token (non-logged-in user), log the visit without the user_id
    if (!error.logged) {
      try {
        const { error: insertError } = await supabase
          .from('visit_history')
          .insert([{ page_type, page_id }]); // Insert without user_id

        if (insertError) {
          throw insertError;
        }

        res.status(200).json({ message: 'Visit logged for non-authenticated user' });
      } catch (insertError) {
        console.error('Error logging visit for non-authenticated user:', insertError);
        res.status(500).json({ error: 'Error logging visit for non-authenticated user' });
      }
    } else {
      console.error('Error logging visit:', error);
      res.status(500).json({ error: 'Error logging visit' });
    }
  }
}

