import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visual Focus Timer for MCAT, LSAT & Bar Exam Prep | There Is Still Time',
  description: 'Beautiful visual timer with hourglass animations designed for high-stakes exam prep students. Study 25-90 minute sessions with gentle reminders. Perfect for MCAT, LSAT, Bar Exam, and deep work. Built by a Gulf War veteran who knows what focus under pressure means. Free forever.',
  keywords: [
    'MCAT timer',
    'LSAT study timer',
    'Bar exam timer',
    'visual timer ADHD',
    'Pomodoro timer aesthetic',
    'study timer for students',
    'focus timer exam prep',
    'beautiful study timer',
    'hourglass timer',
    'deep work timer',
    'exam preparation timer',
    'medical school study timer',
    'law school study timer',
    'focus session timer',
    'time consciousness',
    'visual time tracking',
    'USMLE study timer',
    'CPA exam timer',
    'study with me timer',
  ],
  authors: [{ name: 'Christopher J. Bradley', url: 'https://christopherjbradley.com' }],
  creator: 'Christopher J. Bradley',
  publisher: 'There Is Still Time',
  applicationName: 'There Is Still Time',
  generator: 'Next.js',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#8b5cf6',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://app.thereisstilltime.com',
    siteName: 'There Is Still Time',
    title: 'Get Locked In and Achieve - Visual Focus Timer',
    description: 'Beautiful hourglass timer for exam prep and deep work. MCAT, LSAT, Bar Exam students love it. Built by a veteran who understands focus under pressure.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'There Is Still Time - Visual Focus Timer with beautiful hourglass animation',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@thereisstilltime',
    creator: '@chrisbpirate',
    title: 'Get Locked In and Achieve | There Is Still Time',
    description: 'Beautiful visual timer for exam prep students. MCAT, LSAT, Bar Exam. Free forever.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://app.thereisstilltime.com',
  },
  category: 'productivity',
};

// JSON-LD Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // WebApplication Schema
    {
      '@type': 'WebApplication',
      '@id': 'https://app.thereisstilltime.com/#webapp',
      name: 'There Is Still Time',
      alternateName: 'Visual Focus Timer',
      url: 'https://app.thereisstilltime.com',
      description: 'Beautiful visual timer with hourglass animations for exam prep students and deep work. Features 25, 50, and 90-minute focus sessions with customizable hourglasses.',
      applicationCategory: 'ProductivityApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Person',
        name: 'Christopher J. Bradley',
        url: 'https://christopherjbradley.com',
        description: 'Gulf War veteran, attorney, and creator of time consciousness tools',
      },
      featureList: [
        '25, 50, 90-minute focus sessions',
        'Beautiful hourglass animations',
        'Session tracking and statistics',
        'Custom hourglass creation',
        'Study room collaboration',
        'Milestone celebrations',
        'Free forever with premium options',
      ],
      screenshot: 'https://app.thereisstilltime.com/og-image.jpg',
    },
    // SoftwareApplication Schema
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://app.thereisstilltime.com/#software',
      name: 'There Is Still Time - Focus Timer',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Time Management',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: '1',
      },
    },
    // Organization Schema
    {
      '@type': 'Organization',
      '@id': 'https://app.thereisstilltime.com/#organization',
      name: 'There Is Still Time',
      url: 'https://thereisstilltime.com',
      logo: 'https://app.thereisstilltime.com/logo.png',
      description: 'Visual focus timers for time consciousness and meaningful deep work',
      founder: {
        '@type': 'Person',
        name: 'Christopher J. Bradley',
      },
      sameAs: [
        'https://christopherjbradley.com',
        'https://loveeveryone.love',
        'https://sunsetsforthesoul.com',
      ],
    },
    // WebSite Schema
    {
      '@type': 'WebSite',
      '@id': 'https://app.thereisstilltime.com/#website',
      url: 'https://app.thereisstilltime.com',
      name: 'There Is Still Time',
      description: 'Visual focus timer application',
      publisher: {
        '@id': 'https://app.thereisstilltime.com/#organization',
      },
    },
  ],
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

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="theme-zen min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
