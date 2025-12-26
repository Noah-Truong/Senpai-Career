import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth v5 beta - NextAuth returns an object with handlers, auth, signIn, signOut
// We need to destructure handlers first, then GET and POST from handlers
export const { handlers } = NextAuth(authOptions);

// Export GET and POST from handlers
export const { GET, POST } = handlers;

