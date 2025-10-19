'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { UserSubscription } from '@/types';
import { hasAnalyticsAccess, hasStudyRoomsAccess } from '@/lib/subscription/tiers';

interface HamburgerMenuProps {
  currentUser: any;
  isAnonymous: boolean;
  subscription: UserSubscription | null;
  sessionsRemainingToday: number | null;
  onSignupClick: () => void;
}

export function HamburgerMenu({
  currentUser,
  isAnonymous,
  subscription,
  sessionsRemainingToday,
  onSignupClick,
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await auth.signOut();
    router.push('/');
  };

  const getTierDisplay = () => {
    if (isAnonymous) return 'Trial User';
    if (!subscription) return 'Free';

    const tierMap: Record<string, string> = {
      free: 'Free',
      focus: 'Focus+',
      student: 'Student',
      premium: 'Premium',
      lifetime: 'Lifetime',
    };

    return tierMap[subscription.tier] || 'Free';
  };

  const getTierColor = () => {
    if (isAnonymous || !subscription || subscription.tier === 'free') {
      return 'text-twilight-400';
    }

    const colorMap: Record<string, string> = {
      focus: 'text-blue-400',
      student: 'text-purple-400',
      premium: 'text-gold-400',
      lifetime: 'text-gold-300',
    };

    return colorMap[subscription.tier] || 'text-twilight-400';
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass rounded-full p-2 sm:p-3 transition-smooth hover:bg-twilight-600/30 flex items-center justify-center"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6 text-twilight-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 mt-2 w-72 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50 border border-twilight-600/30">
            {/* User Info Section */}
            <div className="p-4 border-b border-twilight-600/30 bg-twilight-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-twilight-600/50 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-twilight-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">
                    {isAnonymous ? 'Guest User' : currentUser?.email}
                  </div>
                  <div className={`text-xs font-medium ${getTierColor()}`}>
                    {getTierDisplay()}
                  </div>
                </div>
              </div>

              {isAnonymous && sessionsRemainingToday !== null && (
                <div className="mt-2 text-xs text-twilight-400">
                  {sessionsRemainingToday} trial sessions remaining
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <div className="py-2">
              {isAnonymous ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onSignupClick();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-twilight-600/30 transition-smooth flex items-center gap-3"
                >
                  <svg className="h-5 w-5 text-twilight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In / Sign Up</span>
                </button>
              ) : (
                <>
                  {/* Dashboard */}
                  {hasAnalyticsAccess(subscription) && (
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-twilight-600/30 transition-smooth flex items-center gap-3"
                    >
                      <svg className="h-5 w-5 text-twilight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analytics Dashboard</span>
                    </button>
                  )}

                  {/* Study Rooms */}
                  {hasStudyRoomsAccess(subscription) && (
                    <button
                      onClick={() => handleNavigation('/rooms')}
                      className="w-full px-4 py-3 text-left text-sm text-white hover:bg-twilight-600/30 transition-smooth flex items-center gap-3"
                    >
                      <svg className="h-5 w-5 text-twilight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Study Rooms</span>
                    </button>
                  )}

                  {/* Pricing & Upgrades */}
                  <button
                    onClick={() => handleNavigation('/pricing')}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-twilight-600/30 transition-smooth flex items-center gap-3"
                  >
                    <svg className="h-5 w-5 text-twilight-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Pricing & Upgrades</span>
                  </button>

                  <div className="my-2 border-t border-twilight-600/30" />

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 text-left text-sm text-red-300 hover:bg-red-900/20 transition-smooth flex items-center gap-3"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
