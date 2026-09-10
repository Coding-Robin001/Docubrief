import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "@/lib/fonts";
import NavbarWrapper from "@/components/navbarWrapper";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "pdf-review",
  description: "AI powered pdf reviewer",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <NavbarWrapper />
        <NextTopLoader />
        <main>{children}</main>
        <footer className="bg-red-500 h-[50px]">
          footer
        </footer>
      </body>
    </html>
  );
}
