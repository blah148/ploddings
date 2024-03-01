import React, { useState } from 'react';
import SlowDownerComponent from '../components/slowDownerComponent';
import { useLoading } from '../context/LoadingContext';
import jwt from 'jsonwebtoken';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar';
import IpodMenuLink from '../components/ParentBackLink';
import { uploadSong } from '../utils/uploadSong';


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
  const [mp3Link, setMp3Link] = useState('');
  // Use a state variable to hold a unique key for each conversion
  const [mp3Key, setMp3Key] = useState('');
	const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadFile = async () => {
		startLoading();
		setMp3Key(null);
    if (!file) return;

    const { publicURL, error } = await uploadSong(file);

    if (error) {
      alert('Upload failed: ', error);
      stopLoading();
      return;
    }
		stopLoading();
    setMp3Link(publicURL);
		setMp3Key('ready');
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
						<h1>Slow-Downer & Pitch-Shifter</h1>
						<div style={{display: 'block'}}>
							<div className="messageNotice">Accepts mp3/wav/aac/m4a/opus file-types with a maximum size of 5MB</div>
						</div>
						<input type="file" accept="audio/*,.wav,.mp3,.aac,.m4a,.opus" onChange={handleFileChange} />
						<button onClick={uploadFile} disabled={isLoading}>
							{isLoading ? 'Uploading...' : 'Upload'}
						</button>
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


