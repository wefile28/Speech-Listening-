import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speak&Listen | 1-on-1 Placement & Leveling Tool",
  description: "Premium animated giraffe-themed intake screening and class placement assessment tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-savannah-bg text-giraffe-brown-dark font-sans giraffe-spots-bg">
        {children}
      </body>
    </html>
  );
}
