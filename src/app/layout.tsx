
"use client"; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // localStorage for theme and language preference is removed.
  // The app will default to Kinyarwanda ('kn') as set on the <html> tag.
  // Theme will default to OS/browser preference (light or dark).

  useEffect(() => {
    // Set lang attribute for accessibility, default to 'kn'
    document.documentElement.lang = 'kn';

    // Apply dark mode based on OS preference if no class is set
    if (!document.documentElement.classList.contains('light') && !document.documentElement.classList.contains('dark')) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.add('light'); // Default to light if no OS preference or OS prefers light
      }
    }
  }, []);

  return (
    <html lang="kn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>MediServe Hub</title>
        <meta name="description" content="Umufasha wawe w'Ubuzima Byose Hamwe" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
