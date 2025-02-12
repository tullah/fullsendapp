"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string[];
  children: React.ReactNode;
  title: string;
}

export function Tooltip({ content, children, title }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Check if tooltip would be cut off at the top
      if (containerRect.top < tooltipRect.height + 8) {
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={containerRef}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          style={{ zIndex: 100 }}  // Ensure tooltip is above dialog
          className={`fixed transform ${position === 'top' 
            ? '-translate-y-full -mt-2' 
            : 'mt-2'}`}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg shadow-lg p-2 w-48">
            <div className="flex items-center justify-between mb-1.5">
              <div className="font-medium text-sm">{title}</div>
              <div className="text-[10px] text-gray-400">Rating Scale</div>
            </div>
            <p className="text-gray-300 text-[11px] mb-1.5">{content[0]}</p>
            <div className="space-y-0.5">
              {content.slice(1).map((item, index) => {
                const [range, desc] = item.split(':');
                return (
                  <div key={index} className="text-[11px] flex items-baseline gap-1.5 whitespace-nowrap">
                    <span className="text-gray-400 font-medium w-10">{range}</span>
                    <span className="text-gray-200">{desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 