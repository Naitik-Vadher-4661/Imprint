import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Imprint | Carbon Footprint Tracker',
  description: 'Understand, track, and reduce your carbon footprint through simple actions and personalized insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
