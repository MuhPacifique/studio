
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
      className="h-6 w-6 transition-transform duration-500 ease-out group-hover:rotate-[360deg]" // Added group-hover state
      {...props}
    >
      {/* Simple cross, can be more complex for a modern logo */}
      <path d="M12 5v14M5 12h14" />
      {/* Example of adding more elements for a modern feel - could be a stylized M or H */}
      {/* <path d="M6 18l6-10 6 10" />
      <path d="M6 6h12" />  */}
    </svg>
  );
}
