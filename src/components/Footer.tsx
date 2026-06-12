import React from "react";
import { Icon } from "./Icon";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface FooterProps {
  lang?: Lang;
  trData?: any;
}

export const Footer: React.FC<FooterProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.footer) ? trData : t(lang);
  const currentYear = new Date().getFullYear();

  const socials = [
    { href: `mailto:${tr.contact.emailValue}`, icon: "envelope", label: "Email" },
    { href: tr.contact.linkedinUrl, icon: "linkedin", label: "LinkedIn" },
    { href: tr.contact.githubUrl, icon: "github", label: "GitHub" },
  ];

  return (
    <footer className="relative z-10 bg-[#171e2d] text-light border-t border-slate-800">
      <div className="relative max-w-[1200px] mx-auto p-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm order-2 sm:order-1">
          {tr.hero.name} &copy; {currentYear}
        </p>
        <div className="flex items-center gap-4 order-1 sm:order-2">
          {socials.map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-slate-500 hover:text-[var(--color-primary)] transition-colors duration-200"
            >
              <Icon name={icon} className="w-4 h-4" />
            </a>
          ))}
        </div>

        <p className="text-slate-600 text-xs order-3">
          {tr.footer.builtWith}{" "}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-[var(--color-primary)] transition-colors"
          >
            Next.js
          </a>{" "}
          {tr.footer.and}{" "}
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-[var(--color-primary)] transition-colors"
          >
            Tailwind
          </a>
        </p>
      </div>
    </footer>
  );
};
