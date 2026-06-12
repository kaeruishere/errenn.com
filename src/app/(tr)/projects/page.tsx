"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { SectionLayout } from "@/layouts/SectionLayout";
import { ButtonIcon } from "@/components/ButtonIcon";
import { t } from "@/i18n/translations";

export default function ProjectsPage() {
  const lang = "tr";
  const trStatic = t(lang);
  const [tr, setTr] = useState(trStatic);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const data = await response.json();
          if (data[lang]) {
            setTr(data[lang]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch dynamic portfolio data:", e);
      }
    };
    fetchPortfolio();
  }, []);

  const projects = tr.projects.items;

  return (
    <MainLayout lang={lang} trData={tr}>
      <SectionLayout id="all-projects" isDark={true} className="pt-28 min-h-screen">
        <div className="flex flex-col gap-4 mb-10 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Tüm Projelerim
          </h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Bugüne kadar geliştirdiğim oyun, mobil uygulama ve web tabanlı projelerin tamamı.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(({ title, description, technologies, imageUrl, link, github }) => {
            return (
              <div
                key={title}
                className="group bg-[#171e2d] border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-600 flex flex-col"
              >
                <a
                  className="aspect-video w-full overflow-hidden bg-slate-800"
                  href={link}
                  target="_blank"
                  rel="noopener nofollow"
                >
                  <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={imageUrl}
                  />
                </a>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-[10px] font-bold tracking-wider rounded-full bg-[#171e2d]/10 text-accent border border-[var(--color-primary)]/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold mb-3 dark:text-white group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
                  <div className="flex gap-2 justify-start mt-auto">
                    <ButtonIcon
                      url={link}
                      name={tr.projects.viewSite}
                      iconName="new-window"
                      isBlank
                      animated
                    />
                    <ButtonIcon
                      url={github}
                      name={tr.projects.viewRepo}
                      iconName="github"
                      isBlank
                      animated
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionLayout>
    </MainLayout>
  );
}
