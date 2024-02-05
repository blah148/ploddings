import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import React, { useState, useEffect, createContext, useContext } from 'react';

export default function Account () {
	const { isAuthenticated, userId } = useAuth();
	
	return (
	
	<div>{userId}</div>

	);

}
