import type { Metadata } from "next";
import "./globals.css";
import NavbarWrapper from "@/components/navbarWrapper";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "pdf-review",
  description: "AI powered pdf reviewer",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <NavbarWrapper />
        <NextTopLoader />
        <main>{children}</main>
        <footer>
          footer
        </footer>
      </body>
    </html>
  );
}
