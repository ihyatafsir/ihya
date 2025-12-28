import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Tafsir al-Ihya | Imam al-Ghazali",
  description: "A Quran-centric exploration of the Ihya Ulum-id-Din by Imam al-Ghazali.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-parchment min-h-screen">
        <div className="flex">
          <Sidebar />
          <div className="flex-grow lg:pl-64">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
