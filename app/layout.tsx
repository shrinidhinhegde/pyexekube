import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import {SidebarProvider} from "@/components/ui/sidebar";
import {cookies} from "next/headers";
import {Toaster} from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PyExeKube",
  description: "v0.0.1",
};

export default async function RootLayout({children}: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <>
      <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Providers>
        <SidebarProvider defaultOpen={defaultOpen}>
          <div className="flex h-screen w-full overflow-hidden">
            {children}
            <Toaster/>
          </div>
        </SidebarProvider>
      </Providers>
      </body>
      </html>
    </>
  );
}
