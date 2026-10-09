import React from 'react'

import { UtensilsCrossed } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <div className="relative mb-6 flex items-center justify-center">
        {/* Soft background glow behind the icon */}
        <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-xl"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <UtensilsCrossed className="h-10 w-10 animate-bounce" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400 sm:text-5xl">
        Still cooking...
      </h1>
      
      <p className="mt-3 text-base text-gray-400 max-w-sm">
        We are putting the finishing touches on our pricing plans. Check back soon!
      </p>
    </div>
  );
};

export default Pricing;