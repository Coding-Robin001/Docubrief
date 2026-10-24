
import { getSession } from "@/lib/getSessions";

export type RequireUserResult =
  | { success: true; userId: string }
  | { success: false; message: string };

export async function requireUserId(): Promise<RequireUserResult> {
  try {
    const session = await getSession();

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