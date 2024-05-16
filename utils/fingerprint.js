// utils/fingerprint.js
import Fingerprint2 from 'fingerprintjs2';
import { supabase } from './supabase';

export async function getFingerprint() {
  const fpPromise = new Promise((resolve, reject) => {
    Fingerprint2.get((components) => {
      const values = components.map(component => component.value);
      const fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
      resolve(fingerprint);
    });
  });

  const fingerprint = await fpPromise;

  return fingerprint;
}

