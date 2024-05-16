import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  const { fingerprint, ip, pageId } = req.body;

  try {
    // Check if there are matching rows in the visitors table
    const { data: matchingRows, error: queryError } = await supabase
      .from('visitors')
      .select('*')
      .or(`fingerprint.eq.${fingerprint}`, `ip.eq.${ip}`);

    if (queryError) {
      console.error('Error querying visitors:', queryError.message);
      return res.status(500).json({ error: 'Error querying visitors' });
    }

    if (!matchingRows || matchingRows.length === 0) {
      // No matching rows, add a new row
      const { data: newVisitor, error: addError } = await supabase
        .from('visitors')
        .insert([{ ip, fingerprint, free_visit_page_id: pageId }]);

      if (addError) {
        console.error('Error adding visitor:', addError.message);
        return res.status(500).json({ error: 'Error adding visitor' });
      }

      if (newVisitor && newVisitor.length > 0) {
        return res.status(200).json({ message: 'New visitor added', visitor: newVisitor[0] });
      } else {
        console.error('No data returned after adding visitor');
        return res.status(500).json({ error: 'Error adding visitor' });
      }
    } else {
      // Matching rows found, check if any row has different pageId
      const hasMismatch = matchingRows.some(row => row.free_visit_page_id !== pageId);
      if (hasMismatch) {
        return res.status(403).json({ error: 'Access denied: Mismatched pageId' });
      } else {
        return res.status(200).json({ message: 'Visitor access verified' });
      }
    }
  } catch (error) {
    console.error('Error processing visitor access:', error.message);
    return res.status(500).json({ error: 'Error processing visitor access' });
  }
}

