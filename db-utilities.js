import { supabase } from './pages/utils/supabase'; // Import your Supabase client instance
import jwt from 'jsonwebtoken';

async function fetchSlugsFromTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('slug');

    if (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }

    return data.map(row => row.slug);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchDataBySlug(tableName, slug) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Error fetching data by slug:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function getParentObject(threadId) {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('name, featured_img_alt_text, featured_img_200px, slug')
      .eq('id', threadId)
      .single();

    if (error || !data) {
      console.error('Error fetching parent object:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchChildrenByThreadId(contentType, slug) {
  try {
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('id')
      .eq('slug', slug)
      .single();

    if (threadError || !threadData) {
      console.error('Error fetching thread data:', threadError);
      return [];
    }

    const threadId = threadData.id;

    const { data, error } = await supabase
      .from(contentType)
      .select('name, slug, id')
			// Calls the thread_id field inside the "songs" or "blog" tables
      .eq('thread_id', threadId);

    if (error) {
      console.error('Error fetching children by thread ID:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export {
  fetchSlugsFromTable,
  fetchDataBySlug,
  getParentObject,
  fetchChildrenByThreadId,
};

