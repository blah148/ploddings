import Link from 'next/link';

function TablaturePlaceholder() {
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
            <h2>Access to Tablature</h2>
            <p>To view the full tablature, please consider our subscription plans.</p>
            <Link href="/pricing" style={{ textDecoration: 'none', color: 'white', backgroundColor: '#007BFF', padding: '10px 20px', borderRadius: '5px' }}>Go to Pricing</Link>
        </div>
    );
}

export default TablaturePlaceholder;

