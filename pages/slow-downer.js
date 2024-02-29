import React, { useState } from 'react';
import SlowDownerComponent from '../components/slowDownerComponent';
import { useLoading } from '../context/LoadingContext';
import jwt from 'jsonwebtoken';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import IpodMenuLink from '../components/ParentBackLink';

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

export default function YoutubeDl({ userId, ip }) {
	const { isLoading, startLoading, stopLoading } = useLoading();
  const [url, setUrl] = useState('');
  const [mp3Link, setMp3Link] = useState('');
  // Use a state variable to hold a unique key for each conversion
  const [mp3Key, setMp3Key] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
			startLoading();
      const response = await fetch('/api/youtube-dl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the state with the converted MP3 link and a unique key
        setMp3Link(data.url);
        setMp3Key(Date.now().toString()); // Use the current timestamp as a unique key
        console.log('here\'s the url on the other side', data.url);
				stopLoading();
        alert('Conversion successful! Check the console for details.');
      } else {
        stopLoading();
				alert('Failed to convert the video.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form.');
    }
  };

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
						<a target="_blank" className="youtubeLogoContainer" href="https://www.youtube.com" rel="noopener noreferrer">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="-35.20005 -41.33325 305.0671 247.9995">
								<path d="M229.763 25.817c-2.699-10.162-10.65-18.165-20.748-20.881C190.716 0 117.333 0 117.333 0S43.951 0 25.651 4.936C15.553 7.652 7.6 15.655 4.903 25.817 0 44.236 0 82.667 0 82.667s0 38.429 4.903 56.85C7.6 149.68 15.553 157.681 25.65 160.4c18.3 4.934 91.682 4.934 91.682 4.934s73.383 0 91.682-4.934c10.098-2.718 18.049-10.72 20.748-20.882 4.904-18.421 4.904-56.85 4.904-56.85s0-38.431-4.904-56.85" fill="red"/>
								<path d="M93.333 117.559l61.333-34.89-61.333-34.894z" fill="#fff"/>
							</svg>
							<div>Youtube</div>
						</a>
						<h1>Slow-Downer & Pitch-Shifter</h1>
						<form className="submitYoutube" onSubmit={handleSubmit}>
							<input
								type="text"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="Enter YouTube URL here"
								required
							/>
							<button type="submit">Submit</button>
						</form>
						<div style={{ opacity: mp3Link ? 1 : 0.5 }}>
							{/* Assign the unique key to SlowDownerComponent */}
							{<SlowDownerComponent key={mp3Key} dropbox_mp3_link={mp3Link} />}
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
  const ip = req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}


