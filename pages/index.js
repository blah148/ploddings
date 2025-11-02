import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';
import jwt from 'jsonwebtoken';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import SEO from '../components/SEO';
import LoadingLink from '../components/LoadingLink';
import StabilizerText from '../components/StabilizerText';
import BeingWatchedMobile from '../components/BeingWatchedMobile.js';

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

export default function Home({ userId, ip }) {
  const [categories, setCategories] = useState([]);
  const { isLoading, startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchDataForTab = async () => {
      startLoading();
      await fetchContentByCategory(userId);
      stopLoading();
    };
    fetchDataForTab();
  }, [userId]);

  async function fetchContentByCategory(userId) {
    startLoading();
    try {
      // Call the PostgreSQL function with userId
      const { data, error } = await supabase.rpc('fetch_categories_with_content5', { p_user_id: userId });

      if (error) {
        throw error;
      }

      // Transform the data into the desired structure
      const categoriesMap = data.reduce((acc, item) => {
        // Initialize the category in the accumulator if it doesn't exist
        if (!acc[item.category_id]) {
          acc[item.category_id] = {
            id: item.category_id,
            name: item.category_name,
            column_order: item.column_order, // Including column_order
            content: [],
          };
        }

        // Add content item to the category, including unlock status for songs
        const contentItem = {
          id: item.content_id,
          name: item.content_name,
          page_type: item.content_type,
          thumbnail_200x200: item.thumbnail_200x200,
          featured_img_alt_text: item.featured_img_alt_text,
          slug: item.slug,
          is_unlocked: item.is_unlocked, // Include unlock status
        };

        // Include matched details for songs
        if (item.content_type === 'songs' && item.matched_content_name) {
          Object.assign(contentItem, {
            matched_content_name: item.matched_content_name,
            matched_thumbnail_200x200: item.matched_thumbnail_200x200,
            matched_slug: item.matched_slug,
            matched_page_type: item.matched_page_type,
            matched_featured_img_alt_text: item.matched_featured_img_alt_text,
          });
        }

        acc[item.category_id].content.push(contentItem);

        return acc;
      }, {});

      // Convert categoriesMap to array and sort by column_order
      const categoriesArray = Object.values(categoriesMap).sort((a, b) => a.column_order - b.column_order);

      // Include active membership
      const activeMembership = data.length > 0 ? data[0].user_active_membership : false;

      // Update the state with the sorted data and active membership
      setCategories({ categories: categoriesArray, activeMembership });
    } catch (error) {
      console.error('Error fetching content by category:', error.message);
    } finally {
      stopLoading();
    }
  }

  return (
    <div className="bodyA">
      <SEO
        description="A transcription repository & practice platform for pre-war blues style guitar, such as Charley Patton, Elizabeth Cotten, Etta Baker, Reverend Gary Davis, and John Fahey."
        slug="/"
      />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
<Link className="homeButton mobileOnly" href="/" passHref>
  <img
    src="https://f005.backblazeb2.com/file/ploddings-images/site_images/ploddings_logo-on-transparent.png"
    alt="Ploddings logo"
    style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      marginRight: '8px',
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
  />
  <div className="homeText" style={{ display: 'inline-block', verticalAlign: 'middle', margin: 'auto' }}>
    Home
  </div>
</Link>

              <div style={{ display: 'flex', marginLeft: 'auto' }}>
                <Menu userId={userId} />
              </div>
            </div>
            <div className="narrowedFeedBody">
              <StabilizerText />
              <div className="categoriesContainer">
                {categories.categories && categories.categories.length > 0 ? (
                  <>
                    {categories.categories.map((category) => (
                      <div key={category.id} className="categoryGroup">
                        <h2>{category.name}</h2>
                        <ul>
                          {category.content.map((content) => (
                            <li key={content.id} className={content.matched_content_name ? 'doubleRow' : 'singleRow'}>
                              {content.matched_content_name ? (
                                <>
                                  <LoadingLink href={`/${content.page_type}/${content.slug}`}>
                                    <Image
                                      width={40}
                                      height={40}
                                      src={content.thumbnail_200x200}
                                      className="thumbnailImage"
                                      alt={content.featured_img_alt_text || 'robert johnson guitar at crossroads'}
                                    />
                                    <div>
                                      {typeof window !== 'undefined' && window.innerWidth <= 768 && content.name.length > 15
                                        ? content.name.slice(0, 15) + '...'
                                        : content.name}
                                    </div>
                                  </LoadingLink>
                                  <LoadingLink href={`/${content.matched_page_type}/${content.matched_slug}`} passHref>
                                    <Image
                                      width={30}
                                      height={30}
                                      src={content.matched_thumbnail_200x200}
                                      className="artistImage"
                                      alt={content.matched_featured_img_alt_text || 'robert johnson guitar at crossroads'}
                                    />
                                    <div className="artistName">{content.matched_content_name}</div>
                                  </LoadingLink>
                                  <LoadingLink href={`/${content.page_type}/${content.slug}`} passHref>
                                    <div className={`led ${categories.activeMembership ? 'unlocked' : 'locked'}`}></div>
                                  </LoadingLink>
                                </>
                              ) : (
                                <LoadingLink href={`/${content.page_type}/${content.slug}`} passHref>
                                  <Image
                                    width={40}
                                    height={40}
                                    src={content.thumbnail_200x200}
                                    className="thumbnailImage"
                                    alt={content.featured_img_alt_text || 'robert johnson guitar at crossroads'}
                                  />
                                  <div>
                                    {typeof window !== 'undefined' && window.innerWidth <= 768 && content.name.length > 27
                                      ? content.name.slice(0, 27) + '...'
                                      : content.name}
                                  </div>
                                  <div className={`led ${categories.activeMembership ? 'unlocked' : 'locked'}`}></div>
                                </LoadingLink>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </>
                ) : (
                  <p></p>
                )}
              </div>
							<BeingWatchedMobile />
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

