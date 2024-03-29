import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';


export default function Footer ({ userId = null  }) {

  const router = useRouter();

	const handleLogout = async () => {
		await fetch('/api/logout', { method: 'POST' });
		router.push('/');
	};

	return (
		<div className="footerContainer">
			<div className="footer_higher-row">
				<div className="footer_column">
					<h2 className="footer_header">Content</h2> 
					<Link href="/" className="footer_link-item" passHref>Home</Link>
					<Link href="/slow-downer" className="footer_link-item" passHref>Slow-downer</Link>
		  		<Link href="/blog" className="footer_link-item" passHref>Blog</Link>
				</div>
				<div className="footer_column">
					<h2>Usage</h2>
					{!userId && (
						<>
							<Link href="/account" className="footer_link-Item" passHref>Create account</Link>
							<Link href="/login" className="footer_link-item" passHref>Login</Link>
						</>
					)}
					{userId && (
						<>
							<Link href="/account" className="footer_link-item" passHref>Account</Link>
							<a onClick={handleLogout} className="footer_link-item" style={{cursor: 'pointer'}}>Logout</a>
						</>
					)}
					<Link href="/contact" className="footer_link-item" passHref>Contact</Link>
				</div>
				<div className="footer_column">
					<h2 className="footer_header">Github</h2> 
					<a target="_blank" href="https://github.com/blah148/ploddings" rel="noopener noreferrer" className="footer_link-item">Create a fork</a>
					<a target="_blank" href="https://github.com/blah148/ploddings/issues" rel="noopener noreferrer" className="footer_link-item">Report a bug</a>
				</div>
			</div>
			<div className="footer_lower-row">
				<Link href="/privacy-policy" className="footer_lower-item" passHref>Privacy policy</Link>
				<Link href="/terms-and-conditions" className="footer_lower-item" passHref>Terms & conditions</Link>
			</div>
		</div>
	);

}

