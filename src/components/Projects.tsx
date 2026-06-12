import React from "react";
import { SectionLayout } from "@/layouts/SectionLayout";
import { ButtonIcon } from "./ButtonIcon";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface ProjectsProps {
  lang?: Lang;
  trData?: any;
}

export const Projects: React.FC<ProjectsProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.projects) ? trData : t(lang);
  const projects = tr.projects.items;

  const featuredProjects = React.useMemo(() => {
    const filtered = projects.filter((p: any) => p.featured);

    const getOrderIndex = (title: string) => {
      if (title.startsWith("JET10")) return 0;
      if (title.startsWith("Scrap Yard Smash")) return 1;
      if (title.startsWith("Yuvam")) return 2;
      if (title.startsWith("SMTP")) return 3;
      if (title.startsWith("Randevusu")) return 4;
      if (title.startsWith("KPSSLingo")) return 5;
      return 6;
    };

    return [...filtered].sort((a, b) => getOrderIndex(a.title) - getOrderIndex(b.title));
  }, [projects]);

  return (
    <SectionLayout id="work" isDark={true}>
      <div className="flex flex-row items-center gap-3 text-3xl z-1">
        <span className="bg-[#282828] text-accent p-2 rounded-lg">{tr.projects.badge}</span>
        <h2 className="text-4xl">{tr.projects.title}</h2>
      </div>

      <div className="mt-10 space-y-8">
        <p
          className="text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: tr.projects.intro || "" }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map(({ title, description, technologies, imageUrl, link, github }) => {
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
                    {technologies.map((tech: string) => (
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
        <div className="flex items-center justify-center mt-6">
          <ButtonIcon
            url={lang === "tr" ? "/projects" : "/en/projects"}
            name={tr.projects.viewAll}
            borderColor="var(--color-primary)"
          />
        </div>
      </div>
    </SectionLayout>
  );
};
