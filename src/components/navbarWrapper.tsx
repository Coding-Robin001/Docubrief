import Navbar from "./navbar";
import { getSession } from "@/lib/getSessions";
import { unstable_rethrow } from "next/navigation";

export default async function NavbarWrapper() {
  let session = null;

  try {
    session = await getSession();
  } catch (error) {
    unstable_rethrow(error);

    console.error("Navbar session fetch error:", error);
  }

  return <Navbar session={session} />;
}