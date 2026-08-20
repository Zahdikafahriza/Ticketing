import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Tiket Pelanggan',
  description: 'Manajemen data pelanggan & tiket gangguan',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id" className="h-full bg-slate-50">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans text-slate-800 antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
