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

// Dummy icon components
const CheckIcon = () => <span className={styles.icon}>✔️</span>; // Placeholder for checkmark icon
const XIcon = () => <span className={styles.icon}>❌</span>; // Placeholder for X icon

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

  useEffect(() => {
    console.log('this is the email', email);
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
								<div></div> {/* Empty for alignment */}
								<div className={styles.planType}>
									<h2>Visitor Plan</h2>
									<span>$0</span>
								</div>
								<div className={styles.planType}>
									<h2>Contributor Plan</h2>
									<span>$195 CAD</span>
								</div>
							</div>
							<div className={styles.gridBody}>
								<div className={styles.bottomBorderRow}>
								<span className="bullet">a. Viewing permissions for all MuseScore™ tablature</span>
								<div className="led center unlocked"></div>
								<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
								
								<span className="bullet">b. Download permissions for: (i) PDF tablature, and (ii) MuseScore™ file for all songs</span>
								<div className="led center locked"></div>
								<div className="led center unlocked"></div>
								</div>
								<div className={styles.bottomBorderRow}>
								
								<span className="bullet">c. Unlimited use of the slow-downer & pitch shifter tool</span>
								<div className="led center locked"></div>
								<div className="led center unlocked"></div>
								</div>
							</div>
							<div className={styles.gridHeader}>
								<div></div> {/* Empty for alignment */}
								<div className={styles.planType}>
									<h2>Visitor Plan</h2>
									<span>$0</span>
								</div>
								<div className={styles.planType}>
								<button style={{marginTop: "5px", marginBottom: "5px"}} className="formButton Stripe">
									<SubscribeTextJoin text="Continue to Stripe" />
								</button>
								</div>
							</div>
						</div>
            {/* Sales Content */}
            <div className={styles.salesContent}>
              <h2>Why Choose Ploddings?</h2>
              <p>Imagine finding your unique guitar playing voice by first learning the ways of guitarists of yesterdays such as Etta Baker, John Fahey, Elizabeth Cotten, Reverend Gary Davis, King Solomon Hill, Charley Patton, Robert Petway, Robert Johnson, and others..</p>
              <h3>How would you find your unique sound?</h3>
              <p>Well for instance, as a contributor, not only do you get playable tablature to know exact notes for songs like Blind Willie Johnson's seminal tune, Dark Was the Night (Cold Was the Ground)..</p>
              <MusescoreEmbed
                pageId={275}
                userId={userId}
                ip={ip}
                embed_link="https://musescore.com/user/69479854/scores/12391498/s/egzyiU/embed"
                canAccess={true}
              />
              <ol>
                <h3>But you also get to have..</h3>
                <li>The ability to print the (above) PDF files of MuseScore™ guitar tablature for offline practice,</li>
                <li>The access to download all editable MuseScore™ files for the site's song library (however no commercial usage of MuseScore file downloads is allowed)</li>
                <li>Unlimited usage of the slow-downer & pitch-shifter play-along tool. Give it a try by testing playback with the interactive tool right below,</li>
                <SlowDownerComponent 
                  isUnlocked={true} 
                  dropbox_mp3_link="https://dl.dropboxusercontent.com/scl/fi/62dzveezgsork7o4odf4x/Blind-Willie-Johnson-Dark-Was-the-Night-Cold-Was-the-Ground.mp3?rlkey=3bg5q0jm7yvpp9ckevy4g6ims&dl=0"
                />
              </ol>
              <p><strong>As long as Ploddings survives (est. 2018), you will have lifetime access to these privileges for all [number of songs].</strong></p>
              {/* Disclaimer */}
              <div className={styles.disclaimer}>
                <strong>Are you a citizen of the USA?</strong> <span role="img" aria-label="USA flag">🇺🇸</span> Then your one-time contribution is tax-deductible since all payments are directly transferred to the Mount Zion Memorial Fund (MZMF), an IRS-recognized charity and official partner of Ploddings. After contributing the 100% one-time donation to the MZMF, users are encouraged to contact the Mt. Zion Memorial Fund directly for proof-of-receipts paperwork for tax purposes with their: (i) email address and (ii) date of purchase information at: <a href="https://mtzionmemorialfund.com/online-support-portal/" target="_blank" rel="nofollow noopener noreferrer">Mt. Zion Memorial Fund - Contact Page</a>.
              </div>
              {/* Backstory */}
              <div className={styles.backstory}>
                <p><strong>Question #1:</strong> Does Ploddings.com act as a payment processing middleman between the site-access contribution & the Mt. Zion Memorial Fund?</p>
                <p><strong>Answer:</strong> No, all payment contributions through Stripe are directly sent to the Mt. Zion Memorial Fund, and contributors are encouraged to reach out to the Mt. Zion Memorial Fund immediately after transferring their donation to confirm their 100% proceeds donation to MZMF & tax-deductible receipt, while verifying access to Ploddings.</p>
                <p><strong>Question #2:</strong> Is the one-time contribution refundable?</p>
                <p>
                  <strong>Answer:</strong> Since 2018, there has never been a single refund requested by the more than 100 customers of Ploddings, and they are discouraged since users could conceivably pay for a membership, download all the current files, then request a refund. However, if the day arises when a user asks for a refund and needs it, they can reach out to Ploddings support at: 
                  <Link href="/contact" passHref>
                    <span style={{ textDecoration: 'underline', color: 'inherit', cursor: 'pointer', marginLeft: '4px', marginRight: '4px' }}>ploddings.com/contact</span>
                  </Link> 
                  for thoughtful mediation.
                </p>
              </div>
            </div>
            <Footer userId={userId} />
          </div>
        </div>
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

