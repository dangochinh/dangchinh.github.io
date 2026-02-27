import { Quicksand } from 'next/font/google';
import './globals.css';

const quicksand = Quicksand({ subsets: ['vietnamese'], weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'Pe Thúi Tracker',
  description: 'Trợ lý theo dõi phát triển của bé',
  openGraph: {
    title: 'Pe Thúi Tracker',
    description: 'Trợ lý theo dõi phát triển của bé',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pe Thúi Tracker',
    description: 'Trợ lý theo dõi phát triển của bé',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={quicksand.className}>
        <main className="min-h-screen max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
