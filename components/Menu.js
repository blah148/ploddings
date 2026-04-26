import React, { useState, useEffect, useRef } from 'react';
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
  }, [showMenu]);

  return (
    <>
      <svg
        className="menuIcon"
        onClick={toggleMenu}
        viewBox="0 0 448 512"
        aria-hidden="true"
				style={{ marginLeft: 'auto' }}
        focusable="false"
      >
        <path
          fill="#c3c7c7"
          d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
        />
      </svg>

      <div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
        <Link className="menuItem" href="/" passHref>
          <p className="menuLabel">Home</p>
        </Link>
        <Link className="menuItem" href="/blog" passHref>
          <p className="menuLabel">Blog</p>
        </Link>
        <Link className="menuItem" href="/about" passHref>
          <p className="menuLabel">About</p>
        </Link>
        <Link className="menuItem" href="/contact" passHref>
          <p className="menuLabel">Contact</p>
        </Link>
      </div>
    </>
  );
}

