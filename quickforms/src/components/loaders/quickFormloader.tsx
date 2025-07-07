"use client";

import React from 'react';

const QuickFormLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M20 15 H80 A5 5 0 0 1 85 20 V80 A5 5 0 0 1 80 85 H20 A5 5 0 0 1 15 80 V20 A5 5 0 0 1 20 15" 
              fill="none" 
              stroke="#E0E7FF" 
              strokeWidth="4"
            />
            <g stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" fill="none">
              <path d="M30 30 H70">
                <animate attributeName="stroke-dasharray" values="0 40; 40 0" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-dashoffset" values="0; -40" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M30 50 H40 V60 H30Z">
                <animate attributeName="stroke-dasharray" values="0 30; 30 0; 0 30" begin="0.5s" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-dashoffset" values="0; -30; 0" begin="0.5s" dur="2s" repeatCount="indefinite" />
              </path>
              <path d="M30 75 H70">
                 <animate attributeName="stroke-dasharray" values="0 40; 40 0" begin="1s" dur="2s" repeatCount="indefinite" />
                <animate attributeName="stroke-dashoffset" values="0; -40" begin="1s" dur="2s" repeatCount="indefinite" />
              </path>
            </g>
          </svg>
        </div>
        <p className="text-indigo-600 font-semibold mt-4 text-lg">Building your workspace...</p>
      </div>
    </div>
  );
};

export default QuickFormLoader;
