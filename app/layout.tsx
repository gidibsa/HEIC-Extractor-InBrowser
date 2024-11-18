
import type { Metadata } from "next";
//import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Raleway } from 'next/font/google';

//const inter = Inter({ subsets: ["latin"] });
//<body className={inter.className}>

export const metadata: Metadata = {
  title: "HEIC Converter",
  description: "The HEIC converter is a tool that allows you to convert .heic format images into image formats or video formats",
  creator: "gidibs",
  keywords:"image converter, video converter, audio converter, unlimited image converter, unlimited video converter",
};

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={`${raleway.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark"]} disableTransitionOnChange> 
          <Navbar />

          <Toaster />

          <div className="pt-32 min-h-screen lg:pt-36 2xl:pt-44 container max-w-4xl lg:max-w-6xl 2xl:max-w-7xl">
            {children}
          </div>
          

        </ThemeProvider>
      </body>
    </html>
  );
}
