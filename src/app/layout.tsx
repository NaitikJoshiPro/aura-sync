import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aura Sync | Synchronized Music",
  description: "Perfectly synchronized music playback across devices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="gradient-bg"></div>
        {children}
      </body>
    </html>
  );
}
