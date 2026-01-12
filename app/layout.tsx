 import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Model from "./components/models/Model";
import "./globals.css";

import Navbar from "./components/navbar/Navbar";
import ClientOnly from "./components/ClientOnly";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Airbnb",
  description: "Airbnb Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientOnly>
          <Model isOpen/>
          <Navbar/>
        </ClientOnly>
        {children}
      </body>
    </html>
  );
}
