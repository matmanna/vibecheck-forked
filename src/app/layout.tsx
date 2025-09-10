import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "vibecheck",
  description: "The powerful, yet straightforward personality-quiz platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
        ></link>

        <link
          href="https://fonts.googleapis.com/css2?family=Boldonse&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-base text-foreground scrollbar scrollbar-thumb-black dark:scrollbar-thumb-white bg-secondary-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="mx-auto max-w-[700px] px-5">
            {children}
            <Toaster richColors />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
