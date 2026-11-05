import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Handles every /api/auth/* request (sign up, log in, log out, session).
export const { GET, POST } = toNextJsHandler(auth);
