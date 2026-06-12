import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Panel - errenn.com",
  description: "Admin Console to manage portfolio contents",
  robots: "noindex, nofollow",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#11141c] text-slate-300 font-primary antialiased">
        {children}
      </body>
    </html>
  );
}
