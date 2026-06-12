import React from "react";

interface CardProps {
  isDark?: boolean;
  imageUrl?: string;
  contentDirection?: "row" | "col";
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  imageUrl,
  contentDirection = "col",
  className = "",
  children,
}) => {
  return (
    <div
      className={`group bg-[#171e2d] border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--color-primary)] flex flex-col ${className}`}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-slate-800">
          <img
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={imageUrl}
          />
        </div>
      )}
      <div
        className={`p-6 flex-grow flex ${
          contentDirection === "row" ? "flex-row items-center" : "flex-col"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
