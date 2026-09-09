"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/actions/auth-actions";
import { LogOut } from "lucide-react";
import { useState } from "react";

type Session = typeof auth.$Infer.Session;

export default function Navbar({ session }: { session: Session | null }) {
  const [signingOut, setSigningOut] = useState(false);

  const router = useRouter();

  const pathname = usePathname();

  const navLinks = [
    // { name: "home", href: "/home" },
    ...(session ? [] : [{ name: "Login", href: "/auth" }]),
    ...(session ? [{ name: "Forms", href: "/dashboard" }] : []),
    ...(session ? [{ name: "User", href: "/auth-dashboard" }] : []),
  ];

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/auth");
    setSigningOut(false);
  };

  return (
    <header className="border-b-[0.1px] border-gray-800 w-full flex items-center justify-between  bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-md border-emerald-900 shadow-md backdrop-blur-lg">
      <nav className="container mx-auto flex items-center justify-between px-3 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-wide flex items-center gap-2"
        >
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-orange-400 text-transparent bg-clip-text drop-shadow-sm">
            FormWork
          </h1>
        </Link>

        <div className="flex items-center gap-6">
          {/* Nav Links */}
          <ul className="hidden sm:flex gap-8">
            {navLinks.map((link, index) => {
              const active =
                pathname === link.href ||
                (pathname.startsWith(link.href) && link.href !== "/");

              return (
                <li key={index} className="relative">
                  <Link
                    href={link.href}
                    className={`text-[17px] relative transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-indigo-400 after:scale-x-0 after:origin-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left ${
                      active
                        ? "text-indigo-400 after:scale-x-100"
                        : "text-gray-300 hover:text-indigo-300"
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {session && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="bg-emerald-800/40 p-2 cursor-pointer rounded-lg hover:bg-emerald-700/50 transition"
              >
                {signingOut ? (
                  <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Placeholder */}
        <button className="sm:hidden text-white text-2xl">☰</button>
      </nav>
    </header>
  );
}
