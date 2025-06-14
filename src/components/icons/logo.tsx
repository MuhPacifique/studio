
import React from 'react';

export function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-90"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
