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
        <Link className="menuItem" href="/about" passHref>
				<svg
					id="icon"
					width="32"
					height="32"
					viewBox="0 0 32 32"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<style>
							{`
								.cls-1 {
									fill: none;
								}
							`}
						</style>
					</defs>
					<polygon points="17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22" />
					<path d="M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z" />
					<path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
					<rect
						id="_Transparent_Rectangle_"
						data-name="<Transparent Rectangle>"
						className="cls-1"
						width="32"
						height="32"
					/>
				</svg>
          <p className="menuLabel">About</p>
        </Link>
      </div>
    </>
  );
}

