import { supabase } from './pages/utils/supabase'; // Import your Supabase client instance

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
      .select('thread_name, featured_img_alt_text, featured_img_200px, slug')
      .eq('thread_id', threadId)
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
      .select('thread_id')
      .eq('slug', slug)
      .single();

    if (threadError || !threadData) {
      console.error('Error fetching thread data:', threadError);
      return [];
    }

    const threadId = threadData.thread_id;

    const { data, error } = await supabase
      .from(contentType)
      .select('name, slug, id')
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

