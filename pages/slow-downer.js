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
import SEO from '../components/SEO';
import UnlockAudioButton from '../components/UnlockAudioButton';
import NotificationIcon from '../components/NotificationIcon';
import StabilizerText from '../components/StabilizerText';
import TokenAndBalance from '../components/TokensMenuItem';
import VideoComponent from '../components/CustomYoutubePlayer';

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
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/aac', 'audio/m4a', 'audio/opus'];
  const errorHandler = (message) => {
    alert(message); // Display the error message to the user
    e.target.value = ''; // Reset the file input
    // Any additional error handling logic here
  };
  console.log('file-type', file.type);
  // Check for file type validity
  if (!validTypes.includes(file.type)) {
    errorHandler('Invalid file type.');
    return; // Should exit the function, preventing further execution
  }

  // Check for file size limit
  if (file.size > 5 * 1024 * 1024) {
    errorHandler('File is too large.');
    return; // Should exit the function, preventing further execution
  }

  // This line is reached only if all validations pass
  setFile(file);
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
       <SEO
				 title="Slow-Downer and Pitch-Shifter"
         description="Upload mp3 files and: (i) pitch-shift and/or (ii) slow-down songs so that transcribing them is easy-as-blueberry-pie.. almost as-easy, at least"
         slug="/slow-downer"
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
						<StabilizerText />
						<h1>Slow-Downer & Pitch-Shifter</h1>
						<div style={{display: 'block'}}>
							<div className="messageNotice">Accepts mp3/wav/aac/m4a/opus file-types with a maximum size of 5MB</div>
						</div>
						<input type="file" style={{marginRight: '7px', width: '27ch'}} accept="audio/*,.wav,.mp3,.aac,.m4a,.opus" onChange={handleFileChange} />
						<button onClick={uploadFile} disabled={isLoading} >
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
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor ? forwardedFor.split(',')[0] : req.connection.remoteAddress;
  
  return {
    props: {
      ip,
      userId: userSession?.id || null,
    },
  };
}


