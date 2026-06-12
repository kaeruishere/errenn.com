import type { Metadata, Viewport } from "next";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://errenn.com"),
  title: "Umut Eren Kaplan - Bilgisayar Mühendisi | Portfolyo",
  description:
    "Oyun geliştirme, mobil uygulamalar (Flutter) ve web teknolojilerine odaklanan bilgisayar mühendisi Umut Eren Kaplan'ın kişisel portfolyosu.",
  keywords: [
    "Umut Eren Kaplan",
    "Bilgisayar Mühendisi",
    "Geliştirici",
    "Flutter",
    "Unity",
    "Game Developer",
    "Web Geliştirici",
    "JavaScript",
    "Portfolyo",
    "C#",
    "Python",
  ],
  authors: [{ name: "Umut Eren Kaplan" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://errenn.com",
    languages: {
      tr: "https://errenn.com",
      en: "https://errenn.com/en",
      "x-default": "https://errenn.com",
    },
  },
  openGraph: {
    type: "website",
    url: "https://errenn.com",
    title: "Umut Eren Kaplan - Bilgisayar Mühendisi | Portfolyo",
    description:
      "Oyun geliştirme, mobil uygulamalar (Flutter) ve web teknolojilerine odaklanan bilgisayar mühendisi Umut Eren Kaplan'ın kişisel portfolyosu.",
    images: [{ url: "/img/me.jpeg" }],
    locale: "tr_TR",
    siteName: "Umut Eren Kaplan Portfolyo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umut Eren Kaplan - Bilgisayar Mühendisi | Portfolyo",
    description:
      "Oyun geliştirme, mobil uygulamalar (Flutter) ve web teknolojilerine odaklanan bilgisayar mühendisi Umut Eren Kaplan'ın kişisel portfolyosu.",
    images: ["/img/me.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#c7ff24",
};

export default function TrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth scroll-pt-20 h-full">
      <body className="min-h-full bg-dark text-light font-primary antialiased">
        {children}
      </body>
    </html>
  );
}
