import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'There Is Still Time - Focus Timer',
  description: 'A symbolic focus timer for meaningful deep work sessions',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b5cf6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="theme-zen min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
