"use client";

import React from "react";
import { ButtonIcon } from "./ButtonIcon";
import { Icon } from "./Icon";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface HeroProps {
  lang?: Lang;
  trData?: any;
}

export const Hero: React.FC<HeroProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.hero) ? trData : t(lang);

  const roles = React.useMemo(() => {
    return tr.hero.role ? tr.hero.role.split(",").map((r: string) => r.trim()) : [];
  }, [tr.hero.role]);

  const [roleIndex, setRoleIndex] = React.useState(0);
  const [typedText, setTypedText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (roles.length === 0) return;
    
    const currentFullText = roles[roleIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText((prev) => prev.slice(0, -1));
      }, 40); // Deleting speed
    } else {
      timer = setTimeout(() => {
        setTypedText((prev) => currentFullText.slice(0, prev.length + 1));
      }, 80); // Typing speed
    }

    if (!isDeleting && typedText === currentFullText) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500); // Pause time before starting to delete
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, roleIndex, roles]);

  return (
    <section
      className="flex flex-row full-width h-screen bg-gradient-to-t to-[#282828] from-[#191925] text-light"
      id="home"
    >
      <div className="relative flex flex-col items-center justify-center mx-auto h-full p-4 max-w-[1200px] text-center gap-y-4 z-10">
        <img
          src="/img/me.png"
          alt={`${tr.hero.name} - ${tr.hero.role}`}
          className="rounded-full w-32 h-32 sm:w-40 sm:h-40 object-cover mx-auto"
        />
        <p className="font-light text-sm sm:text-base">{tr.hero.greeting}</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">{tr.hero.name}</h1>
        
        {/* Rotating Roles Subtitle with Typewriter effect */}
        {roles.length > 0 && (
          <div className="h-8 sm:h-10 flex items-center justify-center">
            <span
              className="text-accent font-medium text-lg sm:text-xl md:text-2xl typewriter-cursor pr-0.5"
            >
              {typedText}
            </span>
          </div>
        )}

        {/* Short Description */}
        <p className="font-light text-base text-slate-400 lg:text-lg leading-relaxed px-2 max-w-xl mt-2">
          {tr.hero.description}
        </p>
        <div className="flex gap-x-2.5">
          <ButtonIcon
            name={tr.hero.cta}
            url={`mailto:${tr.contact.emailValue}`}
            iconName="envelope"
            isBlank
            animated
          />
          <ButtonIcon
            name="LinkedIn"
            url={tr.contact.linkedinUrl}
            iconName="linkedin"
            isBlank
            animated
          />
          <ButtonIcon
            name="Github"
            url={tr.contact.githubUrl}
            iconName="github"
            isBlank
            animated
          />
        </div>
        <a
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          href="#about"
          aria-label={tr.hero.ariaDown}
        >
          <Icon
            name="arrow-down"
            className="w-12 h-12 mt-4 text-gray-600 cursor-pointer animate-bounce duration-500 hover:text-gray-200"
            aria-label={tr.hero.ariaDown}
          />
        </a>
      </div>
    </section>
  );
};
