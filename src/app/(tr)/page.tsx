import React from "react";
import { MainLayout } from "@/layouts/MainLayout";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { getPortfolioData } from "@/lib/portfolio";

// Set to 0 to disable server-side caching so changes in Firestore are instant
export const revalidate = 0;

export default async function TrPage() {
  const lang = "tr";
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
