import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Signum HFT - Automation",
  description: "Personal HFT Automation Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased bg-background text-foreground flex min-h-screen`} suppressHydrationWarning>
          {userId && <Sidebar />}
          <main className={`flex-1 overflow-y-auto ${userId ? 'p-8' : 'flex items-center justify-center'}`}>
            {children}
          </main>
          <Toaster theme="dark" position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
