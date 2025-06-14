
"use client"; // Required for useEffect

// Removed: import type { Metadata } from 'next'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from 'react';

// Removed static metadata export as it's not allowed in client components
// export const metadata: Metadata = {
//   title: 'MediServe Hub',
//   description: 'Your Integrated Health Companion',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Optionally save system preference
    } else {
      localStorage.setItem('theme', 'light'); // Default to light if no preference
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* These will provide the static title and description */}
        <title>MediServe Hub</title>
        <meta name="description" content="Your Integrated Health Companion" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
