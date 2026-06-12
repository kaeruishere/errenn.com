import React from "react";

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <div className="flex items-center">
      <span className="relative inline-flex overflow-hidden rounded-full p-[2px]">
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c7ff22_0%,#75931d_50%,#c7ff22_100%)]" />
        <div className="inline-flex items-center justify-center w-full px-4 py-1.5 text-sm rounded-full bg-[#282828] text-white/80 font-bold backdrop-blur-3xl whitespace-nowrap">
          {children}
        </div>
      </span>
    </div>
  );
};
