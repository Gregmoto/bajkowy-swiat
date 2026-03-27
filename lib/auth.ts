// Konfiguracja NextAuth.js — dostawcy autoryzacji, sesja, JWT
// Dokumentacja: https://next-auth.js.org
//
// Instalacja: npm install next-auth
//
// Dostawcy do skonfigurowania:
//   - CredentialsProvider (email + hasło)
//   - GoogleProvider (logowanie przez Google)
//
// Przykład konfiguracji:
//
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/lib/db";
//
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     CredentialsProvider({ ... })
//   ],
//   session: { strategy: "jwt" },
//   callbacks: {
//     session({ session, token }) { ... },
//     jwt({ token, user }) { ... },
//   },
// });

export const AUTH_CONFIG = {
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
};
