import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'cookie';
import { useLoading } from '../context/LoadingContext';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import NotificationIcon from '../components/NotificationIcon';
import jwt from 'jsonwebtoken';
import IpodMenuLink from '../components/ParentBackLink';
import SEO from '../components/SEO';
import Link from 'next/link';
import SubscribeButton from '../components/StripeSubscription';
import OneTimePaymentButton from '../components/StripeOneTime';
import StabilizerText from '../components/StabilizerText';
import TokenAndBalance from '../components/TokensMenuItem';

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

export default function About({ userId, ip }) {
  const { isLoading, setIsLoading } = useLoading();

  return (
    <div className="bodyA">
      <SEO
        title="About | Ploddings"
        description="To persist your: (i) visit history, (ii) starred guitar tablature, and (iii) access the pitch-shifter and slow-downer, create an account on Ploddings with an email"
        slug="/subscribe"
      />
			<Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
							<div style={{display: "flex"}}>
								{userId && <TokenAndBalance userId={userId} />}
								<NotificationIcon userId={userId} />
                <Menu userId={userId} />
							</div>
            </div>
            <div className="narrowedFeedBody">
							<StabilizerText />
              <h1>About</h1>
							<div>
                <p>Ploddings (est. 2018) is a non-profit educational resource, focused on American early blues & folk styles for stringed-instruments. It collects membership fees, where <b>100% of proceeds</b> are alotted to the Mt. Zion Memorial Fund For Blues & Justice.</p>
                <h2>i) Partnership with Mt. Zion Memorial Fund</h2>
                <p>Since 2023, Ploddings is proudly partnered with the Mt. Zion Memorial Fund, led by Dr. T. DeWayne Moore.</p>
                <p>Their work includes: (i) the erection of tombstones for musicians such as Bo Carter, Sonny Boy Williamson II, Mississippi Fred McDowell, Memphis Minnie, Sam Chatmon, Elmore James, Charley Patton, Frank Stokes; (ii) the preservation of historical sites; and (iii) the creation of memorials such as the Mississippi John Hurt museum.</p>
                <h3>How Donations are Processed</h3>
                <p>100% of membership fees collected via Ploddings are alotted to & controlled by the Mt. Zion Memorial Fund organization as charitable donations*. To be specific, their bank account directly receives all Stripe payments on Ploddings; therefore, no middle-man handling of payments/donations exists. </p>

                <sub>
	                <p>*For citizens of the USA, that means Ploddings membership fees are tax-deductible, as the Mt. Zion Memorial Fund has public charity status approved by the IRS per section 170(b)(1)(A)(vi) of the IRC.
                  </p>
                </sub>
								<h2>ii) How Memberships Work</h2>
								<p>Users of Ploddings may sign-up for a $5-per-month subscription fee, representing a donation to the Mt. Zion Memorial Fund account. Each successful payment dispenses 2 unlock tokens, where 1 token can unlock 1 song.</p>
								<p>After unlocking a song, 2 additional features are granted. The ability to:</p>
								<ol>
									<li>Download a PDF of the transcription, and</li>
									<li>Use the slow-downer / pitch-shifter tool.</li>
								</ol>
								<h3>Token Policy</h3>
								<p>All tokens on Ploddings are:</p>
								<ul>
									<li>Non-refundable</li>
									<li>Do not expire</li>
								</ul>
                <h2>iii) More Information</h2>
                <p>Still have questions? For general inquiries, user support, or comments please reach out via the Ploddings <Link href="/contact">contact page</Link>. You will see a reply in your inbox within 12 hours. To learn more about the Mt. Zion Memorial Fund, its current endeavors, how to get involved as a volunteer, or its relationship with Ploddings, please contact them via <a href="https://mtzionmemorialfund.com/" target="_blank">their website</a>.</p>

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


