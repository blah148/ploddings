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
  const fetchDataForTab = async () => { // Added function name
    startLoading();
    await FetchContentByCategory();
    stopLoading();
  };
  fetchDataForTab();
}, []);

async function FetchContentByCategory() {
    startLoading(); // Signal that loading has started

    try {
        // Call the PostgreSQL function
        const { data, error } = await supabase.rpc('fetch_categories_with_content2');

        if (error) {
            throw error;
        }

        // Transform the data into the desired structure 
        const categoriesMap = data.reduce((acc, item) => {
            // If the category hasn't been added to the accumulator, add it
            if (!acc[item.category_id]) {
                acc[item.category_id] = {
                    id: item.category_id,
                    name: item.category_name,
                    column_order: item.column_order, // Including column_order here
                    content: [],
                };
            }
            
            // Add the content item to the appropriate category
            if (item.content_type === 'songs' && item.matched_content_name) {
                acc[item.category_id].content.push({
                    id: item.content_id,
                    name: item.content_name,
                    page_type: item.content_type,
                    thumbnail_200x200: item.thumbnail_200x200,
                    featured_img_alt_text: item.featured_img_alt_text,
                    slug: item.slug,
                    matched_content_name: item.matched_content_name,
                    matched_thumbnail_200x200: item.matched_thumbnail_200x200,
                    matched_slug: item.matched_slug,
                    matched_page_type: item.matched_page_type,
                    matched_featured_img_alt_text: item.matched_featured_img_alt_text,
                });
            } else {
                // For other content types, add without matched details
                acc[item.category_id].content.push({
                    id: item.content_id,
                    name: item.content_name,
                    page_type: item.content_type,
                    thumbnail_200x200: item.thumbnail_200x200,
                    featured_img_alt_text: item.featured_img_alt_text,
                    slug: item.slug,
                });
            }
            
            return acc;
        }, {});
        
        // Convert the categoriesMap object back into an array and sort by column_order
        const categoriesArray = Object.values(categoriesMap).sort((a, b) => a.column_order - b.column_order);
        
        console.log('Sorted categories:', categoriesArray); // Optional: Log the sorted array for debugging
        
        // Update the component state with the transformed and sorted data
        setCategories(categoriesArray);
    } catch (error) {
        console.error('Error fetching content by category:', error.message);
    } finally {
        stopLoading(); // Signal that loading has completed
    }
}

return (

    <div className="bodyA">
      <SEO
        description="For fingerstyle blues, jazz, folk, and classical guitar, the Ploddings \u0022seed-vault\u0022-like site contains MIDI-tabs, pitch-shifters, and slow-downers for practice time."
        slug="/"
      />
			 <Sidebar userId={userId} ip={ip} />
			 <div className="mainFeedAll">
				 <div className="feedContainer">
					 <Loader isLoading={isLoading} />
					 <div className="mainFeed">
						 <div className="topRow">
								<Link className="homeButton mobileOnly" href="/" passHref>
									<svg role="img" height="22" width="22" aria-hidden="true" viewBox="0 0 24 24" data-encore-id="icon">
										<path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z"></path>
									</svg>
									<div className="homeText">Home</div>
								</Link>
					     <Menu userId={userId} />
						 </div>
						<div className="narrowedFeedBody">
							 <div className="categoriesContainer">
								 {categories.map(category => ( // Iterate over categories
									  <div key={category.id} className="categoryGroup">
										  <h2>{category.name}</h2>
										  <ul>
											{category.content && category.content.map(content => (
												<li key={content.id} className={content.matched_content_name ? "doubleRow" : "singleRow"}>
													{content.matched_content_name ? (
														<>
															<Link href={`/${content.page_type}/${content.slug}`} passHref>
																<Image width={40} height={40} src={content.thumbnail_200x200} className="thumbnailImage" alt={content.featured_img_alt_text || 'robert johnson guitar at crossroads'} />
																<div>
																	{window.innerWidth <= 768 && content.name.length > 15
																		? content.name.slice(0, 15) + '...'
																		: content.name}
																</div>
															</Link>
															<Link href={`/${content.matched_page_type}/${content.matched_slug}`} passHref>
																<Image width={30} height={30} src={content.matched_thumbnail_200x200} className="artistImage" alt={content.matched_featured_img_alt_text || 'robert johnson guitar at crossroads'} />
																<div className="artistName">{content.matched_content_name}</div>
															</Link>
															<Link href={`/${content.page_type}/${content.slug}`} passHref><div className="led"></div></Link>
														</>
													) : (
														<Link href={`/${content.page_type}/${content.slug}`} passHref>
															<Image width={40} height={40} src={content.thumbnail_200x200} className="thumbnailImage" alt={content.featured_img_alt_text || 'robert johnson guitar at crossroads'} />
															<div>
																{window.innerWidth <= 768 && content.name.length > 27
																	? content.name.slice(0, 27) + '...'
																	: content.name}
															</div>
															<div className="led"></div>
														</Link>
													)}
												</li>
											))}
										</ul>
									</div>
								))}
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

