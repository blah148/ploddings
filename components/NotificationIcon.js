import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase'; // Ensure this path correctly points to your Supabase client setup

const NotificationIcon = ({ userId = null }) => {
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Fetch the count of unread notifications
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      if (userId) {
        try {
          const { error, count } = await supabase
            .from('notifications')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('read_receipt', false)
            .single();

          if (error && !count) {
            throw error;
          }

          setUnreadNotificationsCount(count);
					console.log('notificationicon count', count);
        } catch (error) {
          console.error('Error fetching unread notifications count:', error.message);
        }
      }
    };

    fetchUnreadNotificationsCount();
  }, [userId]); // Re-run the effect if userId changes

return (
  <svg className="notIcon" viewBox="0 0 36 36">
    <defs>
      <style>
        {`.cls-1 {
          fill: none;
        }`}
      </style>
    </defs>
    <path fill="#c3c7c7" transform="scale(0.85)" d="M28.7071,19.293,26,16.5859V13a10.0136,10.0136,0,0,0-9-9.9492V1H15V3.0508A10.0136,10.0136,0,0,0,6,13v3.5859L3.2929,19.293A1,1,0,0,0,3,20v3a1,1,0,0,0,1,1h7v.7768a5.152,5.152,0,0,0,4.5,5.1987A5.0057,5.0057,0,0,0,21,25V24h7a1,1,0,0,0,1-1V20A1,1,0,0,0,28.7071,19.293ZM19,25a3,3,0,0,1-6,0V24h6Zm8-3H5V20.4141L7.707,17.707A1,1,0,0,0,8,17V13a8,8,0,0,1,16,0v4a1,1,0,0,0,.293.707L27,20.4141Z"/>
    {unreadNotificationsCount > 0 && (
      <>
        <circle cx="24" cy="8" r="9.5" fill="red" />
        <text x="24" y="10" fontSize="17" fontWeight="700" marginBottom="3px" fill="white" textAnchor="middle" dominantBaseline="middle">
          {unreadNotificationsCount}
        </text>
      </>
    )}
    <rect fill="#c3c7c7" transform="scale(0.85)" id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="32" height="32"/>
  </svg>
);

};

export default NotificationIcon;

