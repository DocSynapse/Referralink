/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface SentraLogoProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const SentraLogo: React.FC<SentraLogoProps> = ({ 
  size = 24, 
  className = "", 
  color = "currentColor",
  strokeWidth = 80
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 1200 1350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="translate(50, 25)">
        <path 
          d="M800 400C800 270.2 696.1 165 568 165C439.9 165 336 270.2 336 400C336 458.5 357.6 512 393.3 553L742.7 759C778.4 800 800 853.5 800 912C800 1041.8 696.1 1147 568 1147C439.9 1147 336 1041.8 336 912" 
          stroke={color} 
          strokeWidth={strokeWidth}
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};