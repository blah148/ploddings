import React, { useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';

const VisitLogger = ({ page_type, page_id }) => {
  const { isAuthenticated, userId } = useAuth();
	console.log('is the user authenticated', isAuthenticated);

  useEffect(() => {
    // For guests, log visit to localStorage
    if (!isAuthenticated) {
      logLocalVisit(page_type, page_id);
    }
    
    // Log visit via API for all users, including guests
    logApiVisit(page_type, page_id, isAuthenticated, userId);
  }, [page_type, page_id, isAuthenticated, userId]);

  const logLocalVisit = (page_type, page_id) => {
    const visit = { page_type, page_id, timestamp: new Date().toISOString() };
    const visits = JSON.parse(localStorage.getItem('visit_history')) || [];
    visits.push(visit);
    if (visits.length > 20) {
      visits.shift(); // Remove the oldest entry
    }
    localStorage.setItem('visit_history', JSON.stringify(visits));
  };

  const logApiVisit = (page_type, page_id, isAuthenticated, userId) => {
    fetch('/api/log-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_type,
        page_id,
        isAuthenticated,
        userId: isAuthenticated ? userId : undefined,
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data.message))
    .catch(error => console.error('Error logging visit:', error));
  };

  // The component doesn't need to render anything
  return null;
};

export default VisitLogger;

