// pages/terms.js
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import IpodMenuLink from '../components/ParentBackLink';
import jwt from 'jsonwebtoken';
import Loader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';

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

export default function TermsAndConditions({ userId, ip }) {
	
	const { isLoading, setIsLoading } = useLoading();

  return (
		<div className="bodyA">
				<Sidebar userId={userId} ip={ip} />
				<div className="mainFeedAll">
						<div className="feedContainer">
								<Loader isLoading={isLoading} />
								<div className="mainFeed">
										<div className="topRow">
												<IpodMenuLink fallBack='/' />
												<Menu userId={userId} />
										</div>
										<div className="narrowedFeedBody">
											<h1>Terms and Conditions</h1>
											<p>These terms and conditions govern the use of Ploddings, a platform dedicated to guitar learning with resources including tablature, video content, and slow-downer software, all designed for educational purposes only.</p>
											
											<h2>License</h2>
											<p>The Ploddings project is made available under the Apache 2.0 license. This license allows for the free use, modification, and distribution of the software, provided that all copies and substantial portions of the software include the same license and copyright notice as the original. Contributions made to the project must also be shared under the same license.</p>
											
											<h2>Educational Use</h2>
											<p>The resources provided by Ploddings are intended strictly for educational purposes. Users are encouraged to engage with the materials for personal growth and learning in the field of guitar music. Commercial use of the materials provided by Ploddings is outside the scope of the license and terms provided.</p>
											
											<h2>Contributions</h2>
											<p>If users find the content provided by Ploddings enjoyable and beneficial, it is encouraged to contribute to the betterment of the platform. Contributions may include, but are not limited to, suggestions for improvements, identification of bugs, resolutions to existing bugs, or the provision of additional educational content. All contributions are welcomed and valued as they aid in the collective effort to enhance the learning experience for all users.</p>
											
											<p>It is understood that by using Ploddings, users agree to the terms outlined above. Ploddings reserves the right to modify these terms and conditions at any time. Continued use of the platform following any such changes shall constitute consent to such changes.</p>
										</div>
								</div> 
						</div> 
						<Footer userId={userId} />
				</div>
		</div>
  );
}

