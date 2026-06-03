import type { Metadata } from "next";
import { Outfit, Prompt } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-prompt",
});

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
    <html lang="en" className={`${outfit.variable} ${prompt.variable} antialiased`}>
      <body className="min-h-screen bg-savannah-bg text-giraffe-brown-dark font-sans giraffe-spots-bg">
        {children}
      </body>
    </html>
  );
}
