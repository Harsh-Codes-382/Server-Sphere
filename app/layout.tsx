import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Server Sphere",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/* Use cn() and pass the white color on light mode else set the dark mode  using "dark:"*/}
        <body className={cn(font.className, "bg-white dark:bg-[#313338]")}>
          {/* We pass the all pages as a children in ThemeProvider So on every page you can see Dark Mode And all things are from Shadcn darkMode Docs  */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="Server-Sphere-theme">
              {/* Now all components are children of socketProvider */}
            <SocketProvider>
              {/* Here is ModalProvider which have all modals */}
              <ModalProvider />

              {children}
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
