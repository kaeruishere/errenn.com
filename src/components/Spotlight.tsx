"use client";

import React, { useEffect, useRef, useState } from "react";

interface SpotlightProps {
  mode?: "replace" | "follow";
}

export const Spotlight: React.FC<SpotlightProps> = ({ mode = "replace" }) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const ringSize = useRef({ w: 40, h: 40 });
  const ringRadius = useRef(50); // circular default
  const lastMagneticEl = useRef<HTMLElement | null>(null);

  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [isOverText, setIsOverText] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // 1. Accessibility check (prefers-reduced-motion)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 2. Hide/show default cursor based on mode & motion preference
  useEffect(() => {
    if (reducedMotion) return;

    if (mode === "replace") {
      document.documentElement.classList.add("hide-default-cursor");
    } else {
      document.documentElement.classList.remove("hide-default-cursor");
    }

    return () => {
      document.documentElement.classList.remove("hide-default-cursor");
    };
  }, [mode, reducedMotion]);

  // 3. Mouse activity & hover target listeners
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      setIsVisible(true);

      // Instantly move the inner dot to match mouse pointer
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);

    // Event delegation for static and dynamically rendered elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if interactive link/button/clickable icon
      const interactiveEl = target.closest(
        "a, button, [role='button'], .clickable, .button-icon"
      );
      if (interactiveEl) {
        setHoveredEl(interactiveEl as HTMLElement);
        setIsOverText(false);
        return;
      }

      // Check text inputs or textarea
      const isInput = target.closest("input, textarea");
      if (isInput) {
        setIsOverText(true);
        setHoveredEl(null);
        return;
      }

      // Check if text element for text selection indicator style
      const computedStyle = window.getComputedStyle(target);
      if (
        computedStyle.cursor === "text" ||
        ["P", "SPAN", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "CODE"].includes(target.tagName)
      ) {
        setIsOverText(true);
      } else {
        setIsOverText(false);
      }
      setHoveredEl(null);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const interactiveEl = target.closest(
        "a, button, [role='button'], .clickable, .button-icon"
      );
      if (interactiveEl && !interactiveEl.contains(e.relatedTarget as Node)) {
        setHoveredEl(null);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [reducedMotion]);

  // 4. Smooth Spring LERP (Linear Interpolation) loop
  useEffect(() => {
    if (reducedMotion) return;

    let animationFrameId: number;

    // Start coordinates in the middle of page
    if (ringPos.current.x === 0 && ringPos.current.y === 0) {
      ringPos.current.x = window.innerWidth / 2;
      ringPos.current.y = window.innerHeight / 2;
    }

    const updateRing = () => {
      const ring = ringRef.current;
      if (!ring) return;

      let targetX = mouse.current.x;
      let targetY = mouse.current.y;
      let targetW = 40;
      let targetH = 40;
      let targetRadius = 50; // Circular

      if (hoveredEl) {
        if (lastMagneticEl.current && lastMagneticEl.current !== hoveredEl) {
          const oldEl = lastMagneticEl.current;
          oldEl.style.transform = "";
          oldEl.style.transition = "";
        }

        const rect = hoveredEl.getBoundingClientRect();
        const padding = 6;

        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
        targetW = rect.width + padding * 2;
        targetH = rect.height + padding * 2;

        const computedStyle = window.getComputedStyle(hoveredEl);
        const br = parseFloat(computedStyle.borderRadius) || 0;
        targetRadius = br + padding;

        // Calculate vector from button center to mouse
        const dx = mouse.current.x - targetX;
        const dy = mouse.current.y - targetY;
        
        // 30% pull factor
        const pull = 0.3;
        let moveX = dx * pull;
        let moveY = dy * pull;

        // Clamp to a maximum of 12px displacement
        const maxDisplacement = 12;
        const distance = Math.hypot(moveX, moveY);
        if (distance > maxDisplacement) {
          const angle = Math.atan2(moveY, moveX);
          moveX = Math.cos(angle) * maxDisplacement;
          moveY = Math.sin(angle) * maxDisplacement;
        }

        // Apply magnetic pull to the button
        hoveredEl.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        hoveredEl.style.transition = "none";
        
        lastMagneticEl.current = hoveredEl;
      } else {
        if (lastMagneticEl.current) {
          const el = lastMagneticEl.current;
          el.style.transform = "translate3d(0, 0, 0)";
          el.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
          
          setTimeout(() => {
            if (el.style.transform === "translate3d(0px, 0px, 0px)") {
              el.style.transform = "";
              el.style.transition = "";
            }
          }, 300);
          
          lastMagneticEl.current = null;
        }

        if (isOverText) {
          // Text mode: Capsule bar
          targetW = 4;
          targetH = 24;
          targetRadius = 2;
        }
      }

      // Pressed state modifications
      if (isPressed) {
        targetW *= 0.75;
        targetH *= 0.75;
        if (targetRadius > 2 && !hoveredEl && !isOverText) {
          targetRadius = 50;
        } else if (targetRadius > 2) {
          targetRadius *= 0.75;
        }
      }

      // Apply smooth LERP calculations
      ringPos.current.x += (targetX - ringPos.current.x) * 0.15;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.15;
      ringSize.current.w += (targetW - ringSize.current.w) * 0.15;
      ringSize.current.h += (targetH - ringSize.current.h) * 0.15;

      if (!hoveredEl && !isOverText) {
        ringRadius.current += (50 - ringRadius.current) * 0.15;
      } else {
        ringRadius.current += (targetRadius - ringRadius.current) * 0.15;
      }

      // Apply transform and box properties
      ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      ring.style.width = `${ringSize.current.w}px`;
      ring.style.height = `${ringSize.current.h}px`;

      if (!hoveredEl && !isOverText) {
        ring.style.borderRadius = "50%";
      } else {
        ring.style.borderRadius = `${ringRadius.current}px`;
      }

      animationFrameId = requestAnimationFrame(updateRing);
    };

    animationFrameId = requestAnimationFrame(updateRing);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hoveredEl, isOverText, isPressed, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      {/* Outer Ring */}
      <div
        ref={ringRef}
        className={`custom-cursor-ring ${isVisible ? "visible" : ""} ${
          hoveredEl ? "hovering" : ""
        } ${isOverText ? "text-mode" : ""} ${isPressed ? "pressed" : ""}`}
      />
      {/* Inner Dot */}
      <div
        ref={dotRef}
        className={`custom-cursor-dot ${
          isVisible && !hoveredEl && !isOverText ? "visible" : ""
        } ${isPressed ? "pressed" : ""}`}
      />
    </>
  );
};
