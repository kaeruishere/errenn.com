import React from "react";
import { SectionLayout } from "@/layouts/SectionLayout";
import { Card } from "@/components/Card";
import { Icon } from "./Icon";
import { ButtonIcon } from "./ButtonIcon";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface AboutProps {
  lang?: Lang;
  trData?: ReturnType<typeof t>;
}

export const About: React.FC<AboutProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.about) ? trData : t(lang);
  const technologies = tr.about.technologies || [];
  const half = Math.ceil(technologies.length / 2);
  const row1Techs = technologies.slice(0, half);
  const row2Techs = technologies.slice(half);

  return (
    <SectionLayout id="about" isDark={true}>
      <div className="flex flex-row items-center gap-3 text-3xl sm:text-4xl mb-6">
        <span className="bg-[#282828] text-accent p-2 rounded-lg">{tr.about.badge}</span>
        <h2>{tr.about.title}</h2>
      </div>

      <div className="flex flex-col gap-6">
        {/* Bio Card */}
        <Card isDark className="w-full">
          <h3 className="text-2xl font-semibold mb-4 text-center lg:text-left">{tr.about.whoTitle}</h3>
          <p 
            className="text-slate-300 leading-relaxed text-sm md:text-base text-center lg:text-left mb-6"
            dangerouslySetInnerHTML={{ __html: tr.about.bio1 || "" }}
          />
          <div className="flex justify-center lg:justify-start">
            <ButtonIcon
              name={tr.about.cvCardTitle || "Özgeçmiş (CV)"}
              url={tr.contact.cvUrl}
              iconName="pdf"
              isBlank
              animated
            />
          </div>
        </Card>

        {/* 3 Small Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card isDark contentDirection="row">
            <div className="bg-[#1e293b] p-3 rounded-xl mr-3 h-fit flex-shrink-0">
              <Icon name="student" className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {(tr.about as unknown as Record<string, string>).infoCard1Title || ""}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {(tr.about as unknown as Record<string, string>).infoCard1Text || ""}
              </p>
            </div>
          </Card>

          <Card isDark contentDirection="row">
            <div className="bg-[#1e293b] p-3 rounded-xl mr-3 h-fit flex-shrink-0">
              <Icon name="globe" className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {(tr.about as unknown as Record<string, string>).infoCard2Title || ""}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {(tr.about as unknown as Record<string, string>).infoCard2Text || ""}
              </p>
            </div>
          </Card>

          <Card isDark contentDirection="row">
            <div className="bg-[#1e293b] p-3 rounded-xl mr-3 h-fit flex-shrink-0">
              <Icon name="macbook" className="text-[var(--color-primary)] w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {(tr.about as unknown as Record<string, string>).infoCard3Title || ""}
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                {(tr.about as unknown as Record<string, string>).infoCard3Text || ""}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Raw Technology Marquees */}
      <div className="mt-10 flex flex-col gap-4">
        {/* Row 1: Right to Left */}
        <div className="relative w-full overflow-hidden mask-image-gradient py-1">
          <div className="flex gap-4 animate-marquee whitespace-nowrap">
            {[...row1Techs, ...row1Techs, ...row1Techs, ...row1Techs].map((tech, idx) => (
              <div
                key={`${tech.name}-r1-${idx}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-800/80 rounded-2xl bg-[#171e2d]/50 hover:bg-[#28323f]/50 hover:border-[var(--color-primary)]/40 transition-all duration-300 cursor-default"
              >
                <img src={tech.icon} alt={`${tech.name} logo`} className="w-6 h-6" />
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: Left to Right */}
        <div className="relative w-full overflow-hidden mask-image-gradient py-1">
          <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
            {[...row2Techs, ...row2Techs, ...row2Techs, ...row2Techs].map((tech, idx) => (
              <div
                key={`${tech.name}-r2-${idx}`}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-800/80 rounded-2xl bg-[#171e2d]/50 hover:bg-[#28323f]/50 hover:border-[var(--color-primary)]/40 transition-all duration-300 cursor-default"
              >
                <img src={tech.icon} alt={`${tech.name} logo`} className="w-6 h-6" />
                <span className="text-sm font-medium">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};
