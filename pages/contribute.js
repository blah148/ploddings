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

export default function CreateAccount({ userId, ip, songCount }) {
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
              <h1>Full access (lifetime)</h1>
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
								  <a href="#a" className="bullet">a. Unlimited use of the slow-downer & pitch shifter tool</a>
									<div className="led center locked"></div>
									<div className="led center unlocked"></div>
							  </div>
								<div className={styles.bottomBorderRow}>
									<a href="#b" className="bullet">b. Viewing permissions for all MuseScore™ tablature</a>
									<div className="led center unlocked"></div>
									<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
									<a href="#c" className="bullet">c. Download permissions for: (i) PDF tablature, and (ii) MuseScore™ files</a>
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
									<button style={{marginTop: "5px", marginBottom: "5px"}} className="formButton Stripe two">
										<SubscribeTextJoin text="Step 2: Continue to Stripe" />
									</button>
								</div>
							</div>
						</div>
            {/* Sales Content */}
            <div className={styles.salesContent}>
							<h2>Example: Dark Was the Night (Cold Was the Ground) by Blind Willie Johnson</h2>
							<p>This talks about how someone who's experienced or inexperienced could start learning on a slide song like Blind Willie Johnson's classic, Dark Was the Night (Cold Was the Ground). Two things to do are to: (a) change to the Vestapol / Open D tuning of DADF#AD, and (b) have a bottleneck slide on-hand. </p>
              <h3 id="a">Step 1: Listening to the recording, slowed-down..</h3>
								<p>One idea as an end-goal might be to play-along at full speed with Blind Willie Johnson as a way to possibly absorb the sounds he creates. They say the "devil" is in the details.. and if it is, then dragging the orange slider (right below) back to 74%, 54%, 48%, or even 25% speed could help.. </p>
                <SlowDownerComponent 
                  isUnlocked={true} 
                  dropbox_mp3_link="https://dl.dropboxusercontent.com/scl/fi/62dzveezgsork7o4odf4x/Blind-Willie-Johnson-Dark-Was-the-Night-Cold-Was-the-Ground.mp3?rlkey=3bg5q0jm7yvpp9ckevy4g6ims&dl=0"
                />
							<p><strong>Note:</strong> The orange "setA" button (on audio player above) picks new "checkpoints" to rewind to, like the 1st turnaround, or the start of the 3rd chorus that Blind Willie Johnson plays. The setB button creates a loop between the two (setA and setB) points. Also, the pitch-shifter is probably most useful when the original recording is out-of-tune by a 1/4-step or a 1/2-step, and could be tweaked to more easily match the user's tuning. </p>
							<h3 id="b">Step 2: Link the sounds to the fretboard & strings</h3>
							<p>An old adage says, "imitate, assimilate, innovate." Getting into the recording like this is a great way to imitate & assimilate (but don't forget about the list to-do: innovate)! Walking in the footsteps of the player, some questions can include:</p>
								<ul>
									<li>What notes are getting played?</li>
                  <li>What part of the guitar are they being played on?</li>
                  <li>What's a feasible way to pick/pluck the strings?</li>
								</ul>
								<p>This is an audio-playback transcription of Dark Was the Night by Blind Willie, trying to shed some light on those questions,</p>
								<MusescoreEmbed
									pageId={275}
									userId={userId}
									ip={ip}
									embed_link="https://musescore.com/user/69479854/scores/12391498/s/egzyiU/embed"
									canAccess={true}
								/>
						<div className={styles.pricingTable2} id="c">
							<div className={styles.gridBody2}>
								<div className={styles.bottomBorderRow2}>
								  <span>PDF file: </span>
									<a
									href="https://f005.backblazeb2.com/file/ploddings-songs-pdfs/Dark_Was_the_Night_Cold_Was_the_Ground__Blind_Willie_Johnson.pdf"
										download
										target="_blank"
										rel="noopener noreferrer"
										className={styles.downloadLink}
									  >
										<button className={styles.noMargin}>
									    Download file (121.7kB)
										</button>
								  </a>
								</div>
								<div className={styles.bottomBorderRow2}>
								  <span>MuseScore™ file: </span>
									<a
									  href="https://f005.backblazeb2.com/file/ploddings-musescore-files/Dark_Was_the_Night_Cold_Was_the_Ground__Blind_Willie_Johnson(2).mscz"
										download
										target="_blank"
										rel="noopener noreferrer"
										className={styles.downloadLink}
									  >
										<button className={styles.noMargin}>
									    Download file (40.7kB)
										</button>
								  </a>
								</div>

							</div>
						</div>

              <h3>Step 3: Absorbing the sound</h3>
							<p>Then, having the roadmap of the tablature, and the slow-downer to match the Blind Willie Johnson sound to your guitar, the sounds can be blended together with each passing repetition. At full-speed, it almost feels more than impossible to ever match Johnson's finesse with the slide, but at 62% speed, 47% speed, or 35% speed, it at least starts to become conceivably possible to try.</p>
							<SlowDownerComponent 
								isUnlocked={true} 
								dropbox_mp3_link="https://dl.dropboxusercontent.com/scl/fi/62dzveezgsork7o4odf4x/Blind-Willie-Johnson-Dark-Was-the-Night-Cold-Was-the-Ground.mp3?rlkey=3bg5q0jm7yvpp9ckevy4g6ims&dl=0"
							/>
							<p>And if for example 35% speed feels doable today, then try raising it to 42% tomorrow.</p>
							<div className="categoryGroup">
								<h2>The complete Ploddings™ library: </h2>
								<p>In the same way as Dark Was the Night (Cold Was the Ground) is shown above, there are <span style={{ fontWeight: 'bold' }}>{songCount-1}</span> other songs in the Ploddings library for checking out and more are always being added on a weekly & monthly basis,</p>
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
  <h2>Our Story</h2>
<p>The Ploddings non-profit project was started in 2018 by Mitch Park, also known as Blah148, an Albertan-Korean who's felt an unlikely love for old blues & folk music ever since coming across songs like 32-20 Blues by Robert Johnson and Dark Was the Night (Cold Was the Ground) by Blind Willie Johnson, after he graduated in 2017 from the Schulich Mechanical Engineering program of the University of Calgary. Before taking this on, he enjoyed posting pre-war blues tutorials on his Youtube channel from 2011-2017</p>
						<p>By spring of 2019, blues enthusiasts from across the map started joining Ploddings, making it feel more communal, but a crucial change took place in 2022 when Ploddings became an official partner of the Mt. Zion Memorial Fund (MZMF), donating 100% of site proceeds to boost their blues preservation initiatives.</p>
						<h3>Who is the Mt. Zion Memorial Fund? </h3>
						<p>Rewinding the clock to 1989, a grassroots effort took place to help preserve the 114-year-old Mt. Zion Church (founded in 1909) where Robert Johnson is buried. Organizing at first under the name "The Robert Johnson Mount Zion Memorial Fund" in late-1989, the initiative successfully saved the church and placed a historical marker that still stands today. Under the leadership Skip Henderson & now Tyler DeWayne Moore, the MZMF has successfully erected tombstones for Charley Patton, Elmore James, Mississippi Fred McDowell, Big Joe Williams, Mississippi Joe Callicott, Memphis Minnie & James Thomas, Sam Chatmon & Sonny Boy Nelson, Lonnie Pitchford, Tommy Johnson, Charlie Burse, and T-Model Ford, as well as preserved venues and built museums honoring blues music.</p>
						<p>Today, Mitch Park still runs Ploddings.com & creates content as a way to get better at guitar & connect with others. In the spring of 2024, Tyler DeWayne Moore spoke as one of Mitch's job application references, helping him get his current day-job as a clerk of the Albertan provincial court. Since July 2024, it has afforded him time to twang at the guitar, all from the quaint lakeland area of St. Paul, Alberta.</p>
						</div>
						<div className={styles.salesContent}>
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

export async function getServerSideProps(context) {
  // Verify user session first
  const userSession = verifyUserSession(context.req);
  const forwardedFor = context.req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : context.req.connection.remoteAddress;

  // Attempt to fetch the count of songs from the 'content' table where 'page_type' is 'songs'
  // and exclude specific thread IDs
  const excludedThreadIds = [47, 48, 49, 50, 51, 52];
  const { data, error, count } = await supabase
    .from('content')
    .select('*', { count: 'exact' })
    .eq('page_type', 'songs')
    .not('thread_id', 'in', `(${excludedThreadIds.join(',')})`);

  // Initialize songCount to zero or extract the count if data is correctly retrieved
  let songCount = count || 0; // Directly use the count provided by Supabase

  if (error) {
    console.error('Error fetching song count:', error.message);
  }

  // Return props to the component
  return {
    props: {
      ip,
      userId: userSession?.id || null,
      songCount // Always return a valid number or null
    },
  };
}

