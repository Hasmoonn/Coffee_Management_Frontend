import type { Metadata } from "next";
import { Noto_Serif, Be_Vietnam_Pro, Work_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";

const headingFont = Noto_Serif({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-heading",
  display: "swap", // Prevent font flash
  fallback: ["serif"],
});

const bodyFont = Be_Vietnam_Pro({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-body",
  display: "swap", // Prevent font flash
  fallback: ["system-ui", "sans-serif"],
});

const labelFont = Work_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"], 
  style: ["normal", "italic"], 
  variable: "--font-label",
  display: "swap", // Prevent font flash
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Brew & Co | Specialty Coffee",
  description: "Experience cinematic, warm, and immersive coffee at Brew & Co.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  keywords: ["coffee", "specialty coffee", "brew", "cafe"],
  openGraph: {
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Preload critical fonts */}
        <link 
          rel="preload" 
          as="font" 
          href={`${headingFont.variable}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${bodyFont.variable} ${headingFont.variable} ${labelFont.variable} antialiased font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px border-[var(--color-outline-variant)]',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
