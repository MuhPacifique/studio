
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
    setIsClient(true); // Set isClient to true after mount

    document.documentElement.lang = 'kn';

    const hasThemeClass = document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark');
    
    if (!hasThemeClass) {
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
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
