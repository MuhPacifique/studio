
"use client";

import React from 'react'; // Removed useEffect, useState as lang is passed or defaulted
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string; // Label should now be pre-translated before being passed
  href?: string;
}

interface PageHeaderProps {
  title: string; // Title should be pre-translated
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

// Defaulting to Kinyarwanda for any internal text if needed, though ideally all display text comes via props.
const t = (enText: string, knText: string) => knText;

export function PageHeader({ title, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b pb-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label={t("Breadcrumb", "Aho Ugeze")} className="mb-2 text-sm text-muted-foreground">
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.label} 
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{title}</h1>
        {children && <div className="mt-4 sm:mt-0">{children}</div>}
      </div>
    </div>
  );
}
