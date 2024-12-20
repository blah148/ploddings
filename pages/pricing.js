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
        title="Pricing"
        description="The tablature & slow-downer tools can be accessed by choosing between 3 pricing options. All payments are controlled by the non-profit fund, the Mt. Zion Memorial Fund."
        slug="/pricing"
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
              <h1>Pricing</h1>
            </div>
            <div className={styles.pricingTable}>
							<div className={styles.gridHeader}>
								<div className={styles.tocTitle}>(Click/tap to jump-to)</div>
								<div className={styles.planType}>
									<h2>1-Month</h2>
									<Image 
										alt="johnny st. cyr guitar portrait"
										src="https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px-logo1.0/johnny+(P).jpg"
										width={70}
										height={70}
										loading="lazy"
										style={{ color: 'transparent' }}
										className={styles.artistIcon}
									/>
								</div>
								<div className={styles.planType}>
									<h2>3-Months</h2>
									<Image 
										alt="willie brown future blues guitar portrait"
										src="https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px-logo1.0/WillieBrown+(P).jpg"
										width={70}
										height={70}
										loading="lazy"
                    className={`${styles.artistIcon}`}
									/>
								</div>
								<div className={styles.planType}>
									<h2>12-Months</h2>
									<Image 
										alt="etta baker banjo portrait railroad bill"
										src="https://f005.backblazeb2.com/file/ploddings-threads/featured_img_200px-logo1.0/etta+(P).jpg"
										width={70}
										height={70}
										loading="lazy"
										className={styles.artistIcon}
									/>
								</div>
							</div>
							<div className={styles.gridBody}>
								<div className={styles.bottomBorderRow}>
									<a href="#a" className="bullet">a. Unlimited usage of the slow-downer playback tool</a>
									<div className="led center unlocked"></div>
									<div className="led center unlocked"></div>
									<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
									<a href="#b" className="bullet">b. Viewing & downloading of all MuseScore™ transcription tablature</a>
									<div className="led center unlocked"></div>
									<div className="led center unlocked"></div>
									<div className="led center unlocked"></div>
								</div>
							</div>
							<div className={styles.gridHeader}>
								<div></div> {/* Empty for alignment */}
								<div className={[styles.planType, styles.bottom].join(' ')}>
									<h3>$10</h3>
									<SubscribeTextJoin
										email={email} // Ensure 'email' is managed in the parent component
										text="Billing cycle: 1-month"
										priceId="price_1QgJFMGNqRWlCRP" // Replace with your actual Price ID for 1-Month
									/>
								</div>
								<div className={[styles.planType, styles.bottom].join(' ')}>
									<h3>$20</h3>
									<SubscribeTextJoin
										email={email}
										text="Billing cycle: 3-months"
										priceId="price_1RQjYwfUUsVTH1O" // Replace with your actual Price ID for 3-Months
									/>
								</div>
								<div className={[styles.planType, styles.bottom].join(' ')}>
									<h3>$60</h3>
									<SubscribeTextJoin
										email={email}
										text="Billing cycle: 12-months"
										priceId="price_1RQjZAHVkHrRwIe" // Replace with your actual Price ID for 12-Months
									/>
								</div>
							</div>
						</div>
            {/* Sales Content */}
            <div className={styles.salesContent}>
							<h2>Example: Bring Me My Shotgun by Lightnin' Hopkins</h2>
                <p>The goal of Ploddings, for users, is <i>to help</i> in getting down the sound of pre-war blues style music. This section is meant to demonstrate the 2-tools that the Ploddings site provides to help in this goal: (i) the slow-downer tool, and (ii) the MuseScore transcription tablature.</p>
                <p>As an example, imagine that the Lightnin' Hopkins sound on Bring Me My Shotgun is set as the 'goal sound'. An E-blues in the style of Lightnin' Hopkins is doable to get 20% or 30% down, but the remaining 70% or 80% – the rhythmic hesitations, the subtle fingerpicked rakes, the usage of the open strings – are easily overlooked and easier still to round-off as not being there at all. Small wonder then why, in listening back to the practicer's playing, it often doesn't quite sound like Lightnin' Hopkins, even though the criteria appears to be met.</p>
                <h3 id="a">a) the Slow-Downer Tool</h3>
                <p>To pick-out the details of the pitches and the rhythms, slowing down the original recording of Bring Me My Shotgun, even to 25% speed, can be helpful for tasks like creating a transcription; details that seem unnoticeable at 100% normal speed can become front-and-centre at 50% or 45% speed. For playing alongside the recording, the slow-downer can be set to a lower speed, for example 65% speed, and then steadily increased until the tempo has returned to 95% or 100% speed.</p>
                <SlowDownerComponent 
                  isUnlocked={true} 
                  dropbox_mp3_link="https://dl.dropboxusercontent.com/scl/fi/i0q9kawn9pwcmya3o4pp3/Lightnin-Hopkins-Bring-Me-My-Shotgun.mp3?rlkey=9632w5pf421zn8rrdp7ymb83x&dl=0"
                />
							<p><strong>Note:</strong> The slow-downer tool is available for all songs on the Ploddings library. It can also be used to loop particular sections, and can pitch-shift the recording to help match the tuning to a physical guitar. </p>
							<h3 id="b">b) the MuseScore Tablature</h3>
              <p>The songs in the Ploddings library each have a transcription; that is, note-for-note guitar tablature of the song, which has been derived by blah148, using the slow-downer tool. Unlike earlier iterations of the Ploddings site, that focused more on video demonstrations, the MuseScore tablature allows for more accountability of accuracy, since any user can click the "play" button on the interactive tablature, listen to the tablature, and compare it with the original recording. MuseScore is not-for-profit; it is open-source and free for anyone to use.</p>
								<MusescoreEmbed
									pageId={275}
									userId={userId}
									ip={ip}
									embed_link="https://musescore.com/user/69479854/scores/12391615/s/3iaEz1/embed"
									canAccess={true}
								/>
							<p>The combination of the: (i) slow-downer tool and the (ii) interactive tablature is not promised as a "magic bullet" to understand and internalize the music. For example, seeing various "pickup" notes that lead into other notes, which initially may not have been so obvious without these implements, does not guarantee that all viewers will then acknowledge such details in their own playing. However, used in its suggested ways it could conceivably abbreviate learning timespans, when compared to just listening at full-speed to the original recordings of songs such as Bring Me My Shotgun; these are some suggested use-cases:</p>
							<ul>
								<li>Use the slow-downer tool to make transcriptions, and compare those transcriptions with the ploddings transcriptions,</li>
								<li>Play and/or sing alongside the slow-downer tool, and progressively increase the tempo to match the original recording,</li>
								<li>Examine the interactive tablature for unexpected pitch/rhythm details that can help inform future guitar playing</li>
							</ul>
							<div className="categoryGroup">
	              <h2>What songs are included?</h2>
	              <p>In addition to Bring Me My Shotgun, these are the other songs in the Ploddings library that have: (i) the slow-downer tool and a (ii) MuseScore transcription. All songs on this list have been added since August of 2023, and more will added with each passing month.</p>

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

