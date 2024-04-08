import { supabase } from '../utils/supabase';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const NotificationIcon = ({ userId = null }) => {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const [notifications, setNotifications] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const fetchUnreadNotificationsCount = async () => {
    if (!userId) return;
    try {
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read_receipt', false);

      if (error) {
        console.error('Error fetching unread notifications count:', error.message);
        return;
      }

      setUnreadNotificationsCount(count);
    } catch (error) {
      console.error('Error in fetchUnreadNotificationsCount:', error.message);
    }
  };

  useEffect(() => {
    fetchUnreadNotificationsCount();
    // This effect runs when the component mounts and whenever userId changes
  }, [userId]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error.message);
        return;
      }
      setNotifications(data);
    };

      fetchNotifications();
  }, [userId, showMenu]);

  const markNotificationsAsRead = async () => {
    if (!notifications.length) return;
    const notificationIds = notifications.map((notification) => notification.id);

    const { error } = await supabase
      .from('notifications')
      .update({ read_receipt: true })
      .in('id', notificationIds);

    if (error) {
      console.error('Error updating notifications:', error.message);
      return;
    }

    // Refetch unread notifications count to reflect changes
    fetchUnreadNotificationsCount();
  };

  const toggleMenu = async () => {
    setShowMenu(!showMenu);
    if (!showMenu) { // If the menu is about to be opened
			setUnreadNotificationsCount(0);
      await markNotificationsAsRead();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diffInSeconds < minute) return `${diffInSeconds}s ago`;
    else if (diffInSeconds < hour) return `${Math.floor(diffInSeconds / minute)}m ago`;
    else if (diffInSeconds < day) return `${Math.floor(diffInSeconds / hour)}h ago`;
    else if (diffInSeconds < week) return `${Math.floor(diffInSeconds / day)}d ago`;
    else if (diffInSeconds < month) return `${Math.floor(diffInSeconds / week)}w ago`;
    else if (diffInSeconds < year) return `${Math.floor(diffInSeconds / month)}mo ago`;
    else return `${Math.floor(diffInSeconds / year)}y ago`;
  };

	function truncateHtmlText(htmlContent, maxLength) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlContent, 'text/html');
		let textContent = doc.body.textContent || "";

		if (textContent.length > maxLength) {
			textContent = textContent.substring(0, maxLength) + '...';
			// You will need to rebuild the HTML structure here if needed.
		}

		// Set the text content back into the HTML
		doc.body.textContent = textContent;

		// Serialize the new HTML
		return doc.body.innerHTML;
	}

	// Usage in your component
	const createMarkup = (htmlContent) => {
		const truncatedHtml = truncateHtmlText(htmlContent, 30);
		return { __html: truncatedHtml };
	};

  return (

	<>
		{notifications.length > 0 && (
			<>
				<svg onClick={toggleMenu} className="notIcon" viewBox="0 0 36 36">
					<defs>
						<style>
							{`.cls-1 { fill: none; }`}
						</style>
					</defs>
					<path fill="#c3c7c7" transform="scale(0.85)" d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>
					{unreadNotificationsCount > 0 && (
						<>
							<circle cx="24" cy="8" r="9.5" fill="red" />
							<text x="24" y="10" fontSize="17" fontWeight="700" fill="white" textAnchor="middle" dominantBaseline="middle">
								{unreadNotificationsCount}
							</text>
						</>
					)}
					<rect fill="#c3c7c7" transform="scale(0.85)" id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" className="cls-1" width="32" height="32"/>
				</svg>

				<div ref={menuRef} className={`menu ${showMenu ? 'show' : ''}`}>
						{notifications.map((notification) => (
							<div key={notification.id} className="notItem">
								<Link width="100%" href={notification.hyperlink} passHref>
									<div>
										<div
											dangerouslySetInnerHTML={{ __html: notification.body_text }}>
										</div>
										<div className="timestamp">{formatTimeAgo(notification.timestamp)}</div>
									</div>
										<div className={notification.read_receipt ? "greenDot" : "redDot"}></div>
								</Link>
							</div>
						))}
					<div className="separator"></div>
					<Link href="/account" passHref>
						<div className="viewAllButton">View all</div>
					</Link>
				</div>
			</>
		)}
	</>

  );
};

export default NotificationIcon;
