import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Model from "./components/models/Model";
import "./globals.css";
import ToasterProvider from "./components/providers/Toasterprovider";
import LoginModel from "./components/models/LoginModel";
import RegisterModel from "./components/models/RegisterModel";
import Navbar from "./components/navbar/Navbar";
import ClientOnly from "./components/ClientOnly";
import SessionProvider from "./components/providers/SessionProvider";

const font = Geist_Mono({
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
      <body className={font.className}>
        <SessionProvider>
          <ClientOnly>
            <ToasterProvider />
            <RegisterModel />
            <LoginModel />
            <Navbar />
          </ClientOnly>
        </SessionProvider>


        {children}
      </body>
    </html>
  );
}
