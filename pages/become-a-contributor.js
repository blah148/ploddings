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
import styles from '../components/UserTokenDashboard.module.css';
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

      // Assuming 'setCookie' is available to set cookies
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
              <h1>Activate membership</h1>
							<p>To bypass the visitor-only viewing limitation on Ploddings, in which the MIDI-tablature & slow-downer / pitch shifter tool of only 1-song can be viewed every 72 hours, a monthly-fee of <b>$20 USD</b> can be paid, granting the following permissions:</p>
							<ul>
								<li>For all songs, unlimited usage of: (i) MIDI-tablature/transcriptions and (ii) slow-downer/pitch-shifter tool</li>
								<li>Unlimited PDF downloads of tablature/transcriptions</li>
								<li>100% proceeds donated to Mt. Zion Memorial Fund</li>
							</ul>
							<p>As a non-profit project, 100% of membership fees on Ploddings are directly transmitted/donated via Stripe to an account controlled by the Mt. Zion Memorial Fund for Blues & Justice; an IRS-certified charity with a demonstrated history, since 1989, that includes the erection of tombstones for Bo Carter, Charley Patton, Elmore James, Frank Stokes, Mississippi Fred McDowell, and Robert Johnson, as well as other blues preservation projects in the American South.<span className={styles.learnMoreSpan}><Link href="/about">(Learn more)</Link></span></p>
							<button style={{marginTop: "5px", marginBottom: "5px"}} className="formButton">
							  <SubscribeTextJoin text="Stripe checkout: $20 USD" />
							</button>
							<p>Note: While the monthly-subscription can be cancelled at anytime without penalty, membership fees are non-refundable.</p>
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

