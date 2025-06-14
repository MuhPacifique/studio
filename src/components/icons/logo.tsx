
import React from 'react';

export function LogoIcon(props: React.SVGProps<SVGSVGElement>) {
  // Default strokeWidth for the main shield outline if not provided in props
  const baseStrokeWidth = parseFloat(props.strokeWidth?.toString() || "2");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      // The className from props will merge with/override this.
      // Default h-6 w-6 is fine here, usage will dictate final size.
      className="h-6 w-6 transition-transform duration-500 ease-out group-hover:rotate-[360deg]"
      {...props} // Spread props first, so className in props can override
      strokeWidth={baseStrokeWidth.toString()} // Base stroke for the shield
    >
      {/* Shield shape - modern, slightly softer */}
      <path d="M12 2L3.5 5.5v5c0 4.4 3.8 8.2 8.5 9.5 4.7-1.3 8.5-5.1 8.5-9.5v-5L12 2z" />
      
      {/* Inner plus sign - make it slightly bolder than the shield outline */}
      <line x1="12" y1="9" x2="12" y2="15" strokeWidth={(baseStrokeWidth * 1.2).toString()} />
      <line x1="9" y1="12" x2="15" y2="12" strokeWidth={(baseStrokeWidth * 1.2).toString()} />

      {/* Subtle dot in the center of the plus - represents "hub" or focus */}
      {/* The dot's size should be relative to the baseStrokeWidth.
          It's filled, so stroke="none" and fill="currentColor". */}
      <circle cx="12" cy="12" r={(baseStrokeWidth * 0.6).toString()} fill="currentColor" stroke="none"/>
    </svg>
  );
}
