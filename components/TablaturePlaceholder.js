import Link from 'next/link';

function TablaturePlaceholder({ songName }) {
    return (
        <div style={{
            height: '500px', // Example fixed height
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            border: '1px solid #ccc', // Mimicking an iframe border
            borderRadius: '4px',
            backgroundColor: '#f8f8f8',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <h2>Transcription for: {songName}</h2>
						<p style={{ textAlign: 'center' }}>Note: the interactive MuseScore tablature is non-viewable for site visitors. In case of interest to: (i) view the interactive tablature and (ii) use the slow-downer / pitch-shifter tool for the original recording, please consider paying one of the available toll options, as an active user. All gross revenue from the toll proceeds via Stripe are transferred directly to the Mt. Zion Memorial Fund. Ploddings exists as a non-profit transcription project. </p>
            <Link href="/activate-user-account" style={{ textDecoration: 'none', color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px' }}>Learn more: activate user account</Link>
        </div>
    );
}

export default TablaturePlaceholder;

