import React, { useState, useEffect, useRef } from 'react';
import Logout from './Logout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Menu({ userId = null }) {

  const [showMenu, setShowMenu] = useState(false);
	const router = useRouter();
  const menuRef = useRef(); // Create a ref for the menu
  
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Event listener to close the menu if click occurs outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    // Add event listener when the menu is shown
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]); // Only re-run if showMenu changes

	const handleLogout = async () => {
		await fetch('/api/logout', { method: 'POST' });
		router.push('/');
	};

  return (
    <>
      <svg className="menuIcon" onClick={toggleMenu} viewBox="0 0 448 512" aria-hidden="true" focusable="false">
        <path fill="#c3c7c7" d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
      </svg>

      <div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
      {userId ? (
          <>
 				<Link className="menuItem" href="/account" passHref>
          <svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <polygon points="28.07 21 22 15 28.07 9 29.5 10.41 24.86 15 29.5 19.59 28.07 21"/>
            <path d="M22,30H20V25a5,5,0,0,0-5-5H9a5,5,0,0,0-5,5v5H2V25a7,7,0,0,1,7-7h6a7,7,0,0,1,7,7Z"/>
            <path d="M12,4A5,5,0,1,1,7,9a5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,12,2Z"/>
            <rect fill="none" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32" height="32"/>
          </svg>
          <p className="menuLabel">Account</p>
        </Link>
        <a onClick={handleLogout} className="menuItem" style={{cursor: 'pointer'}}>
          <svg id="icon" viewBox="0 0 32 32">
            <path d="M26,30H14a2,2,0,0,1-2-2V25h2v3H26V4H14V7H12V4a2,2,0,0,1,2-2H26a2,2,0,0,1,2,2V28A2,2,0,0,1,26,30Z"/>
            <polygon points="14.59 20.59 18.17 17 4 17 4 15 18.17 15 14.59 11.41 16 10 22 16 16 22 14.59 20.59"/>
            <rect fill="none" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32" height="32"/>
          </svg>
          <p className="menuLabel">Logout</p>
        </a>

        </>
        ) : (
        <>
           <Link className="menuItem" href="/join" passHref>
						 <svg id="icon" viewBox="0 0 32 32">
							 <polygon points="32 14 28 14 28 10 26 10 26 14 22 14 22 16 26 16 26 20 28 20 28 16 32 16 32 14"/>
							 <path d="M12,4A5,5,0,1,1,7,9a5,5,0,0,1,5-5m0-2a7,7,0,1,0,7,7A7,7,0,0,0,12,2Z" transform="translate(0 0)"/>
							 <path d="M22,30H20V25a5,5,0,0,0-5-5H9a5,5,0,0,0-5,5v5H2V25a7,7,0,0,1,7-7h6a7,7,0,0,1,7,7Z" transform="translate(0 0)"/>
							 <rect fill="none" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32" height="32"/>
						 </svg>
						 <p className="menuLabel">Join</p>
           </Link>
           <Link href="/login" className="menuItem" passHref>
             <svg id="icon" viewBox="0 0 32 32">
             <path d="M26,30H14a2,2,0,0,1-2-2V25h2v3H26V4H14V7H12V4a2,2,0,0,1,2-2H26a2,2,0,0,1,2,2V28A2,2,0,0,1,26,30Z"/>
             <polygon points="14.59 20.59 18.17 17 4 17 4 15 18.17 15 14.59 11.41 16 10 22 16 16 22 14.59 20.59"/>
             <rect fill="none" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32" height="32"/>
            </svg>
            <p className="menuLabel">Login</p>
          </Link>
        </>
        )}
        <Link href="/account#starred" className="menuItem mobileOnly" passHref>
					<svg id="icon" viewBox="0 0 32 32">
						<defs>
							<style>
								{`
									.cls-1 {
										fill: none;
									}
								`}
							</style>
						</defs>
						<path d="M16,6.52l2.76,5.58.46,1,1,.15,6.16.89L22,18.44l-.75.73.18,1,1.05,6.13-5.51-2.89L16,23l-.93.49L9.56,26.34l1-6.13.18-1L10,18.44,5.58,14.09l6.16-.89,1-.15.46-1L16,6.52M16,2l-4.55,9.22L1.28,12.69l7.36,7.18L6.9,30,16,25.22,25.1,30,23.36,19.87l7.36-7.17L20.55,11.22Z"/>
						<rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="32" height="32"/>
					</svg>
          <p className="menuLabel">Starred</p>
       </Link>
       <Link href="/account#visit-history" className="menuItem mobileOnly" passHref>
					<svg id="icon" viewBox="0 0 32 32">
						<defs>
						<style>{`
							.cls-1 {
								fill: none;
							}
						`}</style>
						</defs>
						<polygon points="20.59 22 15 16.41 15 7 17 7 17 15.58 22 20.59 20.59 22"/>
						<path d="M16,2A13.94,13.94,0,0,0,6,6.23V2H4v8h8V8H7.08A12,12,0,1,1,4,16H2A14,14,0,1,0,16,2Z"/>
						<rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="32" height="32"/>
					</svg>
          <p className="menuLabel">History</p>
        </Link>
     </div>
    </>
  );
}

