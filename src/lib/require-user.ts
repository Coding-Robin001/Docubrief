import { auth } from "@/lib/auth";
import { headers } from "next/headers";


// reusable across any server action that needs a logged-in user —
// pull this into its own file (e.g. @/lib/require-user) once you
// have a second or third action that needs it
type RequireUserResult =
  | { success: true; userId: string }
  | { success: false; message: string };

export async function requireUserId(): Promise<RequireUserResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, message: "You must be signed in to do that." };
    }

    return { success: true, userId: session.user.id };
  } catch (error) {
    console.error("requireUserId failed:", error);
    return {
      success: false,
      message: "Couldn't verify your session. Please try again.",
    };
  }
}