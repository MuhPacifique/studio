
"use client"; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const storedLang = localStorage.getItem('mockUserLang') || 'kn'; // Default to Kinyarwanda
    
    document.documentElement.lang = storedLang;

    if (storedTheme) {
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); 
    } else {
      localStorage.setItem('theme', 'light'); 
    }
  }, []);

  return (
    <html lang="kn" suppressHydrationWarning>{/* Default to Kinyarwanda, will be updated by useEffect */}
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
