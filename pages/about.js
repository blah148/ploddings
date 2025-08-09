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
import Link from 'next/link';
import SubscribeButton from '../components/StripeSubscription';
import OneTimePaymentButton from '../components/StripeOneTime';
import StabilizerText from '../components/StabilizerText';
import ArtistWidget from '../components/ArtistWidget';

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
        title="About - Ploddings"
        description="The back-story of Ploddings; a place to learn more about how to play pre-war blues & roots music, mainly for guitar players."
        slug="/about"
      />
			<Sidebar userId={userId} ip={ip} />
      <div className="mainFeedAll">
        <div className="feedContainer">
          <Loader isLoading={isLoading} />
          <div className="mainFeed">
            <div className="topRow">
              <IpodMenuLink fallBack='' />
							<div style={{display: "flex"}}>
                <Menu userId={userId} />
							</div>
            </div>
            <div className="narrowedFeedBody">
							<StabilizerText />
              <h1>About</h1>
							<div>
                <p>Ploddings (est. 2018) is a not-for-profit music transcription & analysis project, focused on African-American early blues & folk styles for stringed-instruments.</p>
                <h2>i) Partnership with Mt. Zion Memorial Fund</h2>
								<p>
									Since May 2022, the Ploddings project has been proudly partnered with the Mt. Zion Memorial Fund (MZMF), led by Dr. T. DeWayne Moore, aiming to raise awareness of their blues preservation efforts. To paraphrase Quincy Jones, to the path ahead, it can help to recall the path behind. In that spirit, the Ploddings project aims to recall, and shed light on the artistry, of that preceding path. In noticing that the MZMF has demonstrated a like-minded sentiment, it helps to make the partnership feel natural.</p>
                <p>In case the Ploddings site provides any learnings, similar to how a person might glean learnings by paying for guitar lessons locally or at a workshop, then please consider paying it forward by donating to the Mt. Zion Memorial Fund at their website: 
									<a href="https://mtzionmemorialfund.com/product/donate_now/" target="_blank" rel="noopener"> here</a>;
									the MZMF is a registered 501(c)(3) charity, per the IRS.
								</p>
                <p>The work of the Mt. Zion Memorial Fund includes: (i) the erection of tombstones for musicians such as Belton Sutherland, Bo Carter, Sonny Boy Williamson II, Mississippi Fred McDowell, Memphis Minnie, Sam Chatmon, Elmore James, Charley Patton, and Frank Stokes; (ii) the preservation of historical sites; and (iii) the creation of memorials such as the Mississippi John Hurt museum.</p>
                <h2>ii) More Information</h2>
                <p>In case questions remain, please reach out via the Ploddings <Link href="/contact">contact page</Link>. The custodian & builder of Ploddings is blah148. To learn more about the Mt. Zion Memorial Fund, its current endeavors, how to volunteer, or its relationship with Ploddings, please get in touch via <a href="https://mtzionmemorialfund.com/" target="_blank">their website</a>.</p>

							</div>
							<ArtistWidget pageType="about" />
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


