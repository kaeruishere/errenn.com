import React from "react";
import { Icon } from "./Icon";

interface ButtonIconProps {
  name: string;
  url: string;
  iconName?: string;
  isBlank?: boolean;
  animated?: boolean;
  borderColor?: string;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
  name,
  url,
  iconName,
  isBlank = false,
  animated = false,
  borderColor = "rgba(255, 255, 255, 0.3)",
}) => {
  return (
    <a
      href={url}
      target={isBlank ? "_blank" : "_self"}
      style={{ borderColor } as React.CSSProperties}
      className={`text-light px-4 py-2 rounded-3xl main-btn flex items-center overflow-hidden border ${
        animated ? "button-icon" : "gap-x-2"
      }`}
    >
      {iconName && (
        <Icon
          name={iconName}
          className={`flex-shrink-0 ${animated ? "icon-btn" : ""}`}
        />
      )}
      <span className={animated ? "button-text" : ""}>{name}</span>
    </a>
  );
};
