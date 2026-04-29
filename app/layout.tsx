import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoteSecure - Secure Online Voting',
  description: 'Nigeria\'s secure and transparent e-voting platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}