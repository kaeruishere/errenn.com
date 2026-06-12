import React from "react";

interface SectionLayoutProps {
  id?: string;
  isDark?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  id,
  isDark = false,
  className = "",
  children,
}) => {
  return (
    <section
      id={id}
      className={`full-width h-full py-10 px-4 sm:px-8 lg:px-16 xl:px-32 ${
        isDark ? "bg-[#191925] text-light" : "bg-light text-dark"
      } ${className}`}
    >
      <div className="relative max-w-[1200px] mx-auto p-4 z-10">{children}</div>
    </section>
  );
};
