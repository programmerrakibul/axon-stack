import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

// Export handlers for NextAuth route
export { handler as GET, handler as POST };
