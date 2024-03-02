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
import SEO from '../components/SEO';

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
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0); // Track the offset directly
  const [initialFetchCompleted, setInitialFetchCompleted] = useState(false);
	const { isLoading, startLoading, stopLoading } = useLoading();

  const fetchPosts = async () => {
    if (isLoading) return; // Prevent duplicate fetches
		startLoading();

    const { data, error } = await supabase
      .from('content')
      .select('id, thumbnail_200x200, featured_img_alt_text, slug, name, page_type, published_date')
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
    stopLoading();
  };

  useEffect(() => {
    if (!initialFetchCompleted) {
      fetchPosts();
      setInitialFetchCompleted(true);
    }
  }, []);

  return (
    <div className="bodyA">
       <SEO
				 title="Guitar Blog"
         description="Lots of guitar-content fills the crannies of ..The Ploddings Blog.. including histories of American blues music, origins of the guitar, and stuff to get started"
         slug="/blog"
       />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
              <Menu userId={userId} />
            </div>
            <div className="narrowedFeedBody">
              <h1>Blog</h1>
              <div className="blogCardContainer">
								{posts.map((post) => (
									<div className="blockifyBlock">
										<Link href={`/${post.page_type}/${post.slug}`} key={post.id} passHref>
											<div className="blogHover">
													<div className="blogCard date">{post.formatted_date}</div>
													<div className="ornamentContainer">
														<div className="circleOrnament">
															<div className="dotOrnament"></div>
														</div>
														<div className="lineOrnament"></div>
													</div>
													<div className="blogCard name">
														<img src={post.thumbnail_200x200} alt={post.featured_img_alt_text} className="blogFeedImage" />
														<div>{post.name}</div>
													</div>
											</div>
										</Link>
									</div>
								))}
                {hasMore && (
                  <button className="blogLoadMore" onClick={fetchPosts} disabled={isLoading}>
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
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

