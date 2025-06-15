
"use client"; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 

    // Set default language to Kinyarwanda on initial load
    document.documentElement.lang = 'kn';

    // Apply theme based on OS preference if no theme is already set
    const hasThemeClass = document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark');
    
    if (!hasThemeClass) { // Only apply OS theme if no theme class is present
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        // Default to light theme if OS preference is not dark or not detectable, and no theme is set
        document.documentElement.classList.add('light'); 
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
        {isClient && <Toaster />}
      </body>
    </html>
  );
}
