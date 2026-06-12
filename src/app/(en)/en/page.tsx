import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { getPortfolioData } from "@/lib/portfolio";

export const revalidate = 0;

export default async function EnPage() {
  const lang = "en";
  const trData = await getPortfolioData(lang);

  return (
    <MainLayout lang={lang} trData={trData}>
      <Hero lang={lang} trData={trData} />
      <About lang={lang} trData={trData} />
      <Projects lang={lang} trData={trData} />
      <Experience lang={lang} trData={trData} />
      <Contact lang={lang} trData={trData} />
    </MainLayout>
  );
}
