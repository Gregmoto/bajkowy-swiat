"use client";

// Hook do pobierania danych zalogowanego użytkownika
// Docelowo integruje się z next-auth useSession()
//
// import { useSession } from "next-auth/react";
//
// export function useUser() {
//   const { data: session, status } = useSession();
//   return {
//     user: session?.user,
//     zalogowany: status === "authenticated",
//     ladowanie: status === "loading",
//   };
// }

export function useUser() {
  // Tymczasowa implementacja bez auth
  return {
    user: null as null | { id: string; name: string; email: string },
    zalogowany: false,
    ladowanie: false,
  };
}
