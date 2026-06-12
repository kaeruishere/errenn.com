"use client";

import React, { useEffect, useState } from "react";
import { BoxLayout } from "@/layouts/BoxLayout";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  lang?: Lang;
  trData?: any;
}

export const Header: React.FC<HeaderProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.nav) ? trData : t(lang);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/en" || pathname === "/en/";
  const prefix = isHome ? "" : (lang === "tr" ? "/" : "/en");

  const links = [
    { href: `${prefix}#about`, text: tr.nav.about },
    { href: `${prefix}#work`, text: tr.nav.projects },
    { href: `${prefix}#experience`, text: tr.nav.experience },
    { href: `${prefix}#contact`, text: tr.nav.contact },
  ];

  const otherLang = lang === "tr" ? "EN" : "TR";
  
  const otherLangUrl = React.useMemo(() => {
    const isProjectsPage = pathname?.includes("/projects");
    if (lang === "tr") {
      return isProjectsPage ? "/en/projects" : "/en";
    } else {
      return isProjectsPage ? "/projects" : "/";
    }
  }, [lang, pathname]);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (sections.length === 0) return;

    let currentActiveId: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) return;

        const mostVisible = visibleEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );

        const targetId = mostVisible.target.id;
        if (targetId && targetId !== currentActiveId) {
          currentActiveId = targetId;
          setActiveId(targetId);
        }
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mx-auto w-fit">
      <BoxLayout isBlur hasBorder={false} className="my-0">
        <nav className="flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4 text-xs sm:text-sm md:text-base">
          {links.map(({ href, text }) => (
            <a
              key={href}
              href={href}
              className={`whitespace-nowrap hover:text-[var(--color-primary)] transition-colors ${
                activeId === href.slice(1) ? "active" : ""
              }`}
            >
              {text}
            </a>
          ))}
          <Link
            href={otherLangUrl}
            className="ml-1 sm:ml-2 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
            aria-label={`Switch to ${otherLang}`}
          >
            {otherLang}
          </Link>
        </nav>
      </BoxLayout>
    </header>
  );
};
