import './globals.css';

export const metadata = {
  title: 'LEDGER',
  description: 'Farmer procurement & payment ledger',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
