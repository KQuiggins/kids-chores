import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

import Link from 'next/link';
import Image from 'next/image';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50`}
      >
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <Image src="/logo.svg" alt="Chore Champions Logo" width={50} height={50} className="rounded-full shadow-sm" />
              <span className="text-2xl font-bold tracking-tight">Chore Champions</span>
            </Link>
            <nav className="space-x-2 md:space-x-4">
              <Link href="/manage-kids" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-purple-700 transition-colors">Manage Kids</Link>
              <Link href="/manage-chores" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-purple-700 transition-colors">Manage Chores</Link>
              <Link href="/assign-chores" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-white hover:text-purple-700 transition-colors">Assign Chores</Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
        
        <footer className="text-center p-6 mt-auto text-gray-500 border-t border-gray-200 bg-gray-100">
          <p>&copy; {new Date().getFullYear()} Chore Champions. Making chores fun!</p>
        </footer>
      </body>
    </html>
  );
}
