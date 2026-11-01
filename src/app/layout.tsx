import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "@/lib/fonts";
import NavbarWrapper from "@/components/navbarWrapper";
import NextTopLoader from "nextjs-toploader";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "DocuBrief AI",
  description: "AI powered pdf sumaries + chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <NavbarWrapper />
        <NextTopLoader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
