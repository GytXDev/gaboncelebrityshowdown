// app/layout.js

import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gabon Celebrity Showdown',
  description: 'Célébrez les célébrités gabonaises et votez pour vos favorites!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Ajout du favicon SVG */}
        <link rel="icon" type="image/svg+xml" href="/logo-website.svg" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
