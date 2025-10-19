'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing Firebase connection...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testFirebase() {
      try {
        // Test write
        setStatus('Testing write to Firestore...');
        const testRef = collection(db, 'test');
        const docRef = await addDoc(testRef, {
          message: 'Hello from test page',
          timestamp: new Date().toISOString(),
        });
        setStatus(`✅ Write successful! Doc ID: ${docRef.id}`);

        // Test read
        setTimeout(async () => {
          setStatus('Testing read from Firestore...');
          const querySnapshot = await getDocs(collection(db, 'test'));
          setStatus(
            `✅ Read successful! Found ${querySnapshot.docs.length} documents`
          );
        }, 1000);
      } catch (err: any) {
        setError(err.message);
        setStatus('❌ Firebase test failed');
        console.error('Firebase error:', err);
      }
    }

    testFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Firebase Connection Test</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-lg mb-2">Status: {status}</p>
        {error && (
          <div className="mt-4 p-4 bg-red-900 rounded">
            <p className="font-bold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
      <div className="mt-8">
        <a href="/" className="text-blue-400 hover:underline">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
