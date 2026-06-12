import type { Metadata, Viewport } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://errenn.com"),
  title: "Umut Eren Kaplan - Computer Engineer | Portfolio",
  description:
    "Personal portfolio of Computer Engineer Umut Eren Kaplan, focusing on game development, mobile apps (Flutter), and web technologies.",
  keywords: [
    "Umut Eren Kaplan",
    "Computer Engineer",
    "Developer",
    "Flutter",
    "Unity",
    "Game Developer",
    "Web Developer",
    "C#",
    "Python",
    "Portfolio",
  ],
  authors: [{ name: "Umut Eren Kaplan" }],
  icons: {
    icon: "/favicon.svg",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://errenn.com/en",
    languages: {
      tr: "https://errenn.com",
      en: "https://errenn.com/en",
      "x-default": "https://errenn.com",
    },
  },
  openGraph: {
    type: "website",
    url: "https://errenn.com/en",
    title: "Umut Eren Kaplan - Computer Engineer | Portfolio",
    description:
      "Personal portfolio of Computer Engineer Umut Eren Kaplan, focusing on game development, mobile apps (Flutter), and web technologies.",
    images: [{ url: "/img/me.jpeg" }],
    locale: "en_US",
    siteName: "Umut Eren Kaplan Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Umut Eren Kaplan - Computer Engineer | Portfolio",
    description:
      "Personal portfolio of Computer Engineer Umut Eren Kaplan, focusing on game development, mobile apps (Flutter), and web technologies.",
    images: ["/img/me.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#c7ff24",
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth scroll-pt-20 h-full">
      <body className="min-h-full bg-dark text-light font-primary antialiased">
        {children}
      </body>
    </html>
  );
}
