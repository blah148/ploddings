import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookie';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import SEO from '../components/SEO';
import NotificationIcon from '../components/NotificationIcon';
import StabilizerText from '../components/StabilizerText';
import SubscribeTextJoin from '../components/StripeSubscriptionText_join';
import Link from 'next/link';
import styles from './contribution.module.css';
import MusescoreEmbed from '../components/MusescoreEmbed';
import SlowDownerComponent from '../components/slowDownerComponent';
import DownloadIcon from '../components/DownloadIcon';
import Image from 'next/image';
import { supabase } from '../utils/supabase';

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

export default function CreateAccount({ userId, ip }) {
  const { isLoading, setIsLoading } = useLoading();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState([]); 
const [songs, setSongs] = useState({});

  useEffect(() => {
  }, [email]);

  const handleCreateAccount = async (e) => {
    e.preventDefault(); // Prevent the form's default submission behavior
    console.log('About to try POST - client side');

    try {
      console.log('Entered function - client side');
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      console.log('After the POST request - client side');

      if (!response.ok) {
        const errorText = await response.text(); // Attempt to read response text for more detail
        throw new Error(`Failed to create account: ${errorText}`);
      }

      const { token } = await response.json();

      document.cookie = `auth_token=${token}; Max-Age=604800; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      alert('Account successfully created. You are now logged-in');
      router.push('/'); // Change to the appropriate route
    } catch (error) {
      console.error('Error during account creation:', error.message);
    }
  };

console.log('Using userID:', userId);

  useEffect(() => {
    async function fetchAllSongs() {
      const { data, error } = await supabase.rpc('fetch_all_songs', { p_user_id: userId });
      if (error) {
        console.error('Error fetching songs:', error.message);
        return;
      }


    // Sorting the fetched songs by thread name in alphabetical order
    const sortedData = data.sort((a, b) => a.matched_content_name.localeCompare(b.matched_content_name));


      // Structure all songs under a single category called "All Songs"
      const allSongsCategory = {
        id: 0, // Assuming '0' as a placeholder ID for the "All Songs" category
        name: 'All Songs',
        content: []
      };

      // Add all fetched songs to the "All Songs" category
      data.forEach(item => {
        const song = {
          id: item.content_id,
          name: item.content_name,
          page_type: item.content_type,
          thumbnail_200x200: item.thumbnail_200x200,
          featured_img_alt_text: item.featured_img_alt_text,
          slug: item.slug,
          is_unlocked: item.is_unlocked,
          matched_content_name: item.matched_content_name,
          matched_thumbnail_200x200: item.matched_thumbnail_200x200,
          matched_slug: item.matched_slug,
          matched_page_type: item.matched_page_type,
          matched_featured_img_alt_text: item.matched_featured_img_alt_text
        };
        allSongsCategory.content.push(song);
      });

      // Set the category with all songs into state
      setSongs(allSongsCategory);
    }

    fetchAllSongs();
  }, [userId]);

	useEffect(() => {
		console.log('Categories updated:', songs);
	}, [categories]); // This useEffect will run whenever 'categories' changes


  return (
    <div className="bodyA">
      <SEO
        title="Join"
        description="To persist your: (i) visit history, (ii) starred guitar tablature, and (iii) access the pitch-shifter and slow-downer, create an account on Ploddings with an email"
        slug="/join"
      />
      <Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
              <div style={{display: "flex"}}>
                <NotificationIcon userId={userId} />
                <Menu userId={userId} />
              </div>
            </div>
            <div className="narrowedFeedBody">
              <StabilizerText />
              <h1>Obtain lifetime access</h1>
            </div>
						<div className={styles.pricingTable}>
							<div className={styles.gridHeader}>
								<div className={styles.tocTitle}>Table of Contents</div>
								<div className={styles.planType}>
									<h2>Visitor</h2>
                    <Image 
											alt="Skip James guitar portrait"
											src="https://ploddings-threads.s3.us-east-005.backblazeb2.com/featured_img_550px/skip-james.webp"
											width={70}
											height={70}
											loading="lazy"
											style={{ color: 'transparent' }}
											className={styles.artistIcon}
										/>
								</div>
								<div className={styles.planType}>
									<h2>One-time contributor</h2>
			    			    <Image 
											alt="robert johnson guitar portrait"
											src="https://ploddings-threads.s3.us-east-005.backblazeb2.com/featured_img_550px/robert-johnson.webp"
											width={70}
											height={70}
											loading="lazy"
											className={styles.artistIcon}
										/>
								</div>
							</div>
							<div className={styles.gridBody}>
								<div className={styles.bottomBorderRow}>
								<a href="#a" className="bullet">a. Viewing permissions for all MuseScore™ tablature</a>
								<div className="led center unlocked"></div>
								<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
								<a href="#b" className="bullet">b. Download permissions for: (i) PDF tablature, and (ii) MuseScore™ files</a>
								<div className="led center locked"></div>
								<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
								<a href="#c" className="bullet">c. Unlimited use of the slow-downer & pitch shifter tool</a>
								<div className="led center locked"></div>
								<div className="led center unlocked"></div>
								</div>
							</div>
							<div className={styles.gridHeader}>
                <div></div> {/* Empty for alignment */}
								<div className={[styles.planType, styles.bottom].join(' ')} >
									<h3>$0</h3>
								</div>
								<div className={[styles.planType, styles.bottom].join(' ')} >
									<h3>$195 CAD (lifetime)</h3>
									<button style={{marginTop: "5px", marginBottom: "5px"}} className="formButton Stripe">
										<SubscribeTextJoin text="Step 2: Continue to Stripe" />
									</button>
								</div>
							</div>
						</div>
            {/* Sales Content */}
            <div className={styles.salesContent}>
              <h2>How can I use the site?</h2>
              <p>Imagine finding your unique guitar playing voice by first learning the ways of guitarists of yesterdays such as Etta Baker, John Fahey, Elizabeth Cotten, Reverend Gary Davis, King Solomon Hill, Charley Patton, Robert Petway, Robert Johnson, and others..</p>
              <h3 id="a">a. How would you find your unique sound?</h3>
              <p>Well for instance, as a contributor, not only do you get playable tablature to know exact notes for songs like Blind Willie Johnson's seminal tune, Dark Was the Night (Cold Was the Ground)..</p>
              <MusescoreEmbed
                pageId={275}
                userId={userId}
                ip={ip}
                embed_link="https://musescore.com/user/69479854/scores/12391498/s/egzyiU/embed"
                canAccess={true}
              />
              <ol>
                <h3 id="b">b. But you also get to have..</h3>
                <li>The ability to print the (above) PDF files of MuseScore™ guitar tablature for offline practice,</li>
                <li>The access to download all editable MuseScore™ files for the site's song library (however no commercial usage of MuseScore file downloads is allowed)</li>
								<h3 id="c">c. The slow-downer / pitch-shifter playalong tool</h3>
                <li>Unlimited usage of the slow-downer & pitch-shifter play-along tool. Give it a try by testing playback with the interactive tool right below,</li>
                <SlowDownerComponent 
                  isUnlocked={true} 
                  dropbox_mp3_link="https://dl.dropboxusercontent.com/scl/fi/62dzveezgsork7o4odf4x/Blind-Willie-Johnson-Dark-Was-the-Night-Cold-Was-the-Ground.mp3?rlkey=3bg5q0jm7yvpp9ckevy4g6ims&dl=0"
                />
              </ol>
              <p>
								<strong>As long as Ploddings survives (est. 2018), you will have lifetime access to these privileges for all [number of songs].</strong>
							</p>
							<div className="categoryGroup">
								<h2>{songs.name}</h2>
								<ul>
									{songs.content && songs.content.map(song => (
									<li key={song.id} className={song.matched_content_name ? 'doubleRow' : 'singleRow'}>
										{song.matched_content_name ? (
											<>
												<Link href={`/${song.page_type}/${song.slug}`} passHref>
														<Image
															width={40}
															height={40}
															src={song.thumbnail_200x200}
															className="thumbnailImage"
															alt={song.featured_img_alt_text || 'robert johnson guitar at crossroads'}
														/>
														<div>
															{typeof window !== 'undefined' && window.innerWidth <= 768 && song.name.length > 15
																? song.name.slice(0, 15) + '...'
																: song.name}
														</div>
												</Link>
												<Link href={`/${song.matched_page_type}/${song.matched_slug}`} passHref>
														<Image
															width={30}
															height={30}
															src={song.matched_thumbnail_200x200}
															className="artistImage"
															alt={song.matched_featured_img_alt_text || 'robert johnson guitar at crossroads'}
														/>
														<div className="artistName">{song.matched_content_name}</div>
												</Link>
												<Link href={`/${song.page_type}/${song.slug}`} passHref>
														<div className={`led ${song.activeMembership ? 'unlocked' : 'locked'}`}></div>
												</Link>
											</>
										) : (
											<Link href={`/${song.page_type}/${song.slug}`} passHref>
													<Image
														width={40}
														height={40}
														src={song.thumbnail_200x200}
														className="thumbnailImage"
														alt={song.featured_img_alt_text || 'robert johnson guitar at crossroads'}
													/>
													<div>
														{typeof window !== 'undefined' && window.innerWidth <= 768 && song.name.length > 27
															? song.name.slice(0, 27) + '...'
															: song.name}
													</div>
													<div className={`led ${song.activeMembership ? 'unlocked' : 'locked'}`}></div>
											</Link>
										)}
									</li>

									))}
								</ul>
							</div>
              {/* Disclaimer */}
            </div>
						<div className={styles.disclaimer}>
							<div className={`${styles.disclaimerRow} ${styles.top}`}>
							  <strong>Are you a USA taxpayer?</strong> 
							  <span role="img" aria-label="USA flag" style={{marginLeft: "8px"}}>🇺🇸</span> 
							</div>
							<div className={styles.disclaimerRow}>
								<div>
							  For USA taxpayers, the lifetime Ploddings membership is tax-deductible since 100% of all donations are collected on behalf of the Mount Zion Memorial Fund (MZMF), an IRS-recognized charity and the official partner of Ploddings. Users are encouraged to contact the Mt. Zion Memorial Fund directly for proof-of-receipts for tax purposes by providing their: (i) email address and (ii) date of purchase information at: <a href="https://mtzionmemorialfund.com/online-support-portal/" target="_blank" rel="nofollow noopener noreferrer" style={{display: "inline"}}>Mt. Zion Memorial Fund - Contact Page</a>.
								</div>
							</div>
						</div>
						<div className={styles.salesContent}>
						{/* Backstory */}
							<p><strong>Question #1:</strong> Does Ploddings.com act as a payment processing middleman between the site-access contribution & the Mt. Zion Memorial Fund?</p>
							<p><strong>Answer:</strong> No, all payment contributions through Stripe are directly sent to the Mt. Zion Memorial Fund, and contributors are encouraged to reach out to the Mt. Zion Memorial Fund immediately after transferring their donation to confirm their 100% proceeds donation to MZMF & tax-deductible receipt, while verifying access to Ploddings.</p>
							<p><strong>Question #2:</strong> Is the one-time contribution refundable?</p>
							<p>
								<strong>Answer:</strong> Since 2018, there has never been a single refund requested by the more than 100 customers of Ploddings, and they are discouraged since users could conceivably pay for a membership, download all the current files, then request a refund. However, if the day arises when a user asks for a refund and needs it, they can reach out to Ploddings support at: 
								<Link href="/contact" passHref>
									<span style={{ textDecoration: 'underline', color: 'inherit', cursor: 'pointer', marginLeft: '4px', marginRight: '4px' }}>ploddings.com/contact</span>
								</Link> 
								for mediation.
							</p>
						</div>
          </div>
        </div>
				<Footer userId={userId} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const userSession = verifyUserSession(req);
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress; // Corrected line

  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}

