// pages/api/favorites.js
import { supabase } from '../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { pageName, pageSlug, userId, pageId, pageType, action } = req.body;

    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, page_id: pageId, page_type: pageType, name: pageName, slug: pageSlug }]);
        if (error) throw error;
        return res.status(200).json({ message: 'Added to favorites' });
      } else if (action === 'remove') {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: userId, page_id: pageId, page_type: pageType });
        if (error) throw error;
        return res.status(200).json({ message: 'Removed from favorites' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

