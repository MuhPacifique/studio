
"use client";

import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: PageHeaderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'kn'>('kn');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const lang = localStorage.getItem('mockUserLang') as 'en' | 'kn' | null;
    if (lang) {
      setCurrentLanguage(lang);
    }
  }, []);

  // Placeholder for actual translation logic if needed directly in this component
  // For now, assuming labels in breadcrumbs are already translated or managed upstream
  const t = (enText: string, knText: string) => currentLanguage === 'kn' ? knText : enText;

  return (
    <div className="mb-6 border-b pb-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label={t("Breadcrumb", "Aho Ugeze", currentLanguage)} className="mb-2 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {isClient ? crumb.label : crumb.label} 
                  </Link>
                ) : (
                  <span>{isClient ? crumb.label : crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{isClient ? title : title}</h1>
        {children && <div className="mt-4 sm:mt-0">{children}</div>}
      </div>
    </div>
  );
}
