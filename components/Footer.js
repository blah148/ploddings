import React, { useState, useEffect, createContext, useContext } from 'react';
import Logout from '../components/Logout';
import Link from 'next/link';
import { useAuth } from '../path/to/authContext';

export default function Footer () {
	const { isAuthenticated } = useAuth();

  return (
    <div className="footerContainer">
      <div className="footer_higher-row">
        <div className="footer_column">
            <h2 className="footer_header">Usage</h2>
            {!isAuthenticated && (
                <>
                  <Link href="/register"><a className="footer_link-item">Create account</a></Link>
                  <Link href="/login"><a className="footer_link-item">Login</a></Link>
                </>
            )}
            {isAuthenticated && (
                <>
                  <Link href="/account"><a className="footer_link-item">My account</a></Link>
										<Logout />
                </>
            )}
			<div className="footer_column">
					<h2 className="footer_header">Open source</h2>
					<a href="https://github.com/blah148/ploddings" rel="noopener noreferrer" className="footer_link-item">Github</a>
					<a href="https://github.com/blah148/ploddings/pulls" rel="noopener noreferrer" className="footer_link-item">Contribute</a>
			</div>
			<div className="footer_column">
					<h2 className="footer_header">Feedback</h2>
					<a href="https://github.com/blah148/ploddings/issues" rel="noopener noreferrer" className="footer_link-item">Report a bug</a>
      </div>
      <div className="footer_lower-row">
        <Link href="/privacy-policy"><a className="footer_lower-item">Privacy policy</a></Link>
        <Link href="/terms-and-conditions"><a className="footer_lower-item">Terms & conditions</a></Link>
      </div>
    </div>
  );

}
