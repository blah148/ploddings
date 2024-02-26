import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';

export default function Footer ({ userId = null  }) {

	const handleLogout = async () => {
		logout();
    router.push('/');
  };


	return (
		<div className="footerContainer">
			<div className="footer_higher-row">
				<div className="footer_column">
					<h2 className="footer_header">Content</h2> 
					<Link href="/" className="footer_link-item" passHref>Home</Link>
					<Link href="/slow-downer" className="footer_link-item" passHref>Slow-downer</Link>
				</div>
				<div className="footer_column">
					<h2>Usage</h2>
					{!userId && (
						<>
							<Link href="/create-account" className="footer_link-Item" passHref>Create account</Link>
							<Link href="/login" className="footer_link-item" passHref>Login</Link>
						</>
					)}
					{userId && (
						<>
							<Link href="/account" className="footer_link-item" passHref>My account</Link>
							<a onClick={handleLogout} className="footer_link-item">Logout</a>
						</>
					)}
				</div>
				<div className="footer_column">
					<h2 className="footer_header">Github</h2> 
					<a href="https://github.com/blah148/ploddings" rel="noopener noreferrer" className="footer_link-item">Create a fork</a>
					<a href="https://github.com/blah148/ploddings/issues" rel="noopener noreferrer" className="footer_link-item">Report a bug</a>
				</div>
			</div>
			<div className="footer_lower-row">
				<Link href="/privacy-policy" className="footer_lower-item" passHref>Privacy policy</Link>
				<Link href="/terms-and-conditions" className="footer_lower-item" passHref>Terms & conditions</Link>
			</div>
		</div>
	);

}

