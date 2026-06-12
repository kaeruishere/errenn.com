"use client";

import React, { useState } from "react";
import { ButtonIcon } from "./ButtonIcon";
import { Icon } from "./Icon";
import { Card } from "./Card";
import type { Lang } from "@/i18n/translations";
import { t } from "@/i18n/translations";

interface ContactProps {
  lang?: Lang;
  trData?: any;
}

export const Contact: React.FC<ContactProps> = ({ lang = "tr", trData }) => {
  const tr = (trData && trData.contact) ? trData : t(lang);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(result.error || (tr.contact as any).formError || "An error occurred.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setErrorMessage((tr.contact as any).formError || "An error occurred.");
    }
  };

  return (
    <section className="full-width bg-[#191925] text-light" id="contact">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-32 py-24 sm:py-32">
        
        {/* Section Header */}
        <div className="flex flex-row items-center gap-3 text-3xl sm:text-4xl mb-12">
          <span className="bg-[#282828] text-accent p-2 rounded-lg">{tr.contact.badge}</span>
          <h2>{tr.contact.title}</h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Text and Social details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h3 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
              {tr.contact.headline}
            </h3>

            <p className="text-slate-300 leading-relaxed text-base md:text-lg">
              {tr.contact.subheadline}
            </p>

            {/* Email link with icon */}
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-[#171e2d] p-3 rounded-xl border border-slate-800 text-accent">
                <Icon name="envelope" className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{tr.contact.emailLabel}</span>
                <a
                  href={`mailto:${tr.contact.emailValue}`}
                  className="text-slate-300 hover:text-accent font-semibold transition-colors duration-200"
                >
                  {tr.contact.emailValue}
                </a>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <ButtonIcon
                isBlank
                iconName="pdf"
                url={tr.contact.cvUrl}
                borderColor="var(--color-primary)"
                name={tr.contact.cv}
              />
              <ButtonIcon
                isBlank
                iconName="linkedin"
                url={tr.contact.linkedinUrl}
                borderColor="rgba(255, 255, 255, 0.15)"
                name={tr.contact.linkedin}
              />
              <ButtonIcon
                isBlank
                iconName="github"
                url={tr.contact.githubUrl}
                borderColor="rgba(255, 255, 255, 0.15)"
                name={tr.contact.github}
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card className="w-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
                
                {/* Status Banners */}
                {status === "success" && (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-sm">{tr.contact.formSuccess || "Mesajınız başarıyla gönderildi!"}</p>
                      <button 
                        type="button" 
                        onClick={() => setStatus("idle")} 
                        className="text-xs underline hover:text-white mt-1 cursor-pointer"
                      >
                        {lang === "tr" ? "Yeni mesaj gönder" : "Send another message"}
                      </button>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="bg-rose-950/40 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="font-semibold text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {(tr.contact as any).formName}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={(tr.contact as any).formNamePlaceholder}
                      className="w-full bg-[#131924] border border-slate-800 rounded-xl px-4 py-3 text-light placeholder-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 text-sm"
                    />
                  </div>

                  {/* Email field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {(tr.contact as any).formEmail}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={(tr.contact as any).formEmailPlaceholder}
                      className="w-full bg-[#131924] border border-slate-800 rounded-xl px-4 py-3 text-light placeholder-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* Subject field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="subject" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {(tr.contact as any).formSubject}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={(tr.contact as any).formSubjectPlaceholder}
                    className="w-full bg-[#131924] border border-slate-800 rounded-xl px-4 py-3 text-light placeholder-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 text-sm"
                  />
                </div>

                {/* Message field */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {(tr.contact as any).formMessage}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={(tr.contact as any).formMessagePlaceholder}
                    className="w-full bg-[#131924] border border-slate-800 rounded-xl px-4 py-3 text-light placeholder-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all duration-200 text-sm resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full bg-accent hover:bg-accent/90 disabled:bg-slate-800 text-dark disabled:text-slate-500 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:translate-y-[-1px] active:translate-y-[1px] mt-2 text-sm uppercase tracking-wider font-primary"
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {(tr.contact as any).formSending}
                    </>
                  ) : (
                    (tr.contact as any).formSubmit
                  )}
                </button>
              </form>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};
