import React, { useState } from "react";
import Stats from "./Stats";
import Hero from "./Hero";

const Home = () => {


  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero runs first, then calls onReady when done */}
      <Hero  />

      {/* Scrolling Development Notice */}
      {/* <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 border-y-2 border-yellow-600 overflow-hidden my-4">
        <div className="animate-marquee whitespace-nowrap py-2">
          <span className="inline-block text-black font-semibold text-sm md:text-base px-4">
            ⚠️ Development in Progress • Final release: 1st week of January 2026 or KICT FYP Showcase • Feedback welcome via email • Thank you for visiting!
          </span>
          <span className="inline-block text-black font-semibold text-sm md:text-base px-4">
            ⚠️ Development in Progress • Final release: 1st week of January 2026 or KICT FYP Showcase • Feedback welcome via email • Thank you for visiting!
          </span>
          <span className="inline-block text-black font-semibold text-sm md:text-base px-4">
            ⚠️ Development in Progress • Final release: 1st week of January 2026 or KICT FYP Showcase • Feedback welcome via email • Thank you for visiting!
          </span>
        </div>
      </div> */}

      {/* Stats waits until heroReady becomes true */}
      <Stats />
    </div>
  );
};

export default Home;
