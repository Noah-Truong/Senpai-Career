import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { authOptions } from "./auth";

export async function auth() {
  try {
    const cookieStore = await cookies();
    
    // Get all cookies
    const allCookies = cookieStore.getAll();
    
    // Debug: log all cookie names in development
    if (process.env.NODE_ENV === "development") {
      console.log("Auth: Available cookies:", allCookies.map(c => c.name));
    }

    // Build cookie header for getToken - include ALL cookies
    const cookieHeader = allCookies
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: No cookies found");
      }
      return null;
    }

    // Use getToken with the cookie header
    // getToken will automatically find the session token cookie
    const token = await getToken({
      req: {
        headers: {
          cookie: cookieHeader,
        },
        url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      } as any,
      secret: authOptions.secret,
    });

    if (!token) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: getToken returned null - token not found or invalid");
      }
      return null;
    }

    if (!token.id || !token.email) {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth: Token missing required fields:", { 
          id: token.id, 
          email: token.email,
          hasRole: !!token.role 
        });
      }
      return null;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Auth: Successfully authenticated user:", token.email);
    }

    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as string,
        profilePhoto: (token as any).profilePhoto as string | undefined,
      },
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

