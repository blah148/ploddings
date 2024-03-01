import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Link from 'next/link';

const verifyUserSession = (req) => {
  const token = req.cookies['auth_token'];
  if (!token) {
    return null; // No session
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Session valid
  } catch (error) {
    return null; // Session invalid
  }
};

// Function to format the published_date
const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', options);
};

export default function Blog({ userId, ip }) {
  const { isLoading, setIsLoading } = useLoading();
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
      .select('id, slug, name, page_type, published_date')
      .eq('page_type', 'blog')
      .is('thread_id', null)
      .order('published_date', { ascending: false })
      .range(offset, offset + 4); // Use the offset state for pagination

    if (!error && data) {
      const formattedData = data.map(post => ({
        ...post,
        formatted_date: formatDate(post.published_date) // Format the published_date
      }));
      setPosts((prevPosts) => [...prevPosts, ...formattedData]);
      setHasMore(data.length === 5);
      setOffset(prevOffset => prevOffset + data.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!initialFetchCompleted) {
      fetchPosts();
      setInitialFetchCompleted(true);
    }
  }, []);

  return (
    <div className="bodyA">
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='/' />
              <Menu userId={userId} />
            </div>
            <div className="narrowedFeedBody">
              <h1>Blog</h1>
              <div className="blogCardContainer">
{posts.map((post) => (
  <Link href={`/${post.page_type}/${post.slug}`} key={post.id} passHref>
    <div className="blogHover">
        <div className="blogCard date">{post.formatted_date}</div>
        <div className="ornamentContainer">
          <div className="circleOrnament">
            <div className="dotOrnament"></div>
          </div>
					<div className="lineOrnament"></div>
        </div>
        <div>
          <div className="blogCard name">{post.name}</div>
        </div>
    </div>
  </Link>
))}

                {hasMore && (
                  <button className="blogLoadMore" onClick={fetchPosts} disabled={loading}>
                    Load More
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer userId={userId} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ params, req }) {

  const userSession = verifyUserSession(req);
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

