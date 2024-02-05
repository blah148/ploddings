// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const checkAuthStatus = async () => {
			try {
				// Include credentials in the fetch call
				const response = await fetch('/api/status', {
					credentials: 'include'
				});
				const data = await response.json();
				console.log('this is the authcontext test', data);
				setIsAuthenticated(data.isAuthenticated);
			} catch (error) {
				console.error('Failed to verify auth status:', error);
				setIsAuthenticated(false);
			}
		};
		
		checkAuthStatus();
	}, []);

  // The value prop of the provider will include anything that we want to be accessible in the consuming components
  const value = {
    isAuthenticated,
    login: () => setIsAuthenticated(true), // Placeholder for login logic
    logout: () => setIsAuthenticated(false), // Placeholder for logout logic
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

