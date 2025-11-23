"use client";

import { useState, useEffect } from "react";
import { FoundationCardSkeleton } from "./FoundationCardSkeleton";

export const ProjectAnalysisLoader = () => {
  const [showSkeletons, setShowSkeletons] = useState(false);

  useEffect(() => {
    // After 10 seconds, switch to skeleton cards
    const timer = setTimeout(() => {
      setShowSkeletons(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (showSkeletons) {
    // Show skeleton cards after 10 seconds
    return (
      <div className="h-full overflow-y-auto bg-slate-50 p-8">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md mb-2 w-2/3" />
          <div className="h-5 bg-gray-200 rounded-md w-1/2" />
        </div>

        {/* Foundation Card Skeletons */}
        <div className="space-y-0">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fadeIn"
            >
              <FoundationCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show spinner for first 10 seconds
  return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center animate-fadeIn">
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-[#1b98d5]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#1b98d5] rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 border-4 border-[#0065bd]/30 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analysiere deine Projektidee
        </h2>
        <p className="text-gray-600">
          Wir durchsuchen Tausende von Stiftungen für dich
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
          <span className="w-3 h-3 bg-[#1b98d5] rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
        </div>
      </div>
    </div>
  );
};

