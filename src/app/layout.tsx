import type { Metadata } from "next";
import { Noto_Serif, Be_Vietnam_Pro, Work_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const headingFont = Noto_Serif({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-heading" 
});
const bodyFont = Be_Vietnam_Pro({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-body" 
});
const labelFont = Work_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-label" 
});

export const metadata: Metadata = {
  title: "Brew & Co | Specialty Coffee",
  description: "Experience cinematic, warm, and immersive coffee at Brew & Co.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${headingFont.variable} ${labelFont.variable} antialiased font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
