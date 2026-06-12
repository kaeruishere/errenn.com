import React from "react";

interface LinkProps {
  link: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({
  link,
  target,
  rel,
  children,
}) => {
  return (
    <a href={link} target={target} rel={rel} className="relative font-medium group">
      <span className="relative z-10 group-hover:text-[var(--color-dark)] transition-all duration-300">
        {children}
      </span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)] -z-10 group-hover:h-4.5 transition-all duration-300"></span>
    </a>
  );
};
