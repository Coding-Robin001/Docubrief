// components/navbar-wrapper.tsx
import Navbar from "./navbar";
import { getSession } from "@/lib/getSessions";

export default async function NavbarWrapper() {
  let session = null;

  try {
    session = await getSession();
  } catch {}

  return <Navbar session={session} />;
}