'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { doc, setDoc, getFirestore, Timestamp } from 'firebase/firestore';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const upgradeToLifetime = async () => {
    setLoading(true);
    setMessage('');

    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) {
      setMessage('❌ Not logged in! Please log in first.');
      setLoading(false);
      return;
    }

    const subscriptionRef = doc(db, 'subscriptions', user.uid);

    const subscriptionData = {
      tier: 'lifetime',
      status: 'active',
      startDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
      stripeCustomerId: 'manual_upgrade',
    };

    try {
      await setDoc(subscriptionRef, subscriptionData, { merge: true });
      setMessage(`✅ Success! ${user.email} upgraded to Lifetime tier. Refresh the page to see changes.`);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-twilight-950 via-twilight-900 to-twilight-950 flex items-center justify-center p-4">
      <div className="glass-strong rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-light text-white mb-6">Admin Panel</h1>

        <div className="space-y-4">
          <button
            onClick={upgradeToLifetime}
            disabled={loading}
            className="w-full py-3 px-4 bg-twilight-600 hover:bg-twilight-500 text-white rounded-lg font-medium transition-smooth disabled:opacity-50"
          >
            {loading ? 'Upgrading...' : 'Upgrade My Account to Lifetime'}
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${message.startsWith('✅') ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className={`text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-twilight-700">
            <p className="text-xs text-twilight-400">
              Current user: {auth.currentUser?.email || 'Not logged in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
