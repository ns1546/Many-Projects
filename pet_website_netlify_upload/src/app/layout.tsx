import type { Metadata } from 'next';
import { Open_Sans, Poppins } from 'next/font/google';
import './globals.css';
import ClientToaster from '@/components/ClientToaster';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import NextTopLoader from 'nextjs-toploader';

const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'], 
  variable: '--font-poppins' 
});

export const metadata: Metadata = {
  title: 'Petopia - Premium Pet Supplies',
  description: 'Your one-stop shop for high-quality pet food, toys, and accessories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.variable} ${poppins.variable} font-sans bg-slate-50 text-slate-900 antialiased`} suppressHydrationWarning>
        <NextTopLoader color="#ef4444" showSpinner={false} shadow="0 0 10px #ef4444,0 0 5px #ef4444" />
        {children}
        <ClientToaster />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
