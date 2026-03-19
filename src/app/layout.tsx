import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeBackground } from "@/components/shared/theme-background";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyHub — Tu espacio de estudio inteligente",
  description: "Organiza tus ramos, genera resúmenes con IA, crea quizzes y prepara tus pruebas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StudyHub",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          themes={["light", "dark", "midnight", "aurora", "sunset"]}
          enableSystem={false}
          disableTransitionOnChange={false}
          storageKey="studyhub-theme"
        >
          <ThemeBackground />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
        <Script
          id="sw-register"
          strategy="afterInteractive"
          src="/register-sw.js"
        />
      </body>
    </html>
  );
}
