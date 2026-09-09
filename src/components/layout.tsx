import type { Metadata } from "next";
import "./globals.css";
import DesignerContextProvider from "@/components/context/designerContext";
import NextTopLoader from "nextjs-toploader";
import NavbarWrapper from "@/components/navbarWrapper";


export const metadata: Metadata = {
  title: "FormWork",
  description: "A drag $ drop Form Builder App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    <html lang="en">
      <body
      >
        <NextTopLoader />
        <DesignerContextProvider>
          <NavbarWrapper />
          <main>
            {children}
          </main>
        </DesignerContextProvider>

      </body>
    </html>
  );
}
