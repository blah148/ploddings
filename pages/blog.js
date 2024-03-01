import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0); // Track the offset directly
const [initialFetchCompleted, setInitialFetchCompleted] = useState(false);

    const fetchPosts = async () => {
        if (loading) return; // Prevent duplicate fetches
        setLoading(true);

        const { data, error } = await supabase
            .from('content')
            .select('id, slug')
            .eq('page_type', 'blog')
            .is('thread_id', null)
            .order('published_date', { ascending: false })
            .range(offset, offset + 4); // Use the offset state for pagination

        if (!error && data) {
            setPosts((prevPosts) => [...prevPosts, ...data]);
            setHasMore(data.length === 5);
            setOffset(prevOffset => prevOffset + data.length); // Update the offset based on the fetched data
        }
        setLoading(false);
    };

useEffect(() => {
  if (!initialFetchCompleted) {
    fetchPosts();
    setInitialFetchCompleted(true);
  }
}, []);

    // Initial fetch
    useEffect(() => {
        console.log('these are the posts', posts);
    }, [posts]);


    return (
        <div>
            {posts.map((post) => (
                <div key={post.id}>
                    {post.id} - {post.slug}
                </div>
            ))}
            {hasMore && (
                <button onClick={fetchPosts} disabled={loading}>
                    Load More
                </button>
            )}
        </div>
    );
}

