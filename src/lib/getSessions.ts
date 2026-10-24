
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// React's cache() shares the result within a single server render, so the
// navbar, the page and any helper that asks for the session in the same
// request trigger one lookup instead of three.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});