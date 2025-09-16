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
					<Link href="/" className="footer_link-item" passHref>All guitar tabs</Link>
		  		<Link href="/blog" className="footer_link-item" passHref>Blog</Link>
				</div>
				<div className="footer_column">
					<h2>Contact</h2>
					<Link href="/contact" className="footer_link-item" passHref>Send a message</Link>
				</div>
				<div className="footer_column">
					<h2 className="footer_header">Project</h2> 
					<Link href="/about" className="footer_link-item" passHref>About</Link>
					<a target="_blank" href="https://github.com/blah148/ploddings" rel="noopener noreferrer" className="footer_link-item">Github</a>
				</div>
			</div>
			<div className="footer_lower-row">
				<div className="footerTagline">
					<Link href="/">Ploddings: A Vault of Pre-War Blues Guitar Tablature</Link>
				</div>
				<div className="classFooterLinks">
				  <Link href="/privacy-policy" className="footer_lower-item" passHref>Privacy policy</Link>
				  <Link href="/terms-and-conditions" className="footer_lower-item" passHref>Terms & conditions</Link>
				</div>
			</div>
		</div>
	);

}

