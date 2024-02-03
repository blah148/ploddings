// Next.js API route: /api/log-visit
import { supabase } from '../utils/supabase';
import { verifyToken } from '../utils/authMiddleware';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  try {
    // Authenticate the user and get their details
    const authResult = await verifyToken(req);

    if (authResult.error) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user_id = authResult.user.id; // Extract user_id from the verified token

    // Extract the page visit details from the request body
    const { page_type, page_id } = req.body;

    // Insert the page visit into the visit_history table
    const { error: insertError } = await supabase
      .from('visit_history')
      .insert([{ user_id, page_type, page_id }]);

    if (insertError) {
      throw insertError;
    }

    // Respond with success if the visit is logged successfully
    res.status(200).json({ message: 'Visit logged successfully' });
  } catch (error) {
    console.error('Error logging visit:', error);
    res.status(500).json({ error: 'Error logging visit' });
  }
}

