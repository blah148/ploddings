// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [userId, setUserId] = useState(null);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				// Include credentials in the fetch call
				const response = await fetch('/api/status', {
					credentials: 'include'
				});
				const data = await response.json();
				setIsAuthenticated(data.isAuthenticated);
				setUserId(data.userId);
			} catch (error) {
				console.error('Failed to verify auth status:', error);
				setIsAuthenticated(false);
				setUserId(null);
			}
		};
		
		checkAuthStatus();
	}, []);

  // Function to handle logout
  const logout = async () => {
    try {
      // Call the API to clear the cookie
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include' // Necessary to include the HttpOnly cookie
      });
      // Update the local state to reflect the logout
      setIsAuthenticated(false);
      setUserId(null);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // The value prop of the provider will include anything that we want to be accessible in the consuming components
  const value = {
    isAuthenticated,
		userId,
    login: () => setIsAuthenticated(true), // Placeholder for login logic
    logout: () => setIsAuthenticated(false), // Placeholder for logout logic
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

