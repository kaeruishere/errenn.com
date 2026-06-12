"use client";

import React, { useEffect, useRef } from "react";

export const Spotlight: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      spotlight.style.setProperty("--x", e.clientX.toString());
      spotlight.style.setProperty("--y", e.clientY.toString());
    };

    const handleMouseEnter = () => {
      spotlight.classList.add("visible");
    };

    const handleMouseLeave = () => {
      spotlight.classList.remove("visible");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.addEventListener("mouseenter", handleMouseEnter);
      mainElement.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (mainElement) {
        mainElement.removeEventListener("mouseenter", handleMouseEnter);
        mainElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return <div className="spotlight" ref={spotlightRef} id="spotlight" />;
};
