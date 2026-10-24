
import Navbar from "./navbar";
import { getSession } from "@/lib/getSessions";


export default async function NavbarWrapper() {
  let session = null;

  try {
    session = await getSession();
  } catch (error) {
    // Log real database or connection failures so you can track them
    console.error("Navbar session fetch error:", error);
    // session remains null, but you know WHY it failed
  }

  return <Navbar session={session} />;
}