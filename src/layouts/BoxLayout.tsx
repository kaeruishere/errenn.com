import React from "react";

interface BoxLayoutProps {
  isDark?: boolean;
  isLigth?: boolean;
  isCol?: boolean;
  isBlur?: boolean;
  isCenter?: boolean;
  hasBorder?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const BoxLayout: React.FC<BoxLayoutProps> = ({
  isDark = false,
  isLigth = false,
  isCol = false,
  isBlur = false,
  isCenter = false,
  hasBorder = true,
  className = "",
  children,
}) => {
  const containerClasses = [
    "relative container mx-auto flex justify-center px-4 sm:px-8 rounded-2xl shadow-lg border border-slate-800 z-2",
    isBlur ? "backdrop-blur-[5px] bg-[#171e2d62]" : "",
    isDark ? "bg-[#161b22] text-light" : "",
    isLigth ? "bg-white text-dark" : "",
    isCol ? "flex-col py-8" : "flex-row py-4",
    isCenter ? "text-center" : "items-left text-left",
    hasBorder ? "hover:border-[var(--color-primary)] transition-all duration-[350ms]" : "border-slate-800",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`text-light my-5 ${className}`}>
      <div className={containerClasses}>{children}</div>
    </section>
  );
};
