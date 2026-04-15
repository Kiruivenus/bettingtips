import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Betting Tips Today – Free & VIP Predictions | Sure Odds",
  description: "Get today's most accurate football betting tips FREE. Expert-verified predictions, sure odds & VIP picks updated daily. Join 2,000+ winning bettors now!",
  keywords: [
    "betting tips today",
    "free betting tips today",
    "sure odds today",
    "football predictions today",
    "vip betting tips",
    "best betting tips free",
    "daily betting tips and predictions",
    "sure football predictions today",
    "betting tips Kenya",
    "buy betting tips online",
    "accurate football predictions free",
  ],
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
  metadataBase: new URL('https://bettingtips-bay.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Platinum Picks',
    title: 'Best Betting Tips Today – Free & VIP Predictions | Sure Odds',
    description: "Today's most accurate football betting tips FREE. Expert-verified predictions, sure odds & VIP picks updated daily. 87%+ win rate.",
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Platinum Picks - Best Betting Tips Today',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Betting Tips Today – Free & VIP Predictions',
    description: "Free & premium football predictions with 87%+ win rate. Sure odds updated daily.",
    images: ['/logo.png'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* JSON-LD Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Platinum Picks",
              "url": "https://bettingtips-bay.vercel.app",
              "logo": "https://bettingtips-bay.vercel.app/logo.png",
              "description": "Expert football betting tips and predictions with verified win rates. Free and premium VIP tips updated daily.",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English"]
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Platinum Picks",
              "url": "https://bettingtips-bay.vercel.app",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://bettingtips-bay.vercel.app/free-tips?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Which payment methods do you accept?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We accept Credit/Debit Card, PayPal, M-Pesa, and manual bank transfer. Contact us via the form below for other payment options like Skrill, Neteller or Crypto."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How will I receive the tips after paying?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Tips are instantly unlocked in your account dashboard after your payment is verified. You'll also receive an email confirmation with instructions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are the betting tips genuine and verified?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "All our tips are logged publicly with full transparency. You can view our complete tips archive including wins and losses — we never hide our record."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you offer free betting tips?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! We publish free football betting tips daily. Our free picks are analyzed by our scouts. For higher-confidence premium picks, check our VIP subscription plans."
                  }
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Platinum Picks VIP Betting Tips",
              "description": "Premium football betting tips with 87%+ win rate. Expert-verified predictions updated daily.",
              "brand": {
                "@type": "Brand",
                "name": "Platinum Picks"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "2847",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
