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
								<NotificationIcon userId={userId} />
                <Menu userId={userId} />
							</div>
            </div>
            <div className="narrowedFeedBody">
							<StabilizerText />
              <h1>About</h1>
							<div>
                <p>Ploddings (est. 2018) is a non-profit educational resource, focused on American early blues & folk styles for stringed-instruments. It incentivises membership fees, where <b>100% of proceeds</b> are alotted to & managed by the Mt. Zion Memorial Fund For Blues & Justice.</p>
                <h2>i) Partnership with Mt. Zion Memorial Fund</h2>
                <p>Since 2023, Ploddings is proudly partnered with the Mt. Zion Memorial Fund, led by Dr. T. DeWayne Moore.</p>
                <p>Their work includes: (i) the erection of tombstones for musicians such as Belton Sutherland, Bo Carter, Sonny Boy Williamson II, Mississippi Fred McDowell, Memphis Minnie, Sam Chatmon, Elmore James, Charley Patton, and Frank Stokes; (ii) the preservation of historical sites; and (iii) the creation of memorials such as the Mississippi John Hurt museum.</p>
                <h3>How Payments/Donations are Processed</h3>
                <p>100% of membership fees on Ploddings are controlled by the Mt. Zion Memorial Fund organization as charitable donations*. To be specific, their bank account is attached to & directly receives all Stripe payments on Ploddings; therefore, no middle-man handling of payments/donations exists. </p>

                <sub>
	                <p>*For citizens of the USA, that means Ploddings membership fees are tax-deductible, as the Mt. Zion Memorial Fund has public charity status approved by the IRS per section 170(b)(1)(A)(vi) of the IRC.
                  </p>
                </sub>
								<h2>ii) How Subscriptions Work</h2>
								<p>Users of Ploddings may sign-up for one-time fee of $195 CAD, representing a donation to the Mt. Zion Memorial Fund account.</p>
								<p>A membership grants privileges that include:</p>
								<ol>
									<li>Downloading (in PDF & MusesScore form) of playback-tablature, and</li>
									<li>Use of the slow-downer / pitch-shifter tool.</li>
								</ol>
                <h2>iii) More Information</h2>
                <p>Still have questions? For general inquiries, user support, or comments please reach out via the Ploddings <Link href="/contact">contact page</Link>. The custodian & builder of Ploddings is Blah148. To learn more about the Mt. Zion Memorial Fund, its current endeavors, how to volunteer, or its relationship with Ploddings, please get in touch via <a href="https://mtzionmemorialfund.com/" target="_blank">their website</a>.</p>

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


