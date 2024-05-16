// components/FingerprintCapture.js
import React, { useEffect } from 'react';
import { getFingerprint } from '../utils/fingerprint';

export default function FingerprintCapture({ fingerprint }) {
  useEffect(() => {
    const fetchData = async () => {
      await getFingerprint();
    };
    fetchData();
  }, [fingerprint]); // Re-run effect when the fingerprint prop changes

  return null;
}

