import React from "react";
import { SectionLayout } from "@/layouts/SectionLayout";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface ExperienceProps {
  lang?: Lang;
  trData?: any;
}

export const Experience: React.FC<ExperienceProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.experience) ? trData : t(lang);
  const experiences = tr.experience.items;

  return (
    <SectionLayout id="experience" isDark={true}>
      <div className="flex flex-row items-center gap-3 text-3xl sm:text-4xl">
        <span className="bg-[#282828] text-accent p-2 rounded-lg">{tr.experience.badge}</span>
        <h2>{tr.experience.title}</h2>
      </div>
      <div className="relative mt-10">
        {experiences.map(({ company, role, duration, description, isWork }: any, index: number) => {
          return (
            <div key={company + role} className="relative space-y-12 pl-8 pb-8">
              {index !== experiences.length - 1 && (
                <div className="absolute left-0 top-2 bottom-0 w-0.5 h-full bg-[#282828]"></div>
              )}
              <div className="relative">
                <div
                  className={`absolute top-2 -left-[37px] w-3 h-3 rounded-full ${
                    isWork ? "bg-[var(--color-primary)]" : "bg-slate-500"
                  } z-10`}
                ></div>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{company}</h3>
                    <p
                      className={`${
                        isWork ? "text-accent font-semibold" : "text-slate-400 font-normal"
                      } text-base mb-2`}
                    >
                      {role}
                    </p>
                  </div>
                  <span
                    className={`text-[14px] font-semibold text-slate-300 bg-white/5 px-3 py-1 ring-1 ${
                      isWork ? "ring-[var(--color-primary)]" : "ring-slate-500/50"
                    } rounded-lg w-fit mb-4 md:mb-0`}
                  >
                    {duration}
                  </span>
                </div>
                <p
                  className="mt-1 text-slate-300 max-w-3xl leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: description || "" }}
                ></p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionLayout>
  );
};
