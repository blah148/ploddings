import { supabase } from './utils/supabase'; // Import your Supabase client instance  
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

async function fetchDataBySlug(tableName = 'content', slug) {
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

async function fetchThreadData(slug) {
  console.log(`Fetching thread data by slug: ${slug}`);
  try {
    const { data, error } = await supabase
      .from('content')
      .select('id, meta_description, lyrics, name, page_type, child_type, link_1, link_2, link_3, body_text')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      console.error('Error fetching threadData by slug:', error);
      console.log('Result data:', data);
      return null;
    }

    console.log('Fetched thread data:', data);
    return data;
  } catch (err) {
    console.error('Exception occurred while fetching thread data:', err);
    return null;
  }
}



async function fetchSongData(slug) {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('id, meta_description, pdf_download, lyrics, name, featured_img_alt_text, capo_position, tuning, link_1, link_2, link_3, thread_id, body_text, paid_traffic') 
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      console.error('Error fetching threadData by slug:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchBlogData(slug) {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('id, meta_description, name, published_date, thread_id, body_text, sibling_previous, sibling_next')
      .eq('slug', slug)
      .single();
    
    if (error || !data) {
      console.error('Error fetching threadData by slug:', error);
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
      .from('content')
      .select('name, page_type, link_3, featured_img_alt_text, thumbnail_200x200, slug')
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
	fetchThreadData,
	fetchSongData,
	fetchBlogData,
};

